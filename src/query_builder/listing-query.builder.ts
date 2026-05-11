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
      this.queryBuilder.andWhere('listing.userId = :userId', {
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
    } else {
      if (filters.makeId && filters.makeId.length > 0) {
        this.queryBuilder.andWhere('make.id IN (:...makeIds)', {
          makeIds: filters.makeId,
        });
      }

      if (filters.modelId && filters.modelId.length > 0) {
        this.queryBuilder.andWhere('model.id IN (:...modelIds)', {
          modelIds: filters.modelId,
        });
      }
    }

    if (filters.bodyTypeId && filters.bodyTypeId.length > 0) {
      this.queryBuilder.andWhere('bodyType.id IN (:...bodyTypeIds)', {
        bodyTypeIds: filters.bodyTypeId,
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

    if (filters.mileageRange) {
      if (filters.mileageRange.min) {
        this.queryBuilder.andWhere('listing.mileage >= :minMil', {
          minMil: filters.mileageRange.min,
        });
      }
      if (filters.mileageRange.max) {
        this.queryBuilder.andWhere('listing.mileage <= :maxMil', {
          maxMil: filters.mileageRange.max,
        });
      }
    }

    if (filters.yearRange) {
      if (filters.yearRange.min) {
        this.queryBuilder.andWhere('listing.initialReg >= :startDate', {
          startDate: `${filters.yearRange.min}-01-01`,
        });
      }
      if (filters.yearRange.max) {
        this.queryBuilder.andWhere('listing.initialReg <= :endDate', {
          endDate: `${filters.yearRange.max}-12-31`,
        });
      }
    }

    if (filters.fuelTypes && filters.fuelTypes.length > 0) {
      this.queryBuilder.andWhere(
        "LOWER(listing.specs ->> 'Fuel') IN (:...fuels)",
        {
          fuels: filters.fuelTypes.map((f) => f.toLowerCase()),
        },
      );
    }

    if (filters.transmissions && filters.transmissions.length > 0) {
      this.queryBuilder.andWhere(
        "LOWER(listing.specs ->> 'Transmission') IN (:...transmissions)",
        {
          transmissions: filters.transmissions.map((t) => t.toLowerCase()),
        },
      );
    }

    if (filters.sortBy) {
      const order = filters.sortBy.includes('asc') ? 'ASC' : 'DESC';

      switch (filters.sortBy) {
        case SortOrder.PRICE_ASC:
        case SortOrder.PRICE_DESC:
          this.queryBuilder.orderBy('listing.price', order);
          break;
        case SortOrder.DATE_OLD:
        case SortOrder.DATE_NEW:
          this.queryBuilder.orderBy('listing.createdAt', order);
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
