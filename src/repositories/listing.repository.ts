import { InjectRepository } from '@nestjs/typeorm';
import { Listing } from '../models/listings.entity';
import { Repository } from 'typeorm';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { ListingQueryBuilder } from '../query_builder/listing-query.builder';
import { BodyType } from '../models/nested/body-type.entity';
import { Make } from '../models/nested/makes.entity';
import { Model } from '../models/nested/models.entity';
import { CreateListingInputDto } from 'src/dto/listings/create-listing-input.dto';
import { ListingFiltersDto } from 'src/dto/listings/listing-filter.dto';
import { PaginationDto } from 'src/dto/listings/pagination.dto';

@Injectable()
export class ListingRepository {
  constructor(
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    @InjectRepository(BodyType)
    private readonly bodyTypeRepo: Repository<BodyType>,
    @InjectRepository(Make)
    private readonly makesRepo: Repository<Make>,
    @InjectRepository(Model)
    private readonly modelsRepo: Repository<Model>,
  ) {}

  async create(
    createListingDto: CreateListingInputDto,
    userId: string,
  ): Promise<Listing> {
    try {
      const { bodyTypeId, makeId, modelId, ...listingData } = createListingDto;

      // Check BodyType
      const bodyType = await this.bodyTypeRepo.findOne({
        where: { id: bodyTypeId },
      });
      if (!bodyType) throw new NotFoundException('Body type with ID not found');

      // Check Make
      const make = await this.makesRepo.findOne({
        where: { id: makeId },
      });
      if (!make) throw new NotFoundException('Make with ID not found');

      // Check Model
      const model = await this.modelsRepo.findOne({
        where: { id: modelId },
        relations: ['make'],
      });
      if (!model) throw new NotFoundException('Model with ID not found');

      if (!model.make || model.make.id !== make.id) {
        console.error('Debug Check: ', {
          modelFound: !!model,
          makeInModel: model?.make,
          expectedMakeId: make.id,
        });
      }

      if (model.make.id !== make.id)
        throw new NotFoundException('Model does not match to Make');

      const newListing = this.listingRepository.create({
        ...listingData,
        bodyType,
        make,
        model,
        userId,
      });

      return await this.listingRepository.save(newListing);
    } catch (err) {
      console.error('[ListingRepository] Error creating listing:', err);
      throw new InternalServerErrorException(
        'Failed to create listing',
        err.message,
      );
    }
  }

  async findById(id: string): Promise<Listing> {
    try {
      const foundListing = await this.listingRepository.findOne({
        where: { id: id },
      });
      if (!foundListing) throw new NotFoundException('Cannot found by ID');
      return foundListing;
    } catch (err) {
      console.error('[ListingRepository] Error while finding by ID', err);
      throw new InternalServerErrorException(
        'Failed to find by ID',
        err.message,
      );
    }
  }

  async update(
    id: string,
    partialListing: Partial<Listing>,
  ): Promise<Listing | null> {
    try {
      const listing = await this.listingRepository.preload({
        id,
        ...partialListing,
      });
      if (!listing) throw new NotFoundException('Listing Not Found');
      await this.listingRepository.save(listing);
      return this.findById(id);
    } catch (err) {
      console.error('[ListingRepository] Error while updating Listing', err);
      throw new InternalServerErrorException(
        'Failed to update listing',
        err.message,
      );
    }
  }

  async delete(id: string, userId: string): Promise<boolean> {
    try {
      const result = await this.listingRepository.delete({
        id: id,
        userId: userId,
      });
      if (result.affected === 0)
        throw new NotFoundException(
          'Listing not found or you do not have permission to delete it',
        );
      return (result.affected ?? 0) > 0;
    } catch (err) {
      console.error('Error while deleting Listing', err);
      throw new InternalServerErrorException(
        'Failed to delete listing by ID',
        err.message,
      );
    }
  }

  async findWithFilters(
    filters: ListingFiltersDto,
    pagination?: PaginationDto,
  ): Promise<{ items: Listing[]; total: number }> {
    const qb = this.createQueryBuilder().applyFilters(filters);

    if (pagination) {
      qb.applyPagination(pagination);
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  private createQueryBuilder(): ListingQueryBuilder {
    const qb = this.listingRepository.createQueryBuilder('listing');
    return new ListingQueryBuilder(qb);
  }
}
