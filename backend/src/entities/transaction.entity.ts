import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
 import { User } from './user.entity';
 
 @Entity()
 export class Transaction {
   @PrimaryGeneratedColumn('uuid')
   id: string;
 
  @Column('decimal', { precision: 10, scale: 2 })
   amount: number;
 
  @Column({ type: 'varchar' })
  type: 'plus' | 'minus';
 
   @Column()
   category: string;
 
  @Column({ nullable: true })
  label?: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @CreateDateColumn()
   createdAt: Date;
 
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
   user: User;
}
