import type { SellerListingStatus, SellerStorefront } from "@/entities/seller/model";
import type { UnifiedCatalogListing } from "@/lib/listings.types";

/**
 * Публичная витрина магазина (как `SellerStorefront` в моках продавцов).
 * Маршрут фронта: `/stores/[slug]` — уточнить у backend: это `id`, `slug` или оба.
 */
export type Storefront = SellerStorefront;

/** Активные карточки на витрине (как `StorefrontListing` в entities). */
export type StoreListing = UnifiedCatalogListing & {
  status: SellerListingStatus;
};

export interface GetStorefrontByIdRequest {
  /** Идентификатор витрины (сейчас совпадает с `SellerStorefront.id`). */
  storeId: string;
}

export interface GetStorefrontByIdResponse {
  store: Storefront | null;
}

export interface GetStorefrontListingsRequest {
  storeId: string;
  page?: number;
  perPage?: number;
  status?: StoreListing["status"] | "all";
}

export interface GetStorefrontListingsResponse {
  items: StoreListing[];
  page: number;
  perPage: number;
  total: number;
}
