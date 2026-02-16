import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetListingsDto } from './dto/listings/get-listings.dto';
import { PaginatedResponseDto } from './dto/listings/pagination-response.dto';
import { CreateListingInputDto } from './dto/listings/create-listing-input.dto';
import { ListingResponseDto } from './dto/listings/listing.model';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('listing.find')
  async getPaginated(
    @Payload() data: GetListingsDto,
  ): Promise<PaginatedResponseDto<ListingResponseDto>> {
    return await this.appService.getListings(data);
  }

  @MessagePattern('listing.create-ad')
  async createAd(
    @Payload() data: { createAdDto: CreateListingInputDto; userId: string },
  ) {
    const { createAdDto, userId } = data;
    return await this.appService.createNewAd(createAdDto, userId);
  }

  @MessagePattern('listing.insert-makes')
  async insertMakes() {
    return await this.appService.seedMakes();
  }

  @MessagePattern('listing.insert-models')
  async insertModels() {
    return await this.appService.seedModels();
  }

  @MessagePattern('listing.insert-models-by-make')
  async insertModelsByMake(@Payload() data: { makeId: number }) {
    return await this.appService.seedModelsByMake(data.makeId);
  }
}
