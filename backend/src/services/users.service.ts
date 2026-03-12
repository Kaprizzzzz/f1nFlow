import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Transaction } from '../entities/transaction.entity';
import { SaveStateDto } from '../common/dto';



interface EnsureUserPayload {
  telegramId: string;
  userName?: string;
  referredBy?: string;
}  

 @Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>
   ) {}
 
   async findOrCreateUser(telegramId: string, userName: string, referredBy?: string): Promise<User> {
    if (telegramId === 'server-render') {
      throw new BadRequestException('Cannot create user for server-render profile');
    }
     let user = await this.usersRepository.findOne({ where: { telegramId } });
 
     if (!user) {
       user = await this.createUserSafely(telegramId, userName, referredBy);
    } else {
      user.userName = userName || user.userName;
      user.isOnline = true;
      user.lastSeenAt = new Date();
      user = await this.usersRepository.save(user);
    }
    return user;
  }

  async issueSessionToken(userId: string): Promise<string> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = randomBytes(32).toString('hex');
    user.sessionTokenHash = this.hashToken(token);
    await this.usersRepository.save(user);
    return token;
  }

  async findBySessionToken(token: string): Promise<User | null> {
    if (!token) {
      return null;
    }

    return this.usersRepository.findOne({ where: { sessionTokenHash: this.hashToken(token) } });
  }

  async getUserState(telegramId: string) {
    const user = await this.ensureUser({ telegramId });
    const hydratedUser = await this.usersRepository.findOne({
      where: { id: user.id },
      relations: { transactions: true }
    });

    if (!hydratedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      user: hydratedUser,
      transactions: hydratedUser.transactions
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((item) => ({
          id: item.id,
          amount: Number(item.amount),
          category: item.category,
          type: item.type,
          date: item.date,
          label: item.label
        }))
    };
  }

  async saveUserState(telegramId: string, payload: SaveStateDto) {
    const user = await this.ensureUser({ telegramId });

    user.currency = payload.currency ?? user.currency;
    user.incomeCategories = payload.incomeCategories ?? user.incomeCategories ?? [];
    user.expenseCategories = payload.expenseCategories ?? user.expenseCategories ?? [];
    user.sphereLayout = payload.sphereLayout ?? user.sphereLayout;
    user.quickTransactionsLimit = payload.quickTransactionsLimit ?? user.quickTransactionsLimit ?? 3;
    user.news = payload.news ?? user.news ?? [];
    user.lastSeenAt = new Date();

    await this.usersRepository.save(user);

    if (payload.transactions) {
      await this.transactionsRepository.delete({ userId: user.id });
      if (payload.transactions.length > 0) {
        const nextTransactions = payload.transactions.map((tx) =>
          this.transactionsRepository.create({
            amount: tx.amount,
            category: tx.category,
            type: tx.type,
            date: new Date(tx.date),
            label: tx.label,
            userId: user.id
          })
        );
        await this.transactionsRepository.save(nextTransactions);
      }
    }

    return this.getUserState(telegramId);
  }

  async updatePresence(telegramId: string, isOnline: boolean) {
    const user = await this.ensureUser({ telegramId });

    user.isOnline = isOnline;
    user.lastSeenAt = new Date();
    return this.usersRepository.save(user);
   }

   async getReferralOverview(telegramId: string) {
    const user = await this.ensureUser({ telegramId });

    const invitedPeople = await this.usersRepository.find({
      where: [{ referredBy: user.referralCode }, { referredBy: user.id }],
      order: { firstSeenAt: 'DESC' }
    });

    const topRows = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.referredBy', 'referrer')
      .addSelect('COUNT(user.id)', 'referralsCount')
      .where('user.referredBy IS NOT NULL')
      .andWhere("TRIM(user.referredBy) <> ''")
      .groupBy('user.referredBy')
      .orderBy('COUNT(user.id)', 'DESC')
      .limit(100)
      .getRawMany<{ referrer: string; referralsCount: string }>();

    const topReferrers = await Promise.all(
      topRows.map(async (row) => {
        const referrerUser = await this.usersRepository.findOne({
          where: [{ referralCode: row.referrer }, { id: row.referrer }]
        });

        return {
          id: referrerUser?.id || `external-${row.referrer}`,
          name: referrerUser?.userName || `User ${row.referrer.slice(0, 6)}`,
          joinedAt: referrerUser?.firstSeenAt || new Date(),
          referralsCount: Number(row.referralsCount)
        };
      })
    );

    return {
      referralCode: user.referralCode,
      invitedPeople: invitedPeople.map((person) => ({
        id: person.id,
        name: person.userName || `User ${person.telegramId.slice(-4)}`,
        joinedAt: person.firstSeenAt,
        referralsCount: 0
      })),
      topReferrers
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async createUserSafely(telegramId: string, userName?: string, referredBy?: string): Promise<User> {
    try {
      return await this.usersRepository.save(
        this.usersRepository.create({
          telegramId,
          userName: userName || `Guest ${telegramId.slice(-4)}`,
          referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          referredBy: referredBy?.trim() || null,
          lastSeenAt: new Date(),
          isOnline: true
        })
      );
    } catch (error) {
      if (!(error instanceof QueryFailedError) || (error as { code?: string }).code !== '23505') {
        throw error;
      }

      const existing = await this.usersRepository.findOne({ where: { telegramId } });
      if (!existing) {
        throw error;
      }
      return existing;
    }
  }

   private async ensureUser({ telegramId, userName, referredBy }: EnsureUserPayload): Promise<User> {
    const existing = await this.usersRepository.findOne({ where: { telegramId } });
    if (existing) {
      if (userName && existing.userName !== userName) {
        existing.userName = userName;
        return this.usersRepository.save(existing);
      }
      return existing;
    }

    return this.createUserSafely(telegramId, userName, referredBy);
  }
} 

