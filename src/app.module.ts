import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listing } from './models/listings.entity';
import { BodyType } from './models/nested/body-type.entity';
import { Make } from './models/nested/makes.entity';
import { Model } from './models/nested/models.entity';
import { HealthModule } from './health/health.module';
import { VehicleDataModule } from './modules/vehicle-data.module';
import { FavouritesModule } from './modules/favourites.module';
import { ListingModule } from './modules/listing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    HealthModule,
    TypeOrmModule.forFeature([Listing, BodyType, Make, Model]),
    DatabaseModule,
    ListingModule,
    VehicleDataModule,
    FavouritesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
