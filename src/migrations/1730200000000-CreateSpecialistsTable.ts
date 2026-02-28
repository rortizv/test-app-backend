import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSpecialistsTable1730200000000 implements MigrationInterface {
  name = 'CreateSpecialistsTable1730200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "specialists" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(255) NOT NULL,
        "id_number" character varying(50) NOT NULL,
        "phone" character varying(50),
        "email" character varying(255),
        "address" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_specialists_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "specialists"`);
  }
}
