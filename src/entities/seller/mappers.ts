import type { SellerMarketingAccessTier } from "@/entities/marketing/model";

import type {
  SellerContactLinks,
  SellerDashboardMetrics,
  SellerPlanTier,
  SellerStorefront,
  SellerStorefrontSeed,
  SellerType,
} from "./model";

const sellerTypeLabels: Record<SellerType, string> = {
  private_seller: "Частный продавец",
  store_business: "Магазин",
  agriculture_oriented: "Фермерское хозяйство",
  electronics_oriented: "Поставщик электроники",
};

const sellerPlanTierLabels: Record<SellerPlanTier, string> = {
  free: "Базовый",
  pro: "Про",
  business: "Бизнес",
};

const marketingTierLabels: Record<SellerMarketingAccessTier, string> = {
  free: "Бесплатно",
  pro: "Про",
  business: "Бизнес",
  one_time: "Разовая покупка",
};

export function getSellerTypeLabel(type: SellerType): string {
  return sellerTypeLabels[type];
}

export function getSellerPlanTierLabel(tier: SellerPlanTier): string {
  return sellerPlanTierLabels[tier];
}

export function getMarketingTierLabel(tier: SellerMarketingAccessTier): string {
  return marketingTierLabels[tier];
}

export function getSuggestedPlanTier(type: SellerType): SellerPlanTier {
  if (type === "electronics_oriented") {
    return "pro";
  }
  if (type === "agriculture_oriented" || type === "store_business") {
    return "business";
  }
  return "free";
}

export function getDefaultMetrics(seed: SellerStorefrontSeed, index: number): SellerDashboardMetrics {
  const activeListingsCount = seed.listingRefs.filter((item) => item.status === "active").length;
  const baselineViews = 900 + activeListingsCount * 230 + index * 65;
  return {
    viewsLast30d: seed.metrics?.viewsLast30d ?? baselineViews,
    messagesLast30d: seed.metrics?.messagesLast30d ?? Math.round(baselineViews / 11),
    activeListingsCount,
    rating: seed.metrics?.rating ?? Number((4.6 + (index % 4) * 0.1).toFixed(1)),
    responseSpeedLabel: seed.metrics?.responseSpeedLabel ?? seed.responseSpeedLabel,
  };
}

export function mapStorefrontSeedsToStorefronts(
  seeds: readonly SellerStorefrontSeed[],
  defaultContacts: SellerContactLinks,
): SellerStorefront[] {
  return seeds.map((seed, index) => ({
    ...seed,
    planTier: seed.planTier ?? getSuggestedPlanTier(seed.type),
    followersCount: seed.followersCount ?? 120 + index * 17,
    metrics: getDefaultMetrics(seed, index),
    contactLinks: {
      website: seed.contactLinks?.website ?? defaultContacts.website,
      telegram: seed.contactLinks?.telegram ?? defaultContacts.telegram,
      vk: seed.contactLinks?.vk ?? defaultContacts.vk,
    },
  }));
}
