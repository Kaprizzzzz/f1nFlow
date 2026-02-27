 import { Injectable, NotFoundException } from '@nestjs/common';
 import { InjectRepository } from '@nestjs/typeorm';
 import { Repository } from 'typeorm';
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
 
 @Injectable()
 export class UsersService {
   constructor(
     @InjectRepository(User)
     private usersRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>
   ) {}
 
   async findOrCreateUser(telegramId: string, userName: string): Promise<User> {
     let user = await this.usersRepository.findOne({ where: { telegramId } });
 
     if (!user) {
       user = this.usersRepository.create({
         telegramId,
         userName,
         referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        lastSeenAt: new Date(),
        isOnline: true
       });
    } else {
      user.userName = userName || user.userName;
      user.isOnline = true;
      user.lastSeenAt = new Date();
    }

    return this.usersRepository.save(user);
  }

  async getUserState(telegramId: string) {
    const user = await this.usersRepository.findOne({
      where: { telegramId },
      relations: { transactions: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user,
      transactions: user.transactions
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
    const user = await this.usersRepository.findOne({ where: { telegramId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

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
    const user = await this.usersRepository.findOne({ where: { telegramId } });

    if (!user) {
      throw new NotFoundException('User not found');
     }

    user.isOnline = isOnline;
    user.lastSeenAt = new Date();
    return this.usersRepository.save(user);
   }
}
