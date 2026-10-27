import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTableInvite1793117471810 implements MigrationInterface {
  name = 'CreateTableInvite1793117471810'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tb_invites" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(64) NOT NULL, "invited_email" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "used_at" TIMESTAMP, CONSTRAINT "UQ_8c1987f61d8edca5d0f1feaa12e" UNIQUE ("code"), CONSTRAINT "PK_d3de79356dbcd69214321cbe9aa" PRIMARY KEY ("id"))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tb_invites"`)
  }
}
