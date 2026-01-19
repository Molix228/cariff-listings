import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { ListingFiltersDto } from './listing-filter.dto';
import { PaginationDto } from './pagination.dto';

export class GetListingsDto {
  @ValidateNested()
  @IsDefined()
  @Type(() => ListingFiltersDto)
  filters: ListingFiltersDto;

  @ValidateNested()
  @IsDefined()
  @Type(() => PaginationDto)
  pagination: PaginationDto;
}
