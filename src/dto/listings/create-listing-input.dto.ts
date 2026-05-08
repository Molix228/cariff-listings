import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateListingInputDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  makeId: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  modelId: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  bodyTypeId: number;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  initialReg: Date;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  price: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  mileage: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsNotEmpty()
  images: string[];

  @IsOptional()
  @IsString()
  sourceListingId: string;

  @IsOptional()
  @IsString()
  sourceUrl: string;
}
