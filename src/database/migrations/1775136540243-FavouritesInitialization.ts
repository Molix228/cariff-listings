import { MigrationInterface, QueryRunner } from 'typeorm';

export class FavouritesInitialization1775136540243
  implements MigrationInterface
{
  name = 'FavouritesInitialization1775136540243';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "favourites" DROP CONSTRAINT "FK_e0e891c25059c4a4b164e97b030"`,
    );
    await queryRunner.query(`ALTER TABLE "favourites" DROP COLUMN "listingId"`);
    await queryRunner.query(
      `ALTER TABLE "favourites" ADD CONSTRAINT "FK_fb7a4f3bc6b6767a71f67a477b8" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "favourites" DROP CONSTRAINT "FK_fb7a4f3bc6b6767a71f67a477b8"`,
    );
    await queryRunner.query(`ALTER TABLE "favourites" ADD "listingId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "favourites" ADD CONSTRAINT "FK_e0e891c25059c4a4b164e97b030" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
