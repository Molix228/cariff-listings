export interface ScrapedListingDto {
  title: string;
  price: string;
  imageIds: string[];
  specs: Record<string, string>;
  sourceUrl: string;
  scrapeDate: string;
}
