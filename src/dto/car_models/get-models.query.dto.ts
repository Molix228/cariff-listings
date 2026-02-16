import { IsNotEmpty, IsNumber } from 'class-validator';
import { DefaultQueryDto } from '../search/default.query.dto';
import { Type } from 'class-transformer';

export class GetModelsQueryDto extends DefaultQueryDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  makeId: number;
}
