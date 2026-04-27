export type SortOption = "newest" | "price_asc" | "price_desc";
export type ListingsView = "grid" | "list";
export type CatalogWorld =
  | "all"
  | "electronics"
  | "autos"
  | "agriculture"
  | "real_estate"
  | "jobs"
  | "services";
export type ListingWorld =
  | "base"
  | "electronics"
  | "autos"
  | "agriculture"
  | "real_estate"
  | "jobs"
  | "services";

export type UnifiedCatalogListing = {
  id: string;
  listingSaleMode?: "fixed" | "auction" | "free";
  title: string;
  price: string;
  priceValue: number;
  location: string;
  publishedAt: string;
  postedAtIso: string;
  image: string;
  condition: string;
  description: string;
  sellerName: string;
  sellerPhone: string;
  categoryId: string;
  categoryLabel: string;
  world: ListingWorld;
  worldLabel: string;
  detailsHref?: string;
};

export type UnifiedCategoryOption = {
  id: string;
  label: string;
};

export type WorldQuickFilter = {
  id: string;
  label: string;
  query: string;
  categoryId?: string;
};

export type CreateListingSubcategoryOption = {
  id: string;
  label: string;
};

export type ListingBadge = {
  id: string;
  label: string;
  tone: "agriculture" | "electronics";
};
