import type { SellerService } from "./index";
import * as sellerData from "./seller-data";

export const mockSellerService: SellerService = {
  async getStorefrontSellers() {
    return Promise.resolve(sellerData.storefrontSellers);
  },
  async getStorefrontSellerById(sellerId) {
    return Promise.resolve(sellerData.getStorefrontSellerById(sellerId));
  },
  async getStorefrontSellerByListingId(listingId) {
    return Promise.resolve(sellerData.getStorefrontSellerByListingId(listingId));
  },
  async getStorefrontListingsBySellerId(sellerId) {
    return Promise.resolve(sellerData.getStorefrontListingsBySellerId(sellerId));
  },
  async getSellerListings(sellerId) {
    return Promise.resolve(sellerData.getSellerListings(sellerId));
  },
  async getSellerDashboardData(sellerId) {
    return Promise.resolve(sellerData.getSellerDashboardData(sellerId));
  },
  async getSellerPosts(sellerId) {
    return Promise.resolve(sellerData.getSellerPosts(sellerId));
  },
  async getSellerPinnedPost(sellerId) {
    return Promise.resolve(sellerData.getSellerPinnedPost(sellerId));
  },
  async getSellerPromotionState(sellerId) {
    return Promise.resolve(sellerData.getSellerPromotionState(sellerId));
  },
  async getListingMarketingBadgeData(listingId) {
    return Promise.resolve(sellerData.getListingMarketingBadgeData(listingId));
  },
};
