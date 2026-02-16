import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MakesResponseDto } from 'src/dto/car_makes/makes.response.dto';
import { GetModelsQueryDto } from 'src/dto/car_models/get-models.query.dto';
import { ModelsResponseDto } from 'src/dto/car_models/models.response.dto';
import { DefaultQueryDto } from 'src/dto/search/default.query.dto';
import { VehicleDataService } from 'src/services/vehicle-data.service';

@Controller()
export class VehicleDataController {
  constructor(private readonly vehicleDataService: VehicleDataService) {}

  @MessagePattern('vehicle-data.get-makes')
  async getMakes(@Payload() query: DefaultQueryDto): Promise<MakesResponseDto> {
    return await this.vehicleDataService.getMakes(query);
  }

  @MessagePattern('vehicle-data.get-models')
  async getModelsByMake(
    @Payload() query: GetModelsQueryDto,
  ): Promise<ModelsResponseDto> {
    return await this.vehicleDataService.getModelsByMake(query);
  }
}
