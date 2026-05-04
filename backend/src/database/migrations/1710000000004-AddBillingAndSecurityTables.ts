import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBillingAndSecurityTables1710000000004 implements MigrationInterface {
  name = 'AddBillingAndSecurityTables1710000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."subscription_plan_interval_enum" AS ENUM('month', 'year')`);
    await queryRunner.query(`CREATE TABLE "subscription_plan" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "name" character varying NOT NULL, "interval" "public"."subscription_plan_interval_enum" NOT NULL, "priceUsd" numeric(10,2) NOT NULL, "intervalCount" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_plan_code" UNIQUE ("code"), CONSTRAINT "PK_subscription_plan" PRIMARY KEY ("id"))`);

    await queryRunner.query(`CREATE TYPE "public"."subscription_status_enum" AS ENUM('active', 'canceled', 'expired', 'trial')`);
    await queryRunner.query(`CREATE TABLE "subscription" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "planId" uuid NOT NULL, "status" "public"."subscription_status_enum" NOT NULL DEFAULT 'active', "startedAt" TIMESTAMP NOT NULL, "expiresAt" TIMESTAMP, "canceledAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_subscription" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "subscription" ADD CONSTRAINT "FK_subscription_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "subscription" ADD CONSTRAINT "FK_subscription_plan" FOREIGN KEY ("planId") REFERENCES "subscription_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

    await queryRunner.query(`CREATE TABLE "payment_event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "subscriptionId" uuid, "eventType" character varying NOT NULL, "amountUsd" numeric(10,2), "provider" character varying, "providerRef" character varying, "metadata" jsonb NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_payment_event" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "consent_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "documentType" character varying NOT NULL, "documentVersion" character varying NOT NULL, "accepted" boolean NOT NULL DEFAULT true, "ipAddress" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_consent_log" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "security_audit_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "eventType" character varying NOT NULL, "severity" character varying NOT NULL DEFAULT 'info', "ipAddress" character varying, "metadata" jsonb NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_security_audit_log" PRIMARY KEY ("id"))`);

    await queryRunner.query(`INSERT INTO "subscription_plan" ("code","name","interval","priceUsd","intervalCount","isActive") VALUES ('goals_pro_monthly','Goals Pro Monthly','month',4.99,1,true), ('goals_pro_yearly','Goals Pro Yearly','year',29.99,1,true)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "security_audit_log"`);
    await queryRunner.query(`DROP TABLE "consent_log"`);
    await queryRunner.query(`DROP TABLE "payment_event"`);
    await queryRunner.query(`ALTER TABLE "subscription" DROP CONSTRAINT "FK_subscription_plan"`);
    await queryRunner.query(`ALTER TABLE "subscription" DROP CONSTRAINT "FK_subscription_user"`);
    await queryRunner.query(`DROP TABLE "subscription"`);
    await queryRunner.query(`DROP TYPE "public"."subscription_status_enum"`);
    await queryRunner.query(`DROP TABLE "subscription_plan"`);
    await queryRunner.query(`DROP TYPE "public"."subscription_plan_interval_enum"`);
  }
}
