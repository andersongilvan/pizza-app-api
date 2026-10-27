import { MigrationInterface, QueryRunner } from 'typeorm'

export class UserEmailUnique1793113861105 implements MigrationInterface {
  name = 'UserEmailUnique1793113861105'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tb_users" ADD CONSTRAINT "UQ_142ce3112f446974f1c96a5d3ff" UNIQUE ("email")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tb_users" DROP CONSTRAINT "UQ_142ce3112f446974f1c96a5d3ff"`,
    )
  }
}
