import type { MarketingService } from "./index";
import * as marketingData from "./marketing-data";

export const mockMarketingService: MarketingService = {
  async getMarketingTools(sellerId) {
    return Promise.resolve(marketingData.getSellerMarketingTools(sellerId));
  },
  async getCoupons(sellerId) {
    return Promise.resolve(marketingData.getSellerCoupons(sellerId));
  },
  async getCampaigns(sellerId) {
    return Promise.resolve(marketingData.getSellerMarketingCampaigns(sellerId));
  },
  async getPriceAnalyticsSnapshots(sellerId) {
    return Promise.resolve(marketingData.getSellerPriceAnalyticsSnapshots(sellerId));
  },
  async getPriceAnalyticsSnapshot(sellerId, world, categoryId) {
    return Promise.resolve(marketingData.getPriceAnalyticsSnapshot(sellerId, world, categoryId));
  },
  async getMarketingOverview(sellerId) {
    return Promise.resolve(marketingData.getSellerMarketingOverview(sellerId));
  },
};
