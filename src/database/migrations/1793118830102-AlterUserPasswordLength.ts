import { MigrationInterface, QueryRunner } from 'typeorm'

export class AlterUserPasswordLength1793118830102 implements MigrationInterface {
  name = 'AlterUserPasswordLength1793118830102'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tb_users" ALTER COLUMN "password_hash" TYPE character varying(255)`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tb_users" ALTER COLUMN "password_hash" TYPE character varying(50)`,
    )
  }
}
