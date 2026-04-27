import type { CatalogWorld } from "@/lib/listings";
import type {
  MarketingCampaign,
  MarketingCoupon,
  PriceAnalyticsSnapshot,
  SellerMarketingOverview,
  SellerMarketingTool,
} from "@/entities/marketing/model";

export { mockMarketingService } from "./mock";

// Future: `http.ts` — MarketingService backed by REST/fetch.

export interface MarketingService {
  getMarketingTools(sellerId: string): Promise<SellerMarketingTool[]>;
  getCoupons(sellerId: string): Promise<MarketingCoupon[]>;
  getCampaigns(sellerId: string): Promise<MarketingCampaign[]>;
  getPriceAnalyticsSnapshots(sellerId: string): Promise<PriceAnalyticsSnapshot[]>;
  getPriceAnalyticsSnapshot(
    sellerId: string,
    world: CatalogWorld,
    categoryId: string | "all",
  ): Promise<PriceAnalyticsSnapshot | null>;
  getMarketingOverview(sellerId: string): Promise<SellerMarketingOverview>;
}
