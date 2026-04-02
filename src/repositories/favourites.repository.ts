import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Favourites } from 'src/models/favourites.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FavouritesRepository {
  constructor(
    @InjectRepository(Favourites)
    private readonly repository: Repository<Favourites>,
  ) {}

  async findUserFavouritesIds(userId: string): Promise<string[]> {
    const favIds = await this.repository.find({
      select: ['listingId'],
      where: { userId },
    });
    return favIds.map((fav) => fav.listingId);
  }

  async findUserFavourites(userId: string): Promise<Favourites[]> {
    return this.repository.find({
      where: { userId },
      relations: ['listing'],
      order: { createdAt: 'DESC' },
    });
  }

  async findFavourite(
    userId: string,
    listingId: string,
  ): Promise<Favourites | null> {
    return this.repository.findOne({
      where: { listingId, userId },
    });
  }

  async createFavourite(
    userId: string,
    listingId: string,
  ): Promise<Favourites> {
    const favourite = this.repository.create({ userId, listingId });
    return this.repository.save(favourite);
  }

  async deleteFavourite(userId: string, listingId: string): Promise<void> {
    await this.repository.delete({ listingId, userId });
  }
}
