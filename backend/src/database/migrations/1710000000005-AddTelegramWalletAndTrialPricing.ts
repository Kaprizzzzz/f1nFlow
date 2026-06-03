import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTelegramWalletAndTrialPricing1710000000005 implements MigrationInterface {
  name = 'AddTelegramWalletAndTrialPricing1710000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "telegramWalletId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "telegramWalletConnected" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "telegramWalletConnectedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `UPDATE "subscription_plan" SET "priceUsd" = 5.00, "name" = 'Goals Pro 7 days' WHERE "code" = 'goals_pro_monthly'`,
    );
    await queryRunner.query(
      `UPDATE "subscription_plan" SET "priceUsd" = 19.99, "name" = 'Goals Pro 30 days' WHERE "code" = 'goals_pro_yearly'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "subscription_plan" SET "priceUsd" = 4.99, "name" = 'Goals Pro Monthly' WHERE "code" = 'goals_pro_monthly'`,
    );
    await queryRunner.query(
      `UPDATE "subscription_plan" SET "priceUsd" = 29.99, "name" = 'Goals Pro Yearly' WHERE "code" = 'goals_pro_yearly'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "telegramWalletConnectedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "telegramWalletConnected"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "telegramWalletId"`,
    );
  }
}
