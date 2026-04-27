import { unifiedCatalogListings } from "@/lib/listings";
import { getHeroBannerPlacementsBySellerId } from "@/lib/hero-board";
import { mapStorefrontSeedsToStorefronts } from "@/entities/seller/mappers";
import type { SellerDashboardListing, SellerStorefront, StorefrontListing } from "@/entities/seller/model";
import type { ListingMarketingBadgeData } from "@/entities/marketing/model";
import { defaultContacts, storefrontSellerSeeds } from "@/mocks/sellers/storefront.mock";
import { sellerPromotionStateMock, sellerPostsMock } from "@/mocks/sellers/listings.mock";
import {
  getPriceAnalyticsSnapshot,
  getSellerCoupons,
  getSellerMarketingCampaigns,
  getSellerMarketingOverview,
  getSellerMarketingTools,
  getSellerPriceAnalyticsSnapshots,
} from "@/services/marketing/marketing-data";

/** Посты витрины — рядом с listing mocks; API как в legacy @/lib/sellers. */
export function getSellerPosts(sellerId: string) {
  return sellerPostsMock
    .filter((post) => post.sellerId === sellerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getSellerPinnedPost(sellerId: string) {
  return getSellerPosts(sellerId).find((post) => post.pinned) ?? null;
}

export const storefrontSellers: SellerStorefront[] = mapStorefrontSeedsToStorefronts(
  storefrontSellerSeeds,
  defaultContacts,
);

const sellerById = new Map(storefrontSellers.map((seller) => [seller.id, seller]));

const sellerIdByListingId = new Map<string, string>();
storefrontSellers.forEach((seller) => {
  seller.listingRefs.forEach((reference) => {
    sellerIdByListingId.set(reference.listingId, seller.id);
  });
});

export function getStorefrontSellerById(sellerId: string) {
  return sellerById.get(sellerId);
}

export function getStorefrontSellerByListingId(listingId: string) {
  const sellerId = sellerIdByListingId.get(listingId);
  if (!sellerId) {
    return null;
  }
  return sellerById.get(sellerId) ?? null;
}

export function getStorefrontListingsBySellerId(sellerId: string): StorefrontListing[] {
  const seller = getStorefrontSellerById(sellerId);
  if (!seller) {
    return [];
  }

  return seller.listingRefs
    .map((reference) => {
      const listing = unifiedCatalogListings.find((item) => item.id === reference.listingId);
      if (!listing) {
        return null;
      }
      return { ...listing, status: reference.status };
    })
    .filter((listing): listing is StorefrontListing => listing !== null);
}

export function getSellerListings(sellerId: string): SellerDashboardListing[] {
  const seller = getStorefrontSellerById(sellerId);
  if (!seller) {
    return [];
  }

  const listingRefById = new Map(seller.listingRefs.map((reference) => [reference.listingId, reference]));

  return getStorefrontListingsBySellerId(sellerId).map((listing, index) => {
    const createdAtIso = listing.postedAtIso;
    const updatedAtIso = new Date(
      new Date(createdAtIso).getTime() + Math.max(1, (index + 1) * 2) * 24 * 60 * 60 * 1000,
    ).toISOString();
    const views = 70 + index * 38 + seller.id.length * 5;
    const messages = Math.max(1, Math.round(views / 16));

    return {
      ...listing,
      status: listingRefById.get(listing.id)?.status ?? listing.status,
      createdAtIso,
      updatedAtIso,
      views,
      messages,
    };
  });
}

export function getSellerPromotionState(sellerId: string) {
  return sellerPromotionStateMock.filter((state) => state.sellerId === sellerId);
}

export function getSellerDashboardData(sellerId: string) {
  const seller = getStorefrontSellerById(sellerId);
  if (!seller) {
    return null;
  }

  const listings = getSellerListings(sellerId);
  const activeListingsCount = listings.filter((listing) => listing.status === "active").length;

  return {
    seller: {
      ...seller,
      metrics: {
        ...seller.metrics,
        activeListingsCount,
      },
    },
    listings,
    marketingTools: getSellerMarketingTools(sellerId),
    posts: getSellerPosts(sellerId),
    pinnedPost: getSellerPinnedPost(sellerId),
    coupons: getSellerCoupons(sellerId),
    promotionState: getSellerPromotionState(sellerId),
    campaigns: getSellerMarketingCampaigns(sellerId),
    priceAnalytics: getSellerPriceAnalyticsSnapshots(sellerId),
    marketingOverview: getSellerMarketingOverview(sellerId),
    heroBoardPlacements: getHeroBannerPlacementsBySellerId(sellerId),
  };
}

export {
  getPriceAnalyticsSnapshot,
  getSellerCoupons,
  getSellerMarketingCampaigns,
  getSellerMarketingOverview,
  getSellerMarketingTools,
  getSellerPriceAnalyticsSnapshots,
};

export function getListingMarketingBadgeData(listingId: string): ListingMarketingBadgeData {
  const seller = getStorefrontSellerByListingId(listingId);
  if (!seller) {
    return { coupon: null, isSuper: false, isSponsored: false };
  }

  const promotion = getSellerPromotionState(seller.id).find((state) => state.listingId === listingId);
  const coupon =
    getSellerCoupons(seller.id).find((item) => {
      if (item.status !== "active" || !item.showOnListingCard) {
        return false;
      }
      if (item.scope === "store") {
        return true;
      }
      return item.listingIds.includes(listingId);
    }) ?? null;

  return {
    coupon,
    isSuper: Boolean(promotion?.isSuper),
    isSponsored: Boolean(promotion?.isSponsored),
  };
}
