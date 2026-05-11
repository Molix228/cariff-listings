import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class RangeDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  min?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  max?: number;
}
