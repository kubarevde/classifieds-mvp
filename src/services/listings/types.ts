import type { Feature } from "@/lib/types";
import type { SortOption, UnifiedCatalogListing } from "@/lib/listings.types";
import type { AuctionSaleMode } from "@/entities/auction/model";

export type ListingFilters = {
  query?: string;
  category?: "all" | string;
  location?: "all" | string;
  saleMode?: AuctionSaleMode;
  sortBy?: SortOption;
  world?: string;
};

export type ListingDraft = Partial<Omit<UnifiedCatalogListing, "id">> & {
  title: string;
  price: string;
  priceValue: number;
};

export interface ListingsService {
  getAll(filters?: ListingFilters): Promise<UnifiedCatalogListing[]>;
  getById(id: string): Promise<UnifiedCatalogListing | null>;
  getByWorld(world: string): Promise<UnifiedCatalogListing[]>;
  getFeatured(): Promise<UnifiedCatalogListing[]>;
  create(draft: ListingDraft): Promise<UnifiedCatalogListing>;
  update(id: string, patch: Partial<ListingDraft>): Promise<UnifiedCatalogListing>;
  delete(id: string): Promise<void>;
}

export type HomeCategory = {
  id: string;
  label: string;
  caption: string;
  icon: string;
  listingCount: string;
};

export type HomeFeature = Feature;
