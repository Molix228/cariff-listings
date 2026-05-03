import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendedCariffDataTable1777812648413
  implements MigrationInterface
{
  name = 'ExtendedCariffDataTable1777812648413';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listings" ADD "vin" character varying(17)`,
    );
    await queryRunner.query(
      `ALTER TABLE "listings" ADD "features" text array DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "listings" ADD "specs" jsonb DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "listings" DROP COLUMN "specs"`);
    await queryRunner.query(`ALTER TABLE "listings" DROP COLUMN "features"`);
    await queryRunner.query(`ALTER TABLE "listings" DROP COLUMN "vin"`);
  }
}
