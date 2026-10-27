import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTableUser1793113602788 implements MigrationInterface {
  name = 'CreateTableUser1793113602788'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tb_users_role_enum" AS ENUM('ADMIN', 'STAFF')`,
    )
    await queryRunner.query(
      `CREATE TABLE "tb_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "email" character varying(100) NOT NULL, "password_hash" character varying(50) NOT NULL, "role" "public"."tb_users_role_enum" NOT NULL DEFAULT 'STAFF', CONSTRAINT "PK_a2c23e0679749c22ffa6c2be910" PRIMARY KEY ("id"))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tb_users"`)
    await queryRunner.query(`DROP TYPE "public"."tb_users_role_enum"`)
  }
}
