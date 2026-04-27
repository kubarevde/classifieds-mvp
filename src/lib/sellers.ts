/**
 * Обратная совместимость: публичный API домена продавцов / маркетинга.
 * Реализация: `src/services/sellers/seller-data.ts`, `src/services/marketing/marketing-data.ts`, entities, mocks.
 */

export type {
  SellerType,
  SellerListingStatus,
  SellerPlanTier,
  SellerTrustBadge,
  SellerListingRef,
  SellerDashboardMetrics,
  SellerMetrics,
  SellerContactLinks,
  SellerStorefront,
  SellerStorefrontSeed,
  StorefrontListing,
  SellerDashboardListing,
  SellerPostType,
  SellerPost,
} from "@/entities/seller/model";

export type {
  SellerMarketingAccessTier,
  SellerMarketingTool,
  CouponDiscountType,
  CouponStatus,
  CouponScope,
  MarketingCoupon,
  ListingPromotionState,
  CampaignStatus,
  CampaignPlacement,
  MarketingCampaign,
  PriceComparableRelation,
  PriceComparableRow,
  PriceAnalyticsSnapshot,
  SellerMarketingOverview,
  PromoAnalytics,
  ListingMarketingBadgeData,
  MarketingMenuKey,
} from "@/entities/marketing/model";

export {
  getSellerTypeLabel,
  getSellerPlanTierLabel,
  getMarketingTierLabel,
} from "@/entities/seller/mappers";

export {
  storefrontSellers,
  getStorefrontSellerById,
  getStorefrontSellerByListingId,
  getStorefrontListingsBySellerId,
  getSellerListings,
  getSellerDashboardData,
  getSellerPosts,
  getSellerPinnedPost,
  getSellerCoupons,
  getSellerPromotionState,
  getSellerMarketingCampaigns,
  getSellerPriceAnalyticsSnapshots,
  getPriceAnalyticsSnapshot,
  getListingMarketingBadgeData,
  getSellerMarketingOverview,
  getSellerMarketingTools,
} from "@/services/sellers/seller-data";

export type { HeroBannerPlacement as HeroBoardPlacement } from "@/lib/hero-board";
export { getActiveHeroBanner as getCurrentHeroBoardPlacement, getActiveHeroBannerForWorld as getHeroBoardPlacementForWorld } from "@/lib/hero-board";
