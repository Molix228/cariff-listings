import { Type } from 'class-transformer';

class BodyTypeDto {
  id: number;
  name: string;
  category: string;
}

class ModelResponseDto {
  id: number;
  name: string;
}

class MakeResponseDto {
  id: number;
  make: string;
}

export class ListingResponseDto {
  id: string;
  price: number;

  @Type(() => BodyTypeDto)
  bodyType: BodyTypeDto;
  @Type(() => MakeResponseDto)
  make: MakeResponseDto;
  @Type(() => ModelResponseDto)
  model: ModelResponseDto;

  initialReg: Date;
  description?: string;
  images: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
