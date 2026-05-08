export interface ScrapedListingDto {
  sourceListingId: string;
  sourceUrl: string;
  title: string;
  price: string;
  imageUrls: string[];
  specs: Record<string, string>;
  features: string[];
  description: string | null;
  vin: string | null;
  scrapeDate?: string;
}
