import { useMemo } from "react";

import type { SellerDashboardListing, SellerStorefront } from "@/lib/sellers";

import {
  getNextTier,
  growthToolAccessRows,
  subscriptionTierPresentation,
  type StoreSubscriptionTierId,
} from "@/components/store-dashboard/store-dashboard-shared";
import type { Feature } from "@/entities/billing/model";
import { useFeatureGate } from "@/hooks/useFeatureGate";

function growthFeatureForMinTier(minTier: StoreSubscriptionTierId): Feature {
  if (minTier === "basic") {
    return "growth:basic";
  }
  if (minTier === "pro") {
    return "growth:pro";
  }
  return "growth:business";
}

type UseStoreOverviewSectionParams = {
  seller: SellerStorefront;
  listings: SellerDashboardListing[];
  currentSubscriptionTier: StoreSubscriptionTierId;
};

export function useStoreOverviewSectionData({
  seller,
  listings,
  currentSubscriptionTier,
}: UseStoreOverviewSectionParams) {
  const { canUse } = useFeatureGate();

  const counts = useMemo(
    () => ({
      all: listings.length,
      active: listings.filter((listing) => listing.status === "active").length,
      inactive: listings.filter((listing) => listing.status === "hidden" || listing.status === "archived")
        .length,
    }),
    [listings],
  );

  const conversionEstimatePercent = useMemo(() => {
    const ratio = seller.metrics.messagesLast30d / Math.max(1, seller.metrics.viewsLast30d);
    return Math.min(100, ratio * 100);
  }, [seller.metrics.messagesLast30d, seller.metrics.viewsLast30d]);

  const heroMetrics = useMemo(
    () => [
      {
        id: "active",
        label: "Активные объявления",
        value: String(counts.active),
      },
      {
        id: "views",
        label: "Просмотры за 30 дней",
        value: seller.metrics.viewsLast30d.toLocaleString("ru-RU"),
      },
      {
        id: "responses",
        label: "Отклики за 30 дней",
        value: seller.metrics.messagesLast30d.toLocaleString("ru-RU"),
      },
      {
        id: "conversion",
        label: "Конверсия в отклик (оценка)",
        value: `${conversionEstimatePercent.toFixed(1)}%`,
      },
    ],
    [counts.active, conversionEstimatePercent, seller.metrics.messagesLast30d, seller.metrics.viewsLast30d],
  );

  const currentTierPresentation = subscriptionTierPresentation[currentSubscriptionTier];
  const nextSubscriptionTier = getNextTier(currentSubscriptionTier);

  const availableGrowthTools = useMemo(
    () => growthToolAccessRows.filter((tool) => canUse(growthFeatureForMinTier(tool.minTier))),
    [canUse],
  );

  const lockedGrowthTools = useMemo(
    () => growthToolAccessRows.filter((tool) => !canUse(growthFeatureForMinTier(tool.minTier))),
    [canUse],
  );

  return {
    heroMetrics,
    currentTierPresentation,
    nextSubscriptionTier,
    availableGrowthTools,
    lockedGrowthTools,
  };
}
