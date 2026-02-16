import { Injectable, Logger } from '@nestjs/common';
import { MakesResponseDto } from 'src/dto/car_makes/makes.response.dto';
import { GetModelsQueryDto } from 'src/dto/car_models/get-models.query.dto';
import { ModelsResponseDto } from 'src/dto/car_models/models.response.dto';
import { DefaultQueryDto } from 'src/dto/search/default.query.dto';
import { VehicleDataRepository } from 'src/repositories/vehicle-data.repository';

@Injectable()
export class VehicleDataService {
  private readonly logger = new Logger(VehicleDataService.name);

  constructor(private readonly vehicleRepository: VehicleDataRepository) {}

  async getMakes(query: DefaultQueryDto): Promise<MakesResponseDto> {
    this.logger.log(`Fetching makes: skip=${query.skip}, take=${query.take}`);
    return await this.vehicleRepository.findAllMakes(query);
  }

  async getModelsByMake(query: GetModelsQueryDto): Promise<ModelsResponseDto> {
    this.logger.log(`Fetching models: skip${query.skip}, take=${query.take}`);
    return await this.vehicleRepository.findModelsByMake(query);
  }
}
