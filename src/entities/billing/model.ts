export type Feature =
  | "listing_create"
  | "listing_promote"
  | "listing_boost"
  | "store_analytics_basic"
  | "store_analytics_history_30d"
  | "store_analytics_history_90d"
  | "store_analytics_history_1y"
  | "store_analytics_funnel"
  | "store_analytics_benchmark"
  | "store_analytics_export"
  | "store_analytics_advanced"
  | "store_marketing_campaigns"
  | "store_verified_badge"
  | "ai_listing_assistant"
  | "ai_listing_assistant_unlimited"
  | "auction_create"
  | "auction_auto_bid"
  | "saved_searches_alerts"
  /** Минимальный тариф магазина для строк growth tools (купон / закреп / кампания / баннер). */
  | "growth:basic"
  | "growth:pro"
  | "growth:business";

export type Plan = "free" | "starter" | "pro" | "business";

export type MonetizationFeature = Feature;

export interface Entitlement {
  plan: Plan;
  features: Feature[];
  limits: Record<string, number>;
}

export interface SubscriptionPlan {
  id: Plan;
  name: string;
  price: {
    monthly: number;
    annual: number;
  };
  currency: "RUB";
  features: MonetizationFeature[];
  limits: {
    active_listings: number;
    photos_per_listing: number;
    listing_duration_days: number;
    boosts_per_month: number;
    featured_days_per_month: number;
    analytics_history_days: number;
    campaigns_active: number;
    team_members: number;
  };
  badge?: string;
  popular?: boolean;
}

export interface UsageSnapshot {
  active_listings: number;
  boosts_used_this_month: number;
  featured_days_used_this_month: number;
  campaigns_active: number;
  team_members: number;
}

export interface BillingState {
  currentPlan: Plan;
  billingCycle: "monthly" | "annual";
  trialEndsAt?: Date | null;
  subscriptionStatus: "active" | "trialing" | "past_due" | "canceled";
  usage: UsageSnapshot;
  nextInvoiceAt?: Date | null;
}

const PLAN_ORDER: Plan[] = ["free", "starter", "pro", "business"];

export function getPlanById(plans: SubscriptionPlan[], plan: Plan): SubscriptionPlan | undefined {
  return plans.find((item) => item.id === plan);
}

export function getNextPlan(plan: Plan): Plan | null {
  const idx = PLAN_ORDER.indexOf(plan);
  if (idx < 0 || idx >= PLAN_ORDER.length - 1) {
    return null;
  }
  return PLAN_ORDER[idx + 1];
}

export function isLimitReached(limit: number, used: number): boolean {
  if (limit < 0) {
    return false;
  }
  return used >= limit;
}

export function getUsagePercent(used: number, limit: number): number {
  if (limit < 0) {
    return 0;
  }
  if (limit === 0) {
    return 100;
  }
  return Math.min(100, Math.max(0, Math.round((used / limit) * 100)));
}

export function formatPlanPrice(
  plan: SubscriptionPlan,
  cycle: "monthly" | "annual",
  locale = "ru-RU",
): string {
  const value = cycle === "annual" ? plan.price.annual : plan.price.monthly;
  if (value === 0) {
    return "Бесплатно";
  }
  const period = cycle === "annual" ? "/год" : "/мес";
  return `${new Intl.NumberFormat(locale).format(value)} ₽${period}`;
}
