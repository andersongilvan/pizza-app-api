import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddInviteExpiresAt1793117955843 implements MigrationInterface {
  name = 'AddInviteExpiresAt1793117955843'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tb_invites" ADD "expires_at" TIMESTAMP NOT NULL`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tb_invites" DROP COLUMN "expires_at"`)
  }
}
