import type { SavedSearch } from "@/entities/search/model";
import type { UnifiedCatalogListing } from "@/lib/listings.types";

export type SavedSearchMatchSummary = {
  searchId: string;
  listings: UnifiedCatalogListing[];
  newMatches: number;
};

export type { SavedSearch };
