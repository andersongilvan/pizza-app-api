import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTablePasswordResetToken1793137465808 implements MigrationInterface {
  name = 'CreateTablePasswordResetToken1793137465808'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tb_password_reset_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "token_hash" character varying(64) NOT NULL, "expires_at" TIMESTAMP NOT NULL, "used_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_63b0502e3bdfaae60108dd5c189" UNIQUE ("token_hash"), CONSTRAINT "PK_137cffd3a4f886583a366b2fd18" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_05f7d2d1e4b23597939f153c28" ON "tb_password_reset_tokens" ("user_id")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_05f7d2d1e4b23597939f153c28"`,
    )
    await queryRunner.query(`DROP TABLE "tb_password_reset_tokens"`)
  }
}
