import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SortOrder } from 'src/enums/sort-order.enum';
import { PriceRangeDto } from './nested/price-range.dto';
import { DateRangeDto } from './nested/date-range.dto';
import { RangeDto } from './nested/range.dto';

export class ListingFiltersDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  searchText?: string = '';

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @Type(() => Number)
  makeId?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  modelId?: number[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PriceRangeDto)
  priceRange?: PriceRangeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => RangeDto)
  mileageRange?: RangeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => RangeDto)
  yearRange?: RangeDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fuelTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  transmissions?: string[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  bodyTypeId?: number[];

  @IsOptional()
  @IsEnum(SortOrder)
  sortBy: SortOrder = SortOrder.PRICE_DESC;
}
