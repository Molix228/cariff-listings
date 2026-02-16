import { Model } from 'src/models/nested/models.entity';
import { SelectQueryBuilder } from 'typeorm';

export class ModelsQueryBuilder {
  constructor(private readonly qb: SelectQueryBuilder<Model>) {
    this.qb = qb;
  }

  filterByMake(makeId: number): this {
    this.qb.andWhere('model.make_id = :makeId', { makeId });
    return this;
  }

  applyFilters(searchTerm?: string): this {
    if (searchTerm) {
      this.qb.andWhere('model.name ILIke :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      });
    }

    return this;
  }

  applyPagination(skip: number, take: number): this {
    this.qb.skip(skip).take(take);
    return this;
  }

  build(): SelectQueryBuilder<Model> {
    return this.qb.orderBy('model.name', 'ASC');
  }
}
