import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { FavouritesRepository } from 'src/repositories/favourites.repository';
import { ListingRepository } from 'src/repositories/listing.repository';

@Injectable()
export class FavouritesService {
  constructor(
    private readonly favouritesRepository: FavouritesRepository,
    private readonly listingRepository: ListingRepository,
  ) {}

  async getFavouritesIds(userId: string) {
    try {
      return await this.favouritesRepository.findUserFavouritesIds(userId);
    } catch (err) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch favourite IDs',
      });
    }
  }

  async getFavourites(userId: string) {
    try {
      const favourites =
        await this.favouritesRepository.findUserFavourites(userId);
      return favourites.map((fav) => fav.listing);
    } catch (err) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch favourites',
      });
    }
  }

  async addFavourite(listingId: string, userId: string) {
    const listing = await this.listingRepository.findById(listingId);

    if (!listing) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Listing not found',
      });
    }

    const existingFav = await this.favouritesRepository.findFavourite(
      userId,
      listingId,
    );
    if (existingFav) {
      return { success: true }; // Already a favourite, no action needed
    }

    try {
      await this.favouritesRepository.createFavourite(userId, listingId);
      return { success: true };
    } catch (err) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to add favourite',
      });
    }
  }

  async removeFavourite(listingId: string, userId: string) {
    try {
      await this.favouritesRepository.deleteFavourite(userId, listingId);
      return { success: true };
    } catch (err) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to remove favourite',
      });
    }
  }
}
