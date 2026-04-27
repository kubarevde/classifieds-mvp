export type Feature =
  | "listing_create"
  | "listing_promote"
  | "listing_boost"
  | "store_analytics_basic"
  | "store_analytics_advanced"
  | "store_marketing_campaigns"
  | "store_verified_badge"
  | "ai_listing_assistant"
  | "auction_create"
  | "auction_auto_bid"
  | "saved_searches_alerts"
  /** Минимальный тариф магазина для строк growth tools (купон / закреп / кампания / баннер). */
  | "growth:basic"
  | "growth:pro"
  | "growth:business";

export type Plan = "free" | "starter" | "pro" | "business";

export interface Entitlement {
  plan: Plan;
  features: Feature[];
  limits: Record<string, number>;
}
