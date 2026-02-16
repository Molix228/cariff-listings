import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PriceRangeDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  min?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  max?: number;
}
