import type { DemoRole } from "@/components/demo-role/demo-role";
import type { EffectivePlan, StorePlan } from "@/components/subscription/subscription-provider";
import type { Entitlement, Feature, Plan } from "@/entities/billing/model";
import { auctionCreatePolicy, canCreateAuction } from "@/services/entitlements/config";

import type { FeatureGateContext, FeatureGateService } from "./index";

export type SubscriptionFeatureSnapshot = {
  isPro: boolean;
  planName: EffectivePlan;
  storePlan: StorePlan;
};

const storeRank: Record<StorePlan, number> = {
  basic: 0,
  pro: 1,
  business: 2,
};

function mapStorePlanToBillingPlan(storePlan: StorePlan): Plan {
  if (storePlan === "business") {
    return "business";
  }
  if (storePlan === "pro") {
    return "pro";
  }
  return "starter";
}

function mapBuyerPlan(planName: EffectivePlan, isPro: boolean): Plan {
  if (planName === "business") {
    return "business";
  }
  if (planName === "pro" || isPro) {
    return "pro";
  }
  return "free";
}

function resolvePlan(role: DemoRole, snap: SubscriptionFeatureSnapshot): Plan {
  if (role === "seller") {
    return mapStorePlanToBillingPlan(snap.storePlan);
  }
  if (role === "all") {
    return mapStorePlanToBillingPlan(snap.storePlan);
  }
  return mapBuyerPlan(snap.planName, snap.isPro);
}

function storeMeetsMin(snap: SubscriptionFeatureSnapshot, min: StorePlan): boolean {
  return storeRank[snap.storePlan] >= storeRank[min];
}

function buildFeatures(role: DemoRole, snap: SubscriptionFeatureSnapshot): Feature[] {
  const out: Feature[] = [];
  const add = (f: Feature) => {
    if (!out.includes(f)) {
      out.push(f);
    }
  };

  add("listing_create");

  if (role === "seller" || role === "all") {
    if (storeMeetsMin(snap, "basic")) {
      add("store_analytics_basic");
      add("growth:basic");
    }
    if (storeMeetsMin(snap, "pro")) {
      add("listing_promote");
      add("listing_boost");
      add("store_marketing_campaigns");
      add("growth:pro");
    }
    if (storeMeetsMin(snap, "business")) {
      add("store_analytics_advanced");
      add("store_verified_badge");
      add("growth:business");
    }
  }

  const aiListing =
    role === "seller" ? snap.storePlan === "business" : snap.planName === "business" || snap.isPro;
  if (aiListing) {
    add("ai_listing_assistant");
  }

  const savedAlerts = role !== "seller" && (snap.isPro || snap.planName === "pro" || snap.planName === "business");
  if (savedAlerts) {
    add("saved_searches_alerts");
  }
  if (snap.isPro || snap.planName === "pro" || snap.planName === "business") {
    add("auction_auto_bid");
  }
  if (
    canCreateAuction({
      role,
      storePlan: snap.storePlan,
      buyerPlan: snap.planName,
      isBuyerPro: snap.isPro,
    })
  ) {
    add("auction_create");
  }

  return out;
}

function buildLimits(role: DemoRole, snap: SubscriptionFeatureSnapshot): Record<string, number> {
  const tier = snap.storePlan;
  const listingCap =
    role === "seller" || role === "all" ? (tier === "business" ? 120 : tier === "pro" ? 40 : 12) : 999;

  const alertsCap = snap.planName === "business" ? 50 : snap.isPro || snap.planName === "pro" ? 20 : 3;

  return {
    listing_create: listingCap,
    saved_searches_alerts: alertsCap,
    auction_create: canCreateAuction({
      role,
      storePlan: snap.storePlan,
      buyerPlan: snap.planName,
      isBuyerPro: snap.isPro,
    })
      ? role === "buyer"
        ? 5
        : snap.storePlan === "business"
          ? 10
          : 5
      : 0,
    auction_auto_bid: snap.isPro || snap.planName === "pro" || snap.planName === "business" ? 1 : 0,
  };
}

