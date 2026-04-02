import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ListingRepository } from './repositories/listing.repository';
import { Repository } from 'typeorm';
import { Make } from './models/nested/makes.entity';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from './models/nested/models.entity';
import { CreateListingInputDto } from './dto/listings/create-listing-input.dto';
import { GetListingsDto } from './dto/listings/get-listings.dto';
import { ListingResponseDto } from './dto/listings/listing.model';
import { PaginatedResponseDto } from './dto/listings/pagination-response.dto';

@Injectable()
export class AppService {
  private readonly _logger = new Logger(AppService.name);
  constructor(
    private readonly listingRepository: ListingRepository,
    @InjectRepository(Make) private readonly makesRepo: Repository<Make>,
    @InjectRepository(Model) private readonly modelsRepo: Repository<Model>,
  ) {}

  async createNewAd(createAdDto: CreateListingInputDto, userId: string) {
    try {
      return await this.listingRepository.create(createAdDto, userId);
    } catch (err) {
      console.error('[AppService] Error creating new ad:', err);
      throw new InternalServerErrorException(
        'Failed to create new ad',
        err.message,
      );
    }
  }

  async deleteAd(id: string, userId: string): Promise<boolean> {
    try {
      const res = await this.listingRepository.delete(id, userId);
      if (!res) {
        throw new NotFoundException(`Listing with ID: ${id} not found in DB`);
      }
      this._logger.log('Listing delete successfuly!', '[ListingService]');
      return res;
    } catch (err) {
      this._logger.error(
        `Failed to delete listing with ID: ${id}`,
        err.message,
      );
      throw new InternalServerErrorException(
        `Failed to delete listing with ID: ${id}`,
      );
    }
  }

  async getListings(
    data: GetListingsDto,
  ): Promise<PaginatedResponseDto<ListingResponseDto>> {
    const { items, total } = await this.listingRepository.findWithFilters(
      data.filters,
      data.pagination,
    );

    return new PaginatedResponseDto(
      items,
      total,
      data.pagination.page || 1,
      data.pagination.limit || 20,
    );
  }

  async seedMakes() {
    try {
      const { data } = await axios.get(
        'https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json',
      );

      const results = data.Results;

      const formattedMakes = results.map((item) => ({
        make: (item.MakeName || item.Make_Name).trim(),
      }));

      const chunkSize = 500;
      for (let i = 0; i < formattedMakes.length; i += chunkSize) {
        const chunk = formattedMakes.slice(i, i + chunkSize);

        await this.makesRepo
          .createQueryBuilder()
          .insert()
          .values(chunk)
          .orIgnore()
          .execute();

        console.log(
          `[Auto24] Прогресс: ${i + chunk.length} / ${formattedMakes.length}`,
        );
      }

      return { message: 'Import completed', total: formattedMakes.length };
    } catch (error) {
      console.error('Seed Error:', error);
      throw new Error('Failed to seed makes');
    }
  }

  async seedModels() {
    const makes = await this.makesRepo.find();
    console.log(
      `[Auto24] Начинаем загрузку моделей для ${makes.length} марок...`,
    );

    for (const makeEntry of makes) {
      try {
        const response = await axios.get(
          `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${encodeURIComponent(makeEntry.make)}?format=json`,
        );

        const apiModels = response.data.Results;

        if (!apiModels || apiModels.length === 0) continue;

        const modelsToInsert = apiModels.map((m) => ({
          name: m.Model_Name.trim(),
          make: makeEntry,
        }));

        await this.modelsRepo
          .createQueryBuilder()
          .insert()
          .values(modelsToInsert)
          .orIgnore()
          .execute();

        console.log(
          `✅ ${makeEntry.make}: добавлено ${modelsToInsert.length} моделей.`,
        );

        await new Promise((resolve) => setTimeout(resolve, 150));
      } catch (error) {
        console.error(`❌ Ошибка на марке ${makeEntry.make}:`, error.message);
        continue;
      }
    }

    return { status: 'Models seed completed' };
  }

  async seedModelsByMake(makeId: number) {
    const makeEntry = await this.makesRepo.findOne({ where: { id: makeId } });
    if (!makeEntry) {
      console.error(`Make with ID ${makeId} not found.`);
      return { error: 'Make not found' };
    }

    try {
      const response = await axios.get(
        `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${encodeURIComponent(makeEntry.make)}?format=json`,
      );

      const apiModels = response.data.Results;

      if (!apiModels || apiModels.length === 0) {
        console.log(`No models found for make ${makeEntry.make}.`);
        return { message: 'No models to insert' };
      }

      const modelsToInsert = apiModels.map((m) => ({
        name: m.Model_Name.trim(),
        make: makeEntry,
      }));

      await this.modelsRepo
        .createQueryBuilder()
        .insert()
        .values(modelsToInsert)
        .orIgnore()
        .execute();

      console.log(
        `✅ ${makeEntry.make}: added ${modelsToInsert.length} models.`,
      );

      return {
        status: 'Models seed completed',
        inserted: modelsToInsert.length,
      };
    } catch (error) {
      console.error(
        `❌ Error seeding models for make ${makeEntry.make}:`,
        error.message,
      );
      return { error: 'Failed to seed models for the specified make' };
    }
  }
}
