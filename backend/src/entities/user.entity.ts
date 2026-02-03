import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid') // Справжній UUID
  id: string;

  @Column({ unique: true }) // Telegram ID має бути унікальним
  telegramId: string;

  @Column({ nullable: true })
  userName: string;

  @Column({ unique: true })
  referralCode: string;

  @Column({ nullable: true })
  referredBy: string;

  // Зв'язок: один користувач має багато транзакцій
  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];
}