import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SortOrder } from 'src/enums/sort-order.enum';
import { PriceRangeDto } from './nested/price-range.dto';
import { DateRangeDto } from './nested/date-range.dto';

export class ListingFiltersDto {
  @IsOptional()
  @IsString()
  searchText?: string = '';

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  makes?: string[];

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  models?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PriceRangeDto)
  priceRange?: PriceRangeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @IsOptional()
  @IsEnum(SortOrder)
  sortBy: SortOrder = SortOrder.PRICE_DESC;
}
