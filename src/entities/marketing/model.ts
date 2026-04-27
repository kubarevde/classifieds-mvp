import type { CatalogWorld } from "@/lib/listings";

export type SellerMarketingAccessTier = "free" | "pro" | "business" | "one_time";

export type SellerMarketingTool = {
  id: string;
  title: string;
  description: string;
  tier: SellerMarketingAccessTier;
  ctaLabel: "Узнать больше" | "Подключить";
};

export type CouponDiscountType = "fixed" | "percent";
export type CouponStatus = "active" | "expired" | "disabled";
export type CouponScope = "store" | "listings";

export type MarketingCoupon = {
  id: string;
  sellerId: string;
  code: string;
  title: string;
  discountType: CouponDiscountType;
  discountValue: number;
  scope: CouponScope;
  listingIds: string[];
  validUntil: string;
  status: CouponStatus;
  showOnListingCard: boolean;
};

export type ListingPromotionState = {
  sellerId: string;
  listingId: string;
  lastBoostedAt: string | null;
  isSuper: boolean;
  isSponsored: boolean;
};

export type CampaignStatus = "active" | "paused";
export type CampaignPlacement = "catalog" | "thematic";

export type MarketingCampaign = {
  id: string;
  sellerId: string;
  name: string;
  listingIds: string[];
  world: CatalogWorld;
  placements: CampaignPlacement[];
  status: CampaignStatus;
};

export type PriceComparableRelation = "cheaper_than_you" | "more_expensive_than_you" | "close_to_you";

export type PriceComparableRow = {
  id: string;
  title: string;
  price: number;
  relation: PriceComparableRelation;
};

export type PriceAnalyticsSnapshot = {
  sellerId: string;
  world: CatalogWorld;
  categoryId: string | "all";
  marketMin: number;
  marketMedian: number;
  marketMax: number;
  sellerAverage: number;
  comparables: PriceComparableRow[];
};

export type MarketingMenuKey =
  | "overview"
  | "price_analytics"
  | "mailings"
  | "coupons"
  | "planner"
  | "video"
  | "sponsored"
  | "boosts"
  | "hero_board";

export type SellerMarketingOverview = {
  extraViewsFromPromotion: number;
  activeCampaignsCount: number;
  activeToolTypesCount: number;
  activeTools: { id: string; label: string; status: string; menuKey: MarketingMenuKey }[];
};

/** Агрегированные промо-метрики для дашборда (alias). */
export type PromoAnalytics = SellerMarketingOverview;

export type ListingMarketingBadgeData = {
  coupon: MarketingCoupon | null;
  isSuper: boolean;
  isSponsored: boolean;
};
