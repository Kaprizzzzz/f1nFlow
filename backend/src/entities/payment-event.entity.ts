import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PaymentEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  subscriptionId: string | null;

  @Column()
  eventType: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  amountUsd: string | null;

  @Column({ nullable: true })
  provider: string | null;

  @Column({ nullable: true })
  providerRef: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}
