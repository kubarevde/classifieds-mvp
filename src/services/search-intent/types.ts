import type { SearchIntent } from "@/entities/search/model";
import type { SavedSearchFilters, StoreSearchFilters } from "@/lib/saved-searches";

export interface SearchIntentService {
  fromFilters(filters: SavedSearchFilters): Promise<SearchIntent>;
  fromStoreFilters(filters: StoreSearchFilters): Promise<SearchIntent>;
  fromNaturalLanguage(rawQuery: string): Promise<SearchIntent>;
  fromImageSearch(input: {
    imageUrl?: string;
    inferredCategory?: string;
    traits?: string[];
    normalizedQuery?: string;
  }): Promise<SearchIntent>;
}
