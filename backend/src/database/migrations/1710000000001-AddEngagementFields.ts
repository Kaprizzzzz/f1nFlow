import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEngagementFields1710000000001 implements MigrationInterface {
  name = 'AddEngagementFields1710000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "streakCurrent" integer NOT NULL DEFAULT 0');
    await queryRunner.query('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "streakBest" integer NOT NULL DEFAULT 0');
    await queryRunner.query('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "badges" jsonb NOT NULL DEFAULT \'[]\'::jsonb');
    await queryRunner.query('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "weeklyChallenge" jsonb');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN IF EXISTS "weeklyChallenge"');
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN IF EXISTS "badges"');
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN IF EXISTS "streakBest"');
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN IF EXISTS "streakCurrent"');
  }
}