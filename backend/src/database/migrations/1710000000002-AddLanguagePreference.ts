import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLanguagePreference1710000000002 implements MigrationInterface {
  name = 'AddLanguagePreference1710000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "language" character varying NOT NULL DEFAULT \'uk\'');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN IF EXISTS "language"');
  }
}
