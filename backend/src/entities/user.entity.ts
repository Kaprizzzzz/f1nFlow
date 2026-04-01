import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
 import { Transaction } from './transaction.entity';
 
  export type SphereLayout = Record<'income' | 'expense' | 'saving' | 'news' | 'recent', { left: number; top: number }>;
  export type GoalsPreferences = {
    theme: 'default' | 'girly';
    visualizationMode: 'amount' | 'segments';
  };

  export type WeeklyChallenge = {
  category: string;
  limit: number;
  spent: number;
  weekStart: string;
  completed: boolean;
};

 @Entity()
 export class User {
  @PrimaryGeneratedColumn('uuid')
   id: string;
 
  @Column({ unique: true })
   telegramId: string;
 
   @Column({ nullable: true })
   userName: string;
 
   @Column({ unique: true })
   referralCode: string;
 
   @Column({ nullable: true })
   referredBy: string | null;
 
  @Column({ default: 'EUR' })
  currency: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  incomeCategories: Array<{ name: string; amount: number; icon?: string }>;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  expenseCategories: Array<{ name: string; amount: number; icon?: string }>;

  @Column({ type: 'jsonb', nullable: true })
  sphereLayout: SphereLayout | null;

  @Column({ type: 'int', default: 3 })
  quickTransactionsLimit: number;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  news: Array<{ id: string; title: string; isRead: boolean }>;

  @Column({ type: 'int', default: 0 })
  streakCurrent: number;

  @Column({ type: 'int', default: 0 })
  streakBest: number;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  badges: string[];

  @Column({ type: 'jsonb', nullable: true })
  weeklyChallenge: WeeklyChallenge | null;

  @Column({
    type: 'jsonb',
    default: () => '\'{"theme":"default","visualizationMode":"amount"}\'::jsonb'
  })
  goalsPreferences: GoalsPreferences;

  @Column({ nullable: true })
  sessionTokenHash: string | null;

  @Column({ default: false })
  isOnline: boolean;

  @CreateDateColumn()
  firstSeenAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastSeenAt: Date | null;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.user, { cascade: true })
   transactions: Transaction[];
}
