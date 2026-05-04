import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SecurityAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string | null;

  @Column()
  eventType: string;

  @Column({ default: 'info' })
  severity: 'info' | 'warning' | 'critical';

  @Column({ nullable: true })
  ipAddress: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}
