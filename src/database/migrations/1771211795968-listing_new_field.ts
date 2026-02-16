import { MigrationInterface, QueryRunner } from 'typeorm';

export class ListingNewField1771211795968 implements MigrationInterface {
  name = 'ListingNewField1771211795968';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listings" ADD "mileage" integer NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "listings" DROP COLUMN "mileage"`);
  }
}
