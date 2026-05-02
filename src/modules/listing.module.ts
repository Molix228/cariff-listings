import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listing } from '../models/listings.entity';
import { BodyType } from '../models/nested/body-type.entity';
import { Make } from '../models/nested/makes.entity';
import { Model } from '../models/nested/models.entity';
import { ListingController } from '../controllers/listing.controller';
import { ListingService } from '../services/listing.service';
import { ListingRepository } from '../repositories/listing.repository';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { env } from 'src/env';

@Module({
  imports: [
    TypeOrmModule.forFeature([Listing, BodyType, Make, Model]),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const redisUri = `redis://${env.redis.host}:${env.redis.port}`;
        return {
          stores: [new KeyvRedis(redisUri)],
          namespace: 'auto24_imgs',
          ttl: 3600 * 1000,
        };
      },
    }),
  ],
  controllers: [ListingController],
  providers: [ListingService, ListingRepository],
  exports: [ListingService, ListingRepository],
})
export class ListingModule {}
