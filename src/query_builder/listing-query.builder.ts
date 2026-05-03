import { Listing } from 'src/models/listings.entity';
import { SortOrder } from 'src/enums/sort-order.enum';
import { Brackets, SelectQueryBuilder } from 'typeorm';
import { ListingFiltersDto } from 'src/dto/listings/listing-filter.dto';
import { PaginationDto } from 'src/dto/listings/pagination.dto';

export class ListingQueryBuilder {
  constructor(private queryBuilder: SelectQueryBuilder<Listing>) {
    this.queryBuilder
      .leftJoin('listing.make', 'make')
      .leftJoin('listing.model', 'model')
      .leftJoin('listing.bodyType', 'bodyType');
  }

  applyPreviewSection(): this {
    this.queryBuilder.select([
      'listing.id',
      'listing.price',
      'listing.mileage',
      'listing.initialReg',
      'listing.images',
      'listing.createdAt',
      'listing.userId',
      'make.make',
      'model.name',
      'bodyType.name',
    ]);
    return this;
  }

  applyFullSelection(): this {
    this.queryBuilder.addSelect(['make', 'model', 'bodyType']);
    return this;
  }

  applyFilters(filters: ListingFiltersDto): this {
    if (filters.userId) {
      this.queryBuilder.andWhere('listing.user_id = :userId', {
        userId: filters.userId,
      });
    }

    if (filters.searchText) {
      this.queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('make.make ILIKE :search', {
            search: `%${filters.searchText}%`,
          })
            .orWhere('model.name ILIKE :search', {
              search: `%${filters.searchText}%`,
            })
            .orWhere('listing.description ILIKE :search', {
              search: `%${filters.searchText}%`,
            });
        }),
      );
    }

    if (filters.makeId && filters.makeId.length > 0) {
      this.queryBuilder.andWhere('listing.make_id IN (:...makeIds)', {
        makeIds: filters.makeId,
      });
    }

    if (filters.modelId && filters.modelId.length > 0) {
      this.queryBuilder.andWhere('listing.model_id IN (:...modelIds)', {
        modelIds: filters.modelId,
      });
    }

    if (filters.priceRange) {
      if (filters.priceRange.min) {
        this.queryBuilder.andWhere('listing.price >= :minPrice', {
          minPrice: filters.priceRange.min,
        });
      }
      if (filters.priceRange.max) {
        this.queryBuilder.andWhere('listing.price <= :maxPrice', {
          maxPrice: filters.priceRange.max,
        });
      }
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case SortOrder.PRICE_ASC:
          this.queryBuilder.orderBy('listing.price', 'ASC');
          break;
        case SortOrder.PRICE_DESC:
          this.queryBuilder.orderBy('listing.price', 'DESC');
          break;
        case SortOrder.DATE_OLD:
          this.queryBuilder.orderBy('listing.createdAt', 'ASC');
          break;
        case SortOrder.DATE_NEW:
          this.queryBuilder.orderBy('listing.createdAt', 'DESC');
          break;
        default:
          this.queryBuilder.orderBy('listing.createdAt', 'DESC');
      }
    }

    return this;
  }

  applyPagination(pagination: PaginationDto): this {
    if (pagination.page && pagination.limit) {
      const offset = (pagination.page - 1) * pagination.limit;
      this.queryBuilder.skip(offset).take(pagination.limit);
    }
    return this;
  }

  build(): SelectQueryBuilder<Listing> {
    return this.queryBuilder;
  }

  async getMany(): Promise<Listing[]> {
    return this.queryBuilder.getMany();
  }

  async getManyAndCount(): Promise<[Listing[], number]> {
    return this.queryBuilder.getManyAndCount();
  }

  async getCount(): Promise<number> {
    return this.queryBuilder.getCount();
  }
}
