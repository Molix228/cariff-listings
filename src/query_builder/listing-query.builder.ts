import { ListingFiltersDto } from 'src/dto/listing-filter.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
import { Listing } from 'src/entities/listings.entity';
import { SortOrder } from 'src/enums/sort-order.enum';
import { SelectQueryBuilder } from 'typeorm';

export class ListingQueryBuilder {
  constructor(private queryBuilder: SelectQueryBuilder<Listing>) {
    this.queryBuilder
      .leftJoinAndSelect('listing.make', 'make')
      .leftJoinAndSelect('listing.model', 'model')
      .leftJoinAndSelect('listing.bodyType', 'bodyType');
  }

  applyFilters(filters: ListingFiltersDto): this {
    if (filters.searchText) {
      this.queryBuilder.andWhere(
        '(make.name ILIKE :search OR model.name ILIKE :search OR listing.description ILIKE :search',
        { search: `%${filters.searchText}%` },
      );
    }

    if (filters.makes && filters.makes.length > 0) {
      this.queryBuilder.andWhere('listing.make_id IN (:...makes)', {
        makes: filters.makes,
      });
    }

    if (filters.models && filters.models.length > 0) {
      this.queryBuilder.andWhere('listing.model_id IN (:...models)', {
        models: filters.models,
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
