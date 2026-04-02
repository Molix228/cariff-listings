import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listing } from '../models/listings.entity';
import { BodyType } from '../models/nested/body-type.entity';
import { Make } from '../models/nested/makes.entity';
import { Model } from '../models/nested/models.entity';
import { ListingController } from '../controllers/listing.controller';
import { ListingService } from '../services/listing.service';
import { ListingRepository } from '../repositories/listing.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Listing, BodyType, Make, Model])],
  controllers: [ListingController],
  providers: [ListingService, ListingRepository],
  exports: [ListingService, ListingRepository],
})
export class ListingModule {}
