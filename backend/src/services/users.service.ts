 import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
 import { InjectRepository } from '@nestjs/typeorm';
 import { QueryFailedError, Repository } from 'typeorm';
 import { User } from '../entities/user.entity';
 import { Transaction } from '../entities/transaction.entity';

interface SaveStatePayload {
  currency?: string;
  incomeCategories?: Array<{ name: string; amount: number; icon?: string }>;
  expenseCategories?: Array<{ name: string; amount: number; icon?: string }>;
  sphereLayout?: User['sphereLayout'];
  transactions?: Array<{
    amount: number;
    category: string;
    type: 'plus' | 'minus';
    date: string;
    label?: string;
  }>;
}
 
interface EnsureUserPayload {
  telegramId: string;
  userName?: string;
}  

 @Injectable()
 export class UsersService {
   constructor(
     @InjectRepository(User)
     private usersRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>
   ) {}
 
   async findOrCreateUser(telegramId: string, userName: string): Promise<User> {
    if (telegramId === 'server-render') {
      throw new BadRequestException('Cannot create user for server-render profile');
    }
     let user = await this.usersRepository.findOne({ where: { telegramId } });
 
     if (!user) {
       user = await this.createUserSafely(telegramId, userName);
    } else {
      user.userName = userName || user.userName;
      user.isOnline = true;
      user.lastSeenAt = new Date();
      user = await this.usersRepository.save(user);
    }
    return user;
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

  async saveUserState(telegramId: string, payload: SaveStatePayload) {
    const user = await this.ensureUser({ telegramId });

    user.currency = payload.currency ?? user.currency;
    user.incomeCategories = payload.incomeCategories ?? user.incomeCategories ?? [];
    user.expenseCategories = payload.expenseCategories ?? user.expenseCategories ?? [];
    user.sphereLayout = payload.sphereLayout ?? user.sphereLayout;
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

   private async createUserSafely(telegramId: string, userName?: string): Promise<User> {
    try {
      return await this.usersRepository.save(
        this.usersRepository.create({
          telegramId,
          userName: userName || `Guest ${telegramId.slice(-4)}`,
          referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
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

   private async ensureUser({ telegramId, userName }: EnsureUserPayload): Promise<User> {
    const existing = await this.usersRepository.findOne({ where: { telegramId } });
    if (existing) {
      if (userName && existing.userName !== userName) {
        existing.userName = userName;
        return this.usersRepository.save(existing);
      }
      return existing;
    }

    return this.createUserSafely(telegramId, userName);
  }
} 

