import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1710000000000 implements MigrationInterface {
  name = 'InitSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "user" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "telegramId" character varying NOT NULL,
      "userName" character varying,
      "referralCode" character varying NOT NULL,
      "referredBy" character varying,
      "currency" character varying NOT NULL DEFAULT 'EUR',
      "incomeCategories" jsonb NOT NULL DEFAULT '[]'::jsonb,
      "expenseCategories" jsonb NOT NULL DEFAULT '[]'::jsonb,
      "sphereLayout" jsonb,
      "quickTransactionsLimit" integer NOT NULL DEFAULT 3,
      "news" jsonb NOT NULL DEFAULT '[]'::jsonb,
      "goalsPreferences" jsonb NOT NULL DEFAULT '{"theme":"default","visualizationMode":"amount"}'::jsonb,
      "sessionTokenHash" character varying,
      "isOnline" boolean NOT NULL DEFAULT false,
      "firstSeenAt" TIMESTAMP NOT NULL DEFAULT now(),
      "lastSeenAt" TIMESTAMP,
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"),
      CONSTRAINT "UQ_user_telegramId" UNIQUE ("telegramId"),
      CONSTRAINT "UQ_user_referralCode" UNIQUE ("referralCode")
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "transaction" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "amount" numeric(10,2) NOT NULL,
      "type" character varying NOT NULL,
      "category" character varying NOT NULL,
      "label" character varying,
      "date" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "userId" uuid NOT NULL,
      CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"),
      CONSTRAINT "FK_transaction_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
    )`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_transaction_userId" ON "transaction" ("userId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_transaction_userId"');
    await queryRunner.query('DROP TABLE IF EXISTS "transaction"');
    await queryRunner.query('DROP TABLE IF EXISTS "user"');
  }
}