import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ConsentLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  documentType: 'privacy' | 'terms';

  @Column()
  documentVersion: string;

  @Column({ default: true })
  accepted: boolean;

  @Column({ nullable: true })
  ipAddress: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
