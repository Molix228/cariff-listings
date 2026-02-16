import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleDataController } from 'src/controllers/vehicle-data.controller';
import { DatabaseModule } from 'src/database/database.module';
import { Make } from 'src/models/nested/makes.entity';
import { Model } from 'src/models/nested/models.entity';
import { VehicleDataRepository } from 'src/repositories/vehicle-data.repository';
import { VehicleDataService } from 'src/services/vehicle-data.service';

@Module({
  imports: [TypeOrmModule.forFeature([Make, Model]), DatabaseModule],
  controllers: [VehicleDataController],
  providers: [VehicleDataService, VehicleDataRepository],
  exports: [VehicleDataService, VehicleDataRepository],
})
export class VehicleDataModule {}
