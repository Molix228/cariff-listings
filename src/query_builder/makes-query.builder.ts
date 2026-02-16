import { Make } from 'src/models/nested/makes.entity';
import { SelectQueryBuilder } from 'typeorm';

export class MakesQueryBuilder {
  constructor(private readonly qb: SelectQueryBuilder<Make>) {
    this.qb = qb;
  }

  applyFilters(searchTerm?: string): this {
    if (searchTerm) {
      this.qb.andWhere('make.make ILIke :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      });
    }

    return this;
  }

  applyPagination(skip: number, take: number): this {
    this.qb.skip(skip).take(take);
    return this;
  }

  build(): SelectQueryBuilder<Make> {
    return this.qb.orderBy('make.make', 'ASC');
  }
}
