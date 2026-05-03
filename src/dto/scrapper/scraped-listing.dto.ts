export interface ScrapedListingDto {
  title: string;
  price: string;
  imageIds: string[];
  specs: Record<string, string>;
  description: string | null;
  vin: string | null;
  features: string[];
  sourceUrl: string;
  scrapeDate: string;
}
