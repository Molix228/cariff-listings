import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavouritesController } from 'src/controllers/favourites.controller';
import { Favourites } from 'src/models/favourites.entity';
import { FavouritesRepository } from 'src/repositories/favourites.repository';
import { FavouritesService } from 'src/services/favourites.service';
import { ListingModule } from './listing.module';

@Module({
  imports: [TypeOrmModule.forFeature([Favourites]), ListingModule],
  controllers: [FavouritesController],
  providers: [FavouritesService, FavouritesRepository],
  exports: [FavouritesService, FavouritesRepository],
})
export class FavouritesModule {}
