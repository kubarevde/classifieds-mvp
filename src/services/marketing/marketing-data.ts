import type { CatalogWorld } from "@/lib/listings";
import { getHeroBannerPlacementsBySellerId } from "@/lib/hero-board";
import type { SellerMarketingOverview } from "@/entities/marketing/model";
import {
  marketingToolsMock,
  priceAnalyticsSnapshotsMock,
  sellerCouponsMock,
  sellerMarketingCampaignsMock,
} from "@/mocks/sellers/analytics.mock";
import { sellerPromotionStateMock } from "@/mocks/sellers/listings.mock";

export function getSellerMarketingTools(sellerId: string) {
  void sellerId;
  return marketingToolsMock;
}

export function getSellerCoupons(sellerId: string) {
  return sellerCouponsMock
    .filter((coupon) => coupon.sellerId === sellerId)
    .sort((a, b) => new Date(b.validUntil).getTime() - new Date(a.validUntil).getTime());
}

export function getSellerMarketingCampaigns(sellerId: string) {
  return sellerMarketingCampaignsMock.filter((campaign) => campaign.sellerId === sellerId);
}

export function getSellerPriceAnalyticsSnapshots(sellerId: string) {
  return priceAnalyticsSnapshotsMock.filter((snapshot) => snapshot.sellerId === sellerId);
}

export function getPriceAnalyticsSnapshot(
  sellerId: string,
  world: CatalogWorld,
  categoryId: string | "all",
) {
  const snapshots = getSellerPriceAnalyticsSnapshots(sellerId);

  return (
    snapshots.find((snapshot) => snapshot.world === world && snapshot.categoryId === categoryId) ??
    snapshots.find((snapshot) => snapshot.world === world && snapshot.categoryId === "all") ??
    snapshots[0] ??
    null
  );
}

export function getSellerMarketingOverview(sellerId: string): SellerMarketingOverview {
  const promotionStates = sellerPromotionStateMock.filter((state) => state.sellerId === sellerId);
  const campaigns = getSellerMarketingCampaigns(sellerId);
  const coupons = getSellerCoupons(sellerId);
  const heroBoardPlacements = getHeroBannerPlacementsBySellerId(sellerId);

  const activeCampaignsCount = campaigns.filter((campaign) => campaign.status === "active").length;
  const activeCoupons = coupons.filter((coupon) => coupon.status === "active");
  const boostedCount = promotionStates.filter((state) => state.lastBoostedAt).length;
  const superCount = promotionStates.filter((state) => state.isSuper).length;
  const sponsoredCount = promotionStates.filter((state) => state.isSponsored).length;
  const activeHeroBoard = heroBoardPlacements.filter((placement) => placement.isActive).length;

  const activeToolTypes = [
    activeCampaignsCount > 0,
    activeCoupons.length > 0,
    boostedCount > 0,
    superCount > 0,
    sponsoredCount > 0,
    activeHeroBoard > 0,
  ].filter(Boolean).length;

  const extraViewsFromPromotion =
    activeCampaignsCount * 240 +
    sponsoredCount * 120 +
    superCount * 160 +
    boostedCount * 75 +
    activeHeroBoard * 360;

  return {
    extraViewsFromPromotion,
    activeCampaignsCount,
    activeToolTypesCount: activeToolTypes,
    activeTools: [
      {
        id: "sponsored",
        label: "Спонсорские позиции",
        status: activeCampaignsCount > 0 ? "активны" : "не запущены",
        menuKey: "sponsored",
      },
      {
        id: "coupons",
        label: "Купоны",
        status:
          activeCoupons.length > 0
            ? `${activeCoupons.length} ${activeCoupons.length === 1 ? "действует" : "действуют"}`
            : "нет активных",
        menuKey: "coupons",
      },
      {
        id: "boost",
        label: "Поднятие",
        status: boostedCount > 0 ? `${boostedCount} недавно` : "не использовалось",
        menuKey: "boosts",
      },
      {
        id: "super",
        label: "Суперобъявление",
        status: superCount > 0 ? `${superCount} активно` : "не активно",
        menuKey: "boosts",
      },
      {
        id: "hero-board",
        label: "Герой доски",
        status: activeHeroBoard > 0 ? `${activeHeroBoard} активен` : "не подключен",
        menuKey: "hero_board",
      },
    ],
  };
}
