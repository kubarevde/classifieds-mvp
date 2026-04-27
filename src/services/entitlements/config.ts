import type { StoreSubscriptionTierId } from "@/components/store-dashboard/store-dashboard-shared";
import type { DemoRole } from "@/components/demo-role/demo-role";

export const storeFeatureMinTier = {
  coupons: "pro",
  price_analytics: "pro",
  mailings: "business",
  planner: "business",
  video: "business",
  sponsored: "business",
  boosts: "pro",
  super: "business",
} as const satisfies Record<string, StoreSubscriptionTierId>;

export type BuyerPlanTier = "demo" | "pro" | "business";
export type StorePlanTier = "basic" | "pro" | "business";

export const auctionCreatePolicy = {
  label: "Создание аукционов",
  roles: ["buyer", "seller", "all"] as DemoRole[],
  storeMinPlan: "pro" as StorePlanTier,
  buyerPlans: ["pro", "business"] as BuyerPlanTier[],
  description:
    "Частные пользователи могут создавать аукционы на Pro и Business. Магазины — на Store Pro и Business.",
};

export function isStoreFeatureAllowed(
  currentTier: StoreSubscriptionTierId,
  requiredTier: StoreSubscriptionTierId,
) {
  const rank: Record<StoreSubscriptionTierId, number> = { basic: 0, pro: 1, business: 2 };
  return rank[currentTier] >= rank[requiredTier];
}

export function canCreateAuction(args: {
  role: DemoRole;
  storePlan: StorePlanTier;
  buyerPlan: BuyerPlanTier;
  isBuyerPro: boolean;
}) {
  const canUseStoreRule =
    (args.role === "seller" || args.role === "all") &&
    isStoreFeatureAllowed(args.storePlan, auctionCreatePolicy.storeMinPlan);

  const canUseBuyerRule = args.role === "buyer" || args.role === "all";
  const effectiveBuyerPlan: BuyerPlanTier = args.isBuyerPro ? "pro" : args.buyerPlan;
  const canUseBuyerPlan =
    canUseBuyerRule && auctionCreatePolicy.buyerPlans.includes(effectiveBuyerPlan);

  return canUseStoreRule || canUseBuyerPlan;
}
