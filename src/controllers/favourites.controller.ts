import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FavouritesService } from 'src/services/favourites.service';

@Controller()
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @MessagePattern('favourites.get-favourites-ids')
  async getFavouritesIds(@Payload() data: { userId: string }) {
    return await this.favouritesService.getFavouritesIds(data.userId);
  }

  @MessagePattern('favourites.get-favourites')
  async getFavourites(@Payload() data: { userId: string }) {
    return await this.favouritesService.getFavourites(data.userId);
  }

  @MessagePattern('favourites.add-favourite')
  async addFavourite(@Payload() data: { listingId: string; userId: string }) {
    return await this.favouritesService.addFavourite(
      data.listingId,
      data.userId,
    );
  }

  @MessagePattern('favourites.remove-favourite')
  async removeFavourite(
    @Payload() data: { listingId: string; userId: string },
  ) {
    return await this.favouritesService.removeFavourite(
      data.listingId,
      data.userId,
    );
  }
}
