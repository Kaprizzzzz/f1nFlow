import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Transaction } from '../entities/transaction.entity';
import {
  Subscription,
  SubscriptionStatus,
} from '../entities/subscription.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { PaymentEvent } from '../entities/payment-event.entity';
import { ConsentLog } from '../entities/consent-log.entity';
import { SecurityAuditLog } from '../entities/security-audit-log.entity';
import { SaveStateDto } from '../common/dto';
import {
  IncomingTransaction,
  UserEngagementService,
} from './user-engagement.service';

const MAX_TRANSACTIONS_PER_SAVE = 1000;

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
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private plansRepository: Repository<SubscriptionPlan>,
    @InjectRepository(PaymentEvent)
    private paymentEventsRepository: Repository<PaymentEvent>,
    @InjectRepository(ConsentLog)
    private consentLogsRepository: Repository<ConsentLog>,
    @InjectRepository(SecurityAuditLog)
    private securityAuditRepository: Repository<SecurityAuditLog>,
    private dataSource: DataSource,
    private userEngagementService: UserEngagementService,
  ) {}

  async findOrCreateUser(
    telegramId: string,
    userName: string,
    referredBy?: string,
  ): Promise<User> {
    if (telegramId === 'server-render') {
      throw new BadRequestException(
        'Cannot create user for server-render profile',
      );
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
    await this.securityAuditRepository.save(
      this.securityAuditRepository.create({
        userId,
        eventType: 'session_token_issued',
      }),
    );
    return token;
  }

  async getBillingOverview(telegramId: string) {
    const user = await this.ensureUser({ telegramId });
    const plans = await this.plansRepository.find({
      where: { isActive: true },
      order: { intervalCount: 'ASC' },
    });
    const activeSubscription = await this.subscriptionsRepository.findOne({
      where: { userId: user.id, status: SubscriptionStatus.ACTIVE },
      relations: { plan: true },
    });
    return { plans, activeSubscription };
  }

  async activateSubscription(telegramId: string, planCode: string) {
    const user = await this.ensureUser({ telegramId });
    const plan = await this.plansRepository.findOne({
      where: { code: planCode, isActive: true },
    });
    if (!plan) throw new NotFoundException('Plan not found');

    await this.subscriptionsRepository.update(
      { userId: user.id, status: SubscriptionStatus.ACTIVE },
      { status: SubscriptionStatus.CANCELED, canceledAt: new Date() },
    );
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(
      expiresAt.getDate() +
        (plan.interval === 'year'
          ? 365 * plan.intervalCount
          : 30 * plan.intervalCount),
    );
    const subscription = await this.subscriptionsRepository.save(
      this.subscriptionsRepository.create({
        userId: user.id,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        startedAt: now,
        expiresAt,
        canceledAt: null,
      }),
    );
    await this.paymentEventsRepository.save(
      this.paymentEventsRepository.create({
        userId: user.id,
        subscriptionId: subscription.id,
        eventType: 'subscription_activated',
        amountUsd: plan.priceUsd,
        provider: 'manual',
        providerRef: null,
        metadata: { planCode },
      }),
    );
    return { subscription };
  }

  async recordConsent(
    telegramId: string,
    documentType: 'privacy' | 'terms',
    documentVersion: string,
    ipAddress?: string,
  ) {
    const user = await this.ensureUser({ telegramId });
    return this.consentLogsRepository.save(
      this.consentLogsRepository.create({
        userId: user.id,
        documentType,
        documentVersion,
        accepted: true,
        ipAddress: ipAddress || null,
      }),
    );
  }

  async findBySessionToken(token: string): Promise<User | null> {
    if (!token) {
      return null;
    }

    return this.usersRepository.findOne({
      where: { sessionTokenHash: this.hashToken(token) },
    });
  }

  async getUserState(telegramId: string) {
    const user = await this.ensureUser({ telegramId });
    const hydratedUser = await this.usersRepository.findOne({
      where: { id: user.id },
      relations: { transactions: true },
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
          label: item.label,
        })),
    };
  }

  async saveUserState(telegramId: string, payload: SaveStateDto) {
    const user = await this.ensureUser({ telegramId });

    if (
      payload.transactions &&
      payload.transactions.length > MAX_TRANSACTIONS_PER_SAVE
    ) {
      throw new BadRequestException(
        `Too many transactions in one request. Max allowed: ${MAX_TRANSACTIONS_PER_SAVE}`,
      );
    }

    await this.dataSource.transaction(async (manager) => {
      const txUsersRepository = manager.getRepository(User);
      const txTransactionsRepository = manager.getRepository(Transaction);
      const userToUpdate = await txUsersRepository.findOne({
        where: { id: user.id },
      });

      if (!userToUpdate) {
        throw new NotFoundException('User not found');
      }
      const previousLastSeen = userToUpdate.lastSeenAt;
      userToUpdate.currency = payload.currency ?? userToUpdate.currency;
      userToUpdate.language = payload.language ?? userToUpdate.language ?? 'en';
      userToUpdate.incomeCategories =
        payload.incomeCategories ?? userToUpdate.incomeCategories ?? [];
      userToUpdate.expenseCategories =
        payload.expenseCategories ?? userToUpdate.expenseCategories ?? [];
      userToUpdate.sphereLayout =
        payload.sphereLayout ?? userToUpdate.sphereLayout;
      userToUpdate.quickTransactionsLimit =
        payload.quickTransactionsLimit ??
        userToUpdate.quickTransactionsLimit ??
        3;
      userToUpdate.news = payload.news ?? userToUpdate.news ?? [];
      userToUpdate.streakCurrent =
        payload.streakCurrent ?? userToUpdate.streakCurrent ?? 0;
      userToUpdate.streakBest =
        payload.streakBest ?? userToUpdate.streakBest ?? 0;
      userToUpdate.badges = payload.badges ?? userToUpdate.badges ?? [];
      userToUpdate.goalsPreferences = payload.goalsPreferences ??
        userToUpdate.goalsPreferences ?? {
          theme: 'default',
          visualizationMode: 'amount',
        };
      const now = new Date();
      userToUpdate.lastSeenAt = now;

      const incomingTransactions: IncomingTransaction[] = payload.transactions
        ? payload.transactions.map((tx) => ({
            amount: tx.amount,
            category: tx.category,
            type: tx.type,
            date: tx.date,
            label: tx.label,
          }))
        : (
            await txTransactionsRepository.find({ where: { userId: user.id } })
          ).map((tx) => ({
            amount: Number(tx.amount),
            category: tx.category,
            type: tx.type,
            date: tx.date,
            label: tx.label,
          }));

      this.userEngagementService.applyEngagementState(
        userToUpdate,
        incomingTransactions,
        previousLastSeen,
        now,
      );

      await txUsersRepository.save(userToUpdate);

      if (payload.transactions) {
        await txTransactionsRepository.delete({ userId: user.id });
        if (payload.transactions.length > 0) {
          const nextTransactions = payload.transactions.map((tx) =>
            txTransactionsRepository.create({
              amount: tx.amount,
              category: tx.category,
              type: tx.type,
              date: new Date(tx.date),
              label: tx.label,
              userId: user.id,
            }),
          );
          await txTransactionsRepository.save(nextTransactions);
        }
      }
    });
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
      order: { firstSeenAt: 'DESC' },
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
          where: [{ referralCode: row.referrer }, { id: row.referrer }],
        });

        return {
          id: referrerUser?.id || `external-${row.referrer}`,
          name: referrerUser?.userName || `User ${row.referrer.slice(0, 6)}`,
          joinedAt: referrerUser?.firstSeenAt || new Date(),
          referralsCount: Number(row.referralsCount),
        };
      }),
    );

    return {
      referralCode: user.referralCode,
      invitedPeople: invitedPeople.map((person) => ({
        id: person.id,
        name: person.userName || `User ${person.telegramId.slice(-4)}`,
        joinedAt: person.firstSeenAt,
        referralsCount: 0,
      })),
      topReferrers,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async createUserSafely(
    telegramId: string,
    userName?: string,
    referredBy?: string,
  ): Promise<User> {
    try {
      return await this.usersRepository.save(
        this.usersRepository.create({
          telegramId,
          userName: userName || `Guest ${telegramId.slice(-4)}`,
          referralCode: Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase(),
          referredBy: referredBy?.trim() || null,
          lastSeenAt: new Date(),
          isOnline: true,
        }),
      );
    } catch (error) {
      if (
        !(error instanceof QueryFailedError) ||
        (error as { code?: string }).code !== '23505'
      ) {
        throw error;
      }

      const existing = await this.usersRepository.findOne({
        where: { telegramId },
      });
      if (!existing) {
        throw error;
      }
      return existing;
    }
  }

  private async ensureUser({
    telegramId,
    userName,
    referredBy,
  }: EnsureUserPayload): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: { telegramId },
    });
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
