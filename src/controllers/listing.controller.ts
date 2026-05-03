import { Controller } from '@nestjs/common';
import { ListingService } from '../services/listing.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { GetListingsDto } from '../dto/listings/get-listings.dto';
import { PaginatedResponseDto } from '../dto/listings/pagination-response.dto';
import { CreateListingInputDto } from '../dto/listings/create-listing-input.dto';
import { ListingResponseDto } from '../dto/listings/listing.model';
import { ScrapedListingDto } from 'src/dto/scrapper/scraped-listing.dto';

@Controller()
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  @MessagePattern('listing.find')
  async getPaginated(
    @Payload() data: GetListingsDto,
  ): Promise<PaginatedResponseDto<any>> {
    return await this.listingService.getListings(data);
  }

  @MessagePattern('listing.get-by-id')
  async getById(@Payload() id: string): Promise<ListingResponseDto> {
    return await this.listingService.getListingById(id);
  }

  @MessagePattern('listing.create-ad')
  async createAd(
    @Payload() data: { createAdDto: CreateListingInputDto; userId: string },
  ) {
    const { createAdDto, userId } = data;
    return await this.listingService.createNewAd(createAdDto, userId);
  }

  @MessagePattern('listing.delete-ad')
  async deleteAd(
    @Payload() data: { id: string; userId: string },
  ): Promise<boolean> {
    const res: boolean = await this.listingService.deleteAd(
      data.id,
      data.userId,
    );
    return res;
  }

  @MessagePattern('listing.insert-makes')
  async insertMakes() {
    return await this.listingService.seedMakes();
  }

  @MessagePattern('listing.insert-models')
  async insertModels() {
    return await this.listingService.seedModels();
  }

  @MessagePattern('listing.insert-models-by-make')
  async insertModelsByMake(@Payload() data: { makeId: number }) {
    return await this.listingService.seedModelsByMake(data.makeId);
  }

  @EventPattern('scraped.data')
  async handleScrappedAd(@Payload() data: ScrapedListingDto) {
    return await this.listingService.processScrapedAd(data);
  }
}
