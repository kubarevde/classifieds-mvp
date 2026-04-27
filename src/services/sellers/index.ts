import type { HeroBannerPlacement } from "@/lib/hero-board";
import type {
  ListingMarketingBadgeData,
  ListingPromotionState,
  MarketingCampaign,
  MarketingCoupon,
  PriceAnalyticsSnapshot,
  SellerMarketingOverview,
  SellerMarketingTool,
} from "@/entities/marketing/model";
import type {
  SellerDashboardListing,
  SellerPost,
  SellerStorefront,
  StorefrontListing,
} from "@/entities/seller/model";

export { mockSellerService } from "./mock";

// Future: `http.ts` — SellerService backed by REST/fetch (replace mock in DI).

export type SellerDashboardBundle = {
  seller: SellerStorefront;
  listings: SellerDashboardListing[];
  marketingTools: SellerMarketingTool[];
  posts: SellerPost[];
  pinnedPost: SellerPost | null;
  coupons: MarketingCoupon[];
  promotionState: ListingPromotionState[];
  campaigns: MarketingCampaign[];
  priceAnalytics: PriceAnalyticsSnapshot[];
  marketingOverview: SellerMarketingOverview;
  heroBoardPlacements: HeroBannerPlacement[];
};

export interface SellerService {
  getStorefrontSellers(): Promise<readonly SellerStorefront[]>;
  getStorefrontSellerById(sellerId: string): Promise<SellerStorefront | undefined>;
  getStorefrontSellerByListingId(listingId: string): Promise<SellerStorefront | null>;
  getStorefrontListingsBySellerId(sellerId: string): Promise<StorefrontListing[]>;
  getSellerListings(sellerId: string): Promise<SellerDashboardListing[]>;
  getSellerDashboardData(sellerId: string): Promise<SellerDashboardBundle | null>;
  getSellerPosts(sellerId: string): Promise<SellerPost[]>;
  getSellerPinnedPost(sellerId: string): Promise<SellerPost | null>;
  getSellerPromotionState(sellerId: string): Promise<ListingPromotionState[]>;
  getListingMarketingBadgeData(listingId: string): Promise<ListingMarketingBadgeData>;
}
