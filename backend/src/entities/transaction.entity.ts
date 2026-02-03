import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 }) // Для грошей краще decimal
  amount: number;

  @Column({
    type: 'enum',
    enum: ['income', 'expense', 'saving'], // Згідно з твоїми кругами на макеті
    default: 'expense'
  })
  type: string;

  @Column()
  category: string;

  @CreateDateColumn() // Автоматично ставить дату створення
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.transactions)
  user: User;
}