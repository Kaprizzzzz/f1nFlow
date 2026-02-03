import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  referrerId: string; // ID того, хто запросив (UUID)

  @Column()
  referredId: string; // ID того, кого запросили (UUID)

  @Column({ default: false })
  bonusAwarded: boolean;
}