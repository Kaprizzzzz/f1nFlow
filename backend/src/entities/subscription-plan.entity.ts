import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Subscription } from './subscription.entity';

export enum PlanInterval {
  MONTH = 'month',
  YEAR = 'year'
}

@Entity()
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: PlanInterval })
  interval: PlanInterval;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  priceUsd: string;

  @Column({ type: 'int' })
  intervalCount: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Subscription, (subscription) => subscription.plan)
  subscriptions: Subscription[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
