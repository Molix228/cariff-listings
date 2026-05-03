import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ListingRepository } from '../repositories/listing.repository';
import { DataSource, ILike, Repository } from 'typeorm';
import { Make } from '../models/nested/makes.entity';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from '../models/nested/models.entity';
import { CreateListingInputDto } from '../dto/listings/create-listing-input.dto';
import { GetListingsDto } from '../dto/listings/get-listings.dto';
import { ListingResponseDto } from '../dto/listings/listing.model';
import { PaginatedResponseDto } from '../dto/listings/pagination-response.dto';
import { BodyType } from 'src/models/nested/body-type.entity';
import { ScrapedListingDto } from 'src/dto/scrapper/scraped-listing.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import FormData = require('form-data');
import { env } from 'src/env';

@Injectable()
export class ListingService {
  private readonly _logger = new Logger(ListingService.name);
  constructor(
    private readonly listingRepository: ListingRepository,
    @InjectRepository(Make) private readonly makesRepo: Repository<Make>,
    @InjectRepository(Model) private readonly modelsRepo: Repository<Model>,
    @InjectRepository(BodyType)
    private readonly bodyTypeRepo: Repository<BodyType>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly dataSourse: DataSource,
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

  async processScrapedAd(data: ScrapedListingDto) {
    try {
      const token = env.apiGateway.service_token;
      const rawMake = (data.specs['Make'] || 'UNKNOWN').toUpperCase().trim();
      const rawModel = (data.specs['Model'] || 'UNKNOWN').trim();
      const rawBody = (data.specs['Bodytype'] || 'other').toLowerCase().trim();

      const finalS3Urls: string[] = [];

      if (data.imageIds && data.imageIds.length > 0) {
        const formData = new FormData();
        let hasFiles = false;

        for (const imageId of data.imageIds) {
          const base64 = await this.cacheManager.get<string>(imageId);

          if (base64) {
            const buffer = Buffer.from(base64, 'base64');
            formData.append('files', buffer, {
              filename: `${imageId}.jpg`,
              contentType: 'image/jpeg',
            });
            hasFiles = true;
          }
        }

        if (hasFiles) {
          try {
            const uploadResponse = await axios.post(
              `${env.apiGateway.url}/api/upload/images`,
              formData,
              {
                headers: {
                  ...formData.getHeaders(),
                  Authorization: `Bearer ${token}`,
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
              },
            );

            if (uploadResponse.data && Array.isArray(uploadResponse.data)) {
              finalS3Urls.push(...uploadResponse.data);
            }

            for (const imageId of data.imageIds) {
              await this.cacheManager.del(imageId);
            }
          } catch (uploadError) {
            this._logger.error(
              `Failed to upload images via ApiGateway: ${uploadError.message}`,
            );
          }
        }
      }

      let make = await this.makesRepo.findOne({
        where: { make: ILike(rawMake) },
      });

      if (!make) {
        try {
          make = await this.makesRepo.save(
            this.makesRepo.create({ make: rawMake }),
          );
        } catch (e) {
          make = await this.makesRepo.findOne({
            where: { make: ILike(rawMake) },
          });
        }
      }

      if (!make) {
        throw new Error(`Failed to resolve make: ${rawMake}`);
      }

      const model = await this.dataSourse.transaction(async (manager) => {
        const existingModel = await manager.findOne(Model, {
          where: { name: ILike(rawModel), make: { id: make.id } },
        });

        if (existingModel) return existingModel;
        try {
          const newModel = manager.create(Model, {
            name: rawModel,
            make: { id: make.id },
          });
          return await manager.save(newModel);
        } catch (e) {
          return await manager.findOne(Model, {
            where: { name: ILike(rawModel), make: { id: make.id } },
          });
        }
      });
      if (!model) {
        throw new Error(`Critical: Failed to resolve model: ${rawModel}`);
      }

      let bodyType = await this.bodyTypeRepo.findOne({
        where: { name: rawBody },
      });

      if (!bodyType) {
        try {
          bodyType = await this.bodyTypeRepo.save(
            this.bodyTypeRepo.create({
              name: rawBody,
              category: 'passenger_car',
            }),
          );
        } catch (e) {
          bodyType = await this.bodyTypeRepo.findOne({
            where: { name: rawBody },
          });
        }
      }
      const regDateStr = data.specs['Initial reg'];
      let initialReg = new Date();
      if (regDateStr?.includes('/')) {
        const [month, year] = regDateStr.split('/');
        initialReg = new Date(parseInt(year), parseInt(month) - 1, 1);
      }

      if (make && model && bodyType) {
        const createAdDto = {
          makeId: make.id,
          modelId: model.id,
          bodyTypeId: bodyType.id,
          initialReg,
          price: parseInt(data.price) || 0,
          mileage: parseInt(data.specs['Mileage']?.replace(/\D/g, '')) || 0,
          description: `Scraped from Auto24. Source: ${data.sourceUrl}`,
          images: finalS3Urls,
        };

        const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

        const result = await this.listingRepository.create(
          createAdDto,
          SYSTEM_USER_ID,
        );
        this._logger.log(`Successfully saved listing: ${data.title}`);
        return result;
      }
    } catch (err) {
      this._logger.error(
        `Error processing scraped ad: ${data.title}`,
        err.stack,
      );
    }
  }
}
