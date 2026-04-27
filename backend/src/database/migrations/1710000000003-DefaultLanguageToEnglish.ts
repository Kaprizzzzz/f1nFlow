import { MigrationInterface, QueryRunner } from 'typeorm';

export class DefaultLanguageToEnglish1710000000003 implements MigrationInterface {
  name = 'DefaultLanguageToEnglish1710000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE \"user\" ALTER COLUMN \"language\" SET DEFAULT 'en'");
    await queryRunner.query("UPDATE \"user\" SET \"language\" = 'en' WHERE \"language\" IS NULL OR \"language\" = 'uk'");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE \"user\" ALTER COLUMN \"language\" SET DEFAULT 'uk'");
  }
}
