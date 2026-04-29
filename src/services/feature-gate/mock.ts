import type { DemoRole } from "@/components/demo-role/demo-role";
import type { EffectivePlan, StorePlan } from "@/components/subscription/subscription-provider";
import type { Entitlement, Feature, Plan } from "@/entities/billing/model";
import { getPlanById, getNextPlan, isLimitReached } from "@/entities/billing/model";
import { billingPlansMock } from "@/mocks/billing/plans";
import { auctionCreatePolicy, canCreateAuction } from "@/services/entitlements/config";

import type { FeatureGateContext, FeatureGateService, GateResult } from "./index";

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
  add("ai_listing_assistant");

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
      add("store_analytics_history_30d");
      add("store_analytics_history_90d");
      add("store_analytics_funnel");
      add("store_analytics_export");
      add("ai_listing_assistant_unlimited");
    }
    if (storeMeetsMin(snap, "business")) {
      add("store_analytics_advanced");
      add("store_analytics_history_1y");
      add("store_analytics_benchmark");
      add("store_verified_badge");
      add("growth:business");
      add("ai_listing_assistant_unlimited");
    }
  }

  if (role === "buyer" && (snap.isPro || snap.planName === "pro" || snap.planName === "business")) {
    add("ai_listing_assistant_unlimited");
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

const featureMinPlan: Partial<Record<Feature, Plan>> = {
  listing_create: "free",
  listing_promote: "starter",
  listing_boost: "pro",
  store_analytics_basic: "free",
  store_analytics_history_30d: "pro",
  store_analytics_history_90d: "pro",
  store_analytics_history_1y: "business",
  store_analytics_funnel: "pro",
  store_analytics_benchmark: "business",
  store_analytics_export: "pro",
  store_analytics_advanced: "business",
  store_marketing_campaigns: "pro",
  store_verified_badge: "business",
  ai_listing_assistant: "free",
  ai_listing_assistant_unlimited: "pro",
  auction_create: "pro",
  auction_auto_bid: "pro",
  saved_searches_alerts: "pro",
  "growth:basic": "starter",
  "growth:pro": "pro",
  "growth:business": "business",
};

const featureLabels: Partial<Record<Feature, string>> = {
  listing_create: "Создание объявлений",
  listing_promote: "Продвижение объявлений",
  listing_boost: "Буст объявлений",
  store_analytics_history_30d: "История аналитики 30 дней",
  store_analytics_history_90d: "История аналитики 90 дней",
  store_analytics_history_1y: "История аналитики 1 год",
  store_analytics_funnel: "Воронка продаж",
  store_analytics_benchmark: "Сравнение с нишей",
  store_analytics_export: "Экспорт аналитики CSV",
  store_analytics_advanced: "Расширенная аналитика",
  store_marketing_campaigns: "Маркетинговые кампании",
  ai_listing_assistant: "AI-помощник при создании объявления",
  ai_listing_assistant_unlimited: "AI-помощник без дневного лимита",
};

function upgradeForStoreFeature(feature: Feature, snap: SubscriptionFeatureSnapshot): string {
  if (snap.storePlan === "business") {
    return "Тариф магазина уже максимальный для демо.";
  }
  if (snap.storePlan === "pro" && feature === "store_analytics_advanced") {
    return "Подключите тариф «Бизнес» для магазина, чтобы открыть эту возможность.";
  }
  if (
    feature === "store_analytics_history_1y" ||
    feature === "store_analytics_benchmark" ||
    feature === "store_analytics_advanced"
  ) {
    return "Тариф «Бизнес» открывает годовую историю и сравнение с нишей.";
  }
  if (
    feature === "store_analytics_history_30d" ||
    feature === "store_analytics_history_90d" ||
    feature === "store_analytics_funnel" ||
    feature === "store_analytics_export"
  ) {
    return "Тариф «Про» и выше: глубже история, воронка и экспорт CSV.";
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
  const currentPlan = resolvePlan(role, snapshot);
  const currentPlanConfig = getPlanById(billingPlansMock, currentPlan);

  function getRequiredPlan(feature: Feature): Plan | undefined {
    return featureMinPlan[feature];
  }

  function getGateResult(feature: Feature, context?: FeatureGateContext): GateResult {
    const allowedByFeature = entitlement.features.includes(feature);
    const requiredPlan = getRequiredPlan(feature);
    const usage = context?.usage;
    const planLimit =
      feature === "listing_create"
        ? currentPlanConfig?.limits.active_listings
        : feature === "listing_boost"
          ? currentPlanConfig?.limits.boosts_per_month
          : feature === "store_marketing_campaigns"
            ? currentPlanConfig?.limits.campaigns_active
            : undefined;

    if (typeof planLimit === "number" && typeof usage === "number" && isLimitReached(planLimit, usage)) {
      return {
        allowed: false,
        reason: "limit_reached",
        requiredPlan: requiredPlan ?? getNextPlan(currentPlan) ?? "business",
        currentPlan,
        currentUsage: usage,
        limit: planLimit,
        featureLabel: featureLabels[feature],
      };
    }

    if (!allowedByFeature) {
      return {
        allowed: false,
        reason: "plan_restriction",
        requiredPlan: requiredPlan ?? getNextPlan(currentPlan) ?? "business",
        currentPlan,
        limit: typeof planLimit === "number" ? planLimit : undefined,
        currentUsage: usage,
        featureLabel: featureLabels[feature],
      };
    }

    return {
      allowed: true,
      currentPlan,
      requiredPlan,
      currentUsage: usage,
      limit: typeof planLimit === "number" ? planLimit : undefined,
      featureLabel: featureLabels[feature],
    };
  }

  function canUse(feature: Feature, context?: FeatureGateContext): boolean {
    const result = getGateResult(feature, context);
    if (!result.allowed) {
      return false;
    }
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

    if (feature === "store_analytics_history_30d" || feature === "store_analytics_history_90d") {
      return (role === "seller" || role === "all") && storeMeetsMin(snapshot, "pro");
    }

    if (feature === "store_analytics_history_1y" || feature === "store_analytics_benchmark") {
      return (role === "seller" || role === "all") && snapshot.storePlan === "business";
    }

    if (feature === "store_analytics_funnel" || feature === "store_analytics_export") {
      return (role === "seller" || role === "all") && storeMeetsMin(snapshot, "pro");
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
      return true;
    }

    if (feature === "ai_listing_assistant_unlimited") {
      if (role === "seller" || role === "all") {
        return storeMeetsMin(snapshot, "pro");
      }
      return snapshot.isPro || snapshot.planName === "pro" || snapshot.planName === "business";
    }

    if (feature === "saved_searches_alerts") {
      return role !== "seller" && (snapshot.isPro || snapshot.planName === "pro" || snapshot.planName === "business");
    }

    return entitlement.features.includes(feature);
  }

  function getLimit(feature: string): number {
    return entitlement.limits[feature] ?? 0;
  }

  function getUpgradeReason(feature: Feature): string {
    const gateResult = getGateResult(feature);
    if (gateResult.allowed) {
      return "";
    }
    if (gateResult.reason === "limit_reached") {
      return `Достигнут лимит текущего тарифа: ${gateResult.currentUsage}/${gateResult.limit}.`;
    }
    if (feature === "ai_listing_assistant_unlimited") {
      return role === "seller" || role === "all"
        ? "Снимите дневной лимит AI: тариф магазина «Про» или «Бизнес»."
        : "Безлимитный AI при создании объявлений — в подписке Pro или Business.";
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

  return { canUse, getGateResult, getLimit, getUpgradeReason };
}

export const createFeatureGateService = createMockFeatureGateService;
