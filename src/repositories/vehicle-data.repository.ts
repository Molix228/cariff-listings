import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MakesResponseDto } from 'src/dto/car_makes/makes.response.dto';
import { GetModelsQueryDto } from 'src/dto/car_models/get-models.query.dto';
import { ModelsResponseDto } from 'src/dto/car_models/models.response.dto';
import { DefaultQueryDto } from 'src/dto/search/default.query.dto';
import { Make } from 'src/models/nested/makes.entity';
import { Model } from 'src/models/nested/models.entity';
import { MakesQueryBuilder } from 'src/query_builder/makes-query.builder';
import { ModelsQueryBuilder } from 'src/query_builder/models-query.builder';
import { Repository } from 'typeorm';

@Injectable()
export class VehicleDataRepository {
  constructor(
    @InjectRepository(Make)
    private readonly makeRepository: Repository<Make>,
    @InjectRepository(Model)
    private readonly modelRepository: Repository<Model>,
  ) {}

  async findAllMakes(query: DefaultQueryDto): Promise<MakesResponseDto> {
    const { searchTerm, skip, take } = query;

    const qb = new MakesQueryBuilder(
      this.makeRepository.createQueryBuilder('make'),
    );

    const [items, total] = await qb
      .applyFilters(searchTerm)
      .applyPagination(skip, take)
      .build()
      .getManyAndCount();

    return {
      items: items.map((m) => ({
        makeId: m.id,
        makeName: m.make,
      })),
      total,
    };
  }

  async findModelsByMake(query: GetModelsQueryDto): Promise<ModelsResponseDto> {
    const { searchTerm, skip, take, makeId } = query;

    const qb = new ModelsQueryBuilder(
      this.modelRepository.createQueryBuilder('model'),
    );

    const [items, total] = await qb
      .filterByMake(makeId)
      .applyFilters(searchTerm)
      .applyPagination(skip, take)
      .build()
      .getManyAndCount();

    return {
      items: items.map((m) => ({
        modelId: m.id,
        modelName: m.name,
      })),
      total,
    };
  }
}