function buildEntitlement(role: DemoRole, snap: SubscriptionFeatureSnapshot): Entitlement {
  return {
    plan: resolvePlan(role, snap),
    features: buildFeatures(role, snap),
    limits: buildLimits(role, snap),
  };
}

function upgradeForStoreFeature(feature: Feature, snap: SubscriptionFeatureSnapshot): string {
  if (snap.storePlan === "business") {
    return "Тариф магазина уже максимальный для демо.";
  }
  if (snap.storePlan === "pro" && feature === "store_analytics_advanced") {
    return "Подключите тариф «Бизнес» для магазина, чтобы открыть эту возможность.";
  }
  return "Перейдите к тарифам магазина и выберите более высокий уровень.";
}

function upgradeForBuyerFeature(): string {
  return "Оформите Pro или Business в разделе подписки, чтобы открыть эту возможность.";
}

export function createMockFeatureGateService(
  snapshot: SubscriptionFeatureSnapshot,
  role: DemoRole,
): FeatureGateService {
  const entitlement = buildEntitlement(role, snapshot);

  function canUse(feature: Feature, context?: FeatureGateContext): boolean {
    void context;
    if (feature === "growth:basic" || feature === "growth:pro" || feature === "growth:business") {
      const min = feature.slice("growth:".length) as StorePlan;
      return storeMeetsMin(snapshot, min);
    }

    if (feature === "listing_create") {
      return true;
    }

    if (feature === "store_analytics_basic") {
      return role === "seller" || role === "all";
    }

    if (feature === "store_analytics_advanced") {
      return (role === "seller" || role === "all") && snapshot.storePlan === "business";
    }

    if (feature === "listing_promote" || feature === "listing_boost" || feature === "store_marketing_campaigns") {
      return (role === "seller" || role === "all") && storeMeetsMin(snapshot, "pro");
    }

    if (feature === "store_verified_badge") {
      return (role === "seller" || role === "all") && snapshot.storePlan === "business";
    }

    if (feature === "auction_create") {
      return canCreateAuction({
        role,
        storePlan: snapshot.storePlan,
        buyerPlan: snapshot.planName,
        isBuyerPro: snapshot.isPro,
      });
    }
    if (feature === "auction_auto_bid") {
      return snapshot.isPro || snapshot.planName === "pro" || snapshot.planName === "business";
    }

    if (feature === "ai_listing_assistant") {
      return role === "seller"
        ? snapshot.storePlan === "business"
        : snapshot.planName === "business" || snapshot.isPro;
    }

    if (feature === "saved_searches_alerts") {
      return role !== "seller" && (snapshot.isPro || snapshot.planName === "pro" || snapshot.planName === "business");
    }

    return false;
  }

  function getLimit(feature: string): number {
    return entitlement.limits[feature] ?? 0;
  }

  function getUpgradeReason(feature: Feature): string {
    if (canUse(feature)) {
      return "";
    }
    if (feature === "ai_listing_assistant") {
      return role === "seller"
        ? "AI-помощник при создании объявлений доступен на тарифе «Бизнес» для магазина."
        : "AI-помощник доступен в подписке Pro или Business.";
    }
    if (feature === "saved_searches_alerts") {
      return "Уведомления по сохранённым поискам доступны в Pro и Business.";
    }
    if (feature === "auction_create") {
      return auctionCreatePolicy.description;
    }
    if (feature === "auction_auto_bid") {
      return "Auto-bid доступен в подписке Pro и Business.";
    }
    if (feature.startsWith("growth:") || feature.startsWith("store_") || feature.startsWith("listing_")) {
      if (role === "seller" || role === "all") {
        return upgradeForStoreFeature(feature, snapshot);
      }
      return upgradeForBuyerFeature();
    }
    return "Обновите тариф, чтобы получить доступ.";
  }

  return { canUse, getLimit, getUpgradeReason };
}
