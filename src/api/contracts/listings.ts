import type { UnifiedCatalogListing } from "@/lib/listings.types";
import type { ListingDraft, ListingFilters } from "@/services/listings/types";

/**
 * Каталожная карточка объявления (совпадает с `UnifiedCatalogListing` и ответами `ListingsService`).
 * Обсуждение с backend: возможно объединить `price` + `priceValue` в один объект денег (amount + currency + display).
 */
export type Listing = UnifiedCatalogListing;

/** Фильтры списка (как `ListingFilters` в `services/listings/types.ts`). */
export type ListingListFilters = ListingFilters;

export interface GetListingsRequest extends ListingListFilters {
  page?: number;
  perPage?: number;
}

export interface GetListingsResponse {
  items: Listing[];
  page: number;
  perPage: number;
  total: number;
}

export interface GetListingByIdRequest {
  id: string;
}

export interface GetListingByIdResponse {
  listing: Listing | null;
}

export interface GetListingsByWorldRequest {
  worldId: string;
  page?: number;
  perPage?: number;
}

export interface GetFeaturedListingsResponse {
  items: Listing[];
}

/** Тело создания (как `ListingDraft` в `services/listings/types.ts`). */
export type CreateListingRequest = ListingDraft & {
  /** Если backend выдаёт idempotency-ключ */
  clientRequestId?: string;
};

export interface CreateListingResponse {
  listing: Listing;
}

export interface UpdateListingRequest {
  id: string;
  patch: Partial<CreateListingRequest>;
}

export interface UpdateListingResponse {
  listing: Listing;
}

export interface DeleteListingRequest {
  id: string;
}

export type DeleteListingResponse = void;
