import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class DefaultQueryDto {
  @IsString()
  @IsOptional()
  searchTerm: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  skip: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  take: number;
}
