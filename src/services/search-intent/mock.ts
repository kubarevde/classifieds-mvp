import {
  createSearchIntentFromFilters,
  createSearchIntentFromImageSearch,
  createSearchIntentFromNaturalLanguage,
  type SavedSearchFilters,
  createStoreSearchIntentFromFilters,
  type StoreSearchFilters,
} from "@/lib/saved-searches";

import type { SearchIntentService } from "./index";

export const mockSearchIntentService: SearchIntentService = {
  async fromFilters(filters: SavedSearchFilters) {
    return createSearchIntentFromFilters(filters, "keyword");
  },
  async fromStoreFilters(filters: StoreSearchFilters) {
    return createStoreSearchIntentFromFilters(filters, "keyword");
  },

  async fromNaturalLanguage(rawQuery: string) {
    return createSearchIntentFromNaturalLanguage(rawQuery);
  },

  async fromImageSearch(input) {
    return createSearchIntentFromImageSearch(input);
  },
};
