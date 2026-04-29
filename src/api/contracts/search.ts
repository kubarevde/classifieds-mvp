import type { SearchIntent, SavedSearch } from "@/entities/search/model";
import type { SavedSearchFilters, StoreSearchFilters } from "@/lib/saved-searches";
import type { UnifiedCatalogListing } from "@/lib/listings.types";

/** Результат разбора фильтров / NL / image (как `SearchIntentService`). */
export type SearchIntentResource = SearchIntent;

export interface BuildSearchIntentFromFiltersRequest {
  filters: SavedSearchFilters;
  mode?: "keyword" | "natural_language" | "image";
}

export interface BuildSearchIntentFromFiltersResponse {
  intent: SearchIntentResource;
}

export interface BuildStoreSearchIntentRequest {
  filters: StoreSearchFilters;
  mode?: "keyword" | "natural_language" | "image";
}

export interface BuildStoreSearchIntentResponse {
  intent: SearchIntentResource;
}

export interface SearchIntentFromNaturalLanguageRequest {
  rawQuery: string;
}

export interface SearchIntentFromNaturalLanguageResponse {
  intent: SearchIntentResource;
}

export interface SearchIntentFromImageRequest {
  imageUrl?: string;
  inferredCategory?: string;
  traits?: string[];
  normalizedQuery?: string;
}

export interface SearchIntentFromImageResponse {
  intent: SearchIntentResource;
}

/** Сохранённые поиски пользователя (как `SavedSearch` + `services/saved-searches`). */
export type SavedSearchResource = SavedSearch;

export interface GetSavedSearchesResponse {
  items: SavedSearchResource[];
}

export interface CreateSavedSearchRequest {
  intent: SearchIntentResource;
  title?: string;
  alertChannel?: "off" | "push" | "email";
  alertsEnabled?: boolean;
}

export interface CreateSavedSearchResponse {
  search: SavedSearchResource;
}

/** Совпадения по сохранённому поиску (каталог + демо-счётчик «новых»). */
export interface GetSavedSearchMatchesRequest {
  searchId: string;
}

export interface GetSavedSearchMatchesResponse {
  searchId: string;
  items: UnifiedCatalogListing[];
  newMatches: number;
}
