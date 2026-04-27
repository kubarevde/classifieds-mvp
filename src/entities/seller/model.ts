import type { CatalogWorld, UnifiedCatalogListing } from "@/lib/listings";

export type SellerType =
  | "private_seller"
  | "store_business"
  | "agriculture_oriented"
  | "electronics_oriented";

export type SellerListingStatus = "active" | "hidden" | "archived";
export type SellerPlanTier = "free" | "pro" | "business";

export type SellerTrustBadge = {
  id: string;
  label: string;
};

export type SellerListingRef = {
  listingId: string;
  status: SellerListingStatus;
};

/** Метрики витрины / кабинета продавца (synonym: SellerMetrics). */
export type SellerDashboardMetrics = {
  viewsLast30d: number;
  messagesLast30d: number;
  activeListingsCount: number;
  rating: number;
  responseSpeedLabel: string;
};

export type SellerMetrics = SellerDashboardMetrics;

export type SellerContactLinks = {
  website: string;
  telegram: string;
  vk: string;
};

export type SellerStorefront = {
  id: string;
  displayName: string;
  storefrontName: string;
  type: SellerType;
  shortDescription: string;
  city: string;
  region: string;
  memberSinceLabel: string;
  memberSinceYear: number;
  phone: string;
  avatarLabel: string;
  heroGradientClass: string;
  accentClass: string;
  worldHint: CatalogWorld;
  responseSpeedLabel: string;
  planTier: SellerPlanTier;
  metrics: SellerDashboardMetrics;
  followersCount: number;
  contactLinks: SellerContactLinks;
  trustBadges: SellerTrustBadge[];
  listingRefs: SellerListingRef[];
};

export type SellerStorefrontSeed = Omit<
  SellerStorefront,
  "planTier" | "metrics" | "followersCount" | "contactLinks"
> & {
  planTier?: SellerPlanTier;
  metrics?: Omit<SellerDashboardMetrics, "activeListingsCount">;
  followersCount?: number;
  contactLinks?: Partial<SellerContactLinks>;
};

export type StorefrontListing = UnifiedCatalogListing & {
  status: SellerListingStatus;
};

export type SellerDashboardListing = StorefrontListing & {
  createdAtIso: string;
  updatedAtIso: string;
  views: number;
  messages: number;
};

export type SellerPostType = "news" | "promo" | "product" | "video";

export type SellerPost = {
  id: string;
  sellerId: string;
  type: SellerPostType;
  title: string;
  body: string;
  createdAt: string;
  imageUrl?: string;
  pinned?: boolean;
};
