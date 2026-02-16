import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

class MakeItemDto {
  @IsNumber()
  makeId: number;

  @IsString()
  makeName: string;
}

export class MakesResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MakeItemDto)
  items: MakeItemDto[];

  @IsNumber()
  total: number;
}
