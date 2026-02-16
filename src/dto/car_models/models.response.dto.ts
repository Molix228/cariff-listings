import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

class ModelItemDto {
  @IsNumber()
  modelId: number;

  @IsString()
  modelName: string;
}

export class ModelsResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModelItemDto)
  items: ModelItemDto[];

  @IsNumber()
  total: number;
}
