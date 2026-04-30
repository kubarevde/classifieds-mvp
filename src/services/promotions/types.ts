export type PromotionType = "boost" | "featured_listing" | "homepage_feature" | "store_spotlight";

export type PromotionStatus = "draft" | "scheduled" | "active" | "paused" | "expired" | "rejected";

export type PromotionTargetType = "listing" | "store";

export type PromotionSource = "subscription_entitlement" | "paid_purchase" | "admin_grant";

export type PromotionBillingModel = "one_time" | "duration_based";

export type AdminPromotion = {
  id: string;
  type: PromotionType;
  targetType: PromotionTargetType;
  targetId: string;
  title: string;
  ownerId: string;
  storeId?: string | null;
  status: PromotionStatus;
  price: number;
  currency: "RUB";
  billingModel: PromotionBillingModel;
  startedAt?: string | null;
  endsAt?: string | null;
  placementKey?: string | null;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions?: number;
  source: PromotionSource;
  flagged?: boolean;
  notesCount?: number;
  /** Подозрительно высокий CTR (mock-эвристика). */
  suspiciousCtr?: boolean;
  /** Повторные админские гранты по селлеру (mock). */
  repeatedAdminGrants?: boolean;
  linkedSubscriptionId?: string | null;
  linkedInvoiceId?: string | null;
  campaignId?: string | null;
};

export type AdminPromotionSlot = {
  id: string;
  key: string;
  title: string;
  location: "homepage" | "category" | "world" | "search";
  capacity: number;
  activeCount: number;
  pricingModel: "fixed" | "auction_mock";
  basePrice: number;
  fillRate: number;
  status: "active" | "paused";
  /** Для отображения привязки к миру/категории (mock). */
  scopeLabel?: string | null;
};

export type AdminPromoCampaignStatus = "draft" | "scheduled" | "active" | "paused" | "completed" | "cancelled";

export type AdminPromoCampaign = {
  id: string;
  title: string;
  status: AdminPromoCampaignStatus;
  targetScope: "all" | "stores" | "new_sellers" | "specific_world";
  targetScopeLabel?: string | null;
  linkedPromotionIds: string[];
  budget: number;
  spent: number;
  startsAt: string;
  endsAt?: string | null;
};

export type AdminPromotionPricingRule = {
  id: string;
  promotionType: PromotionType;
  targetScope: "default" | "world" | "category" | "plan";
  targetValue: string;
  basePrice: number;
  durationDays?: number | null;
  active: boolean;
  /** Связь с entitlements в подписке (mock-текст). */
  entitlementHint?: string | null;
};

export type AdminPromotionStats = {
  activePromotions: number;
  scheduledPromotions: number;
  expiringSoon: number;
  totalPromoRevenue: number;
  fillRateAvg: number;
  flaggedPromotions: number;
};

export type AdminPromotionListFilters = {
  type?: PromotionType | "all";
  status?: PromotionStatus | "all";
  source?: PromotionSource | "all";
  flagged?: "all" | "1";
  expiringSoon?: boolean;
  ownerId?: string;
  storeId?: string;
  placementKey?: string;
  search?: string;
};

export type AdminPromotionBulkAction =
  | "pause"
  | "resume"
  | "expire"
  | "flag"
  | "unflag"
  | "revoke_admin_grant";

export type AdminPromotionSlotPatch = Partial<Pick<AdminPromotionSlot, "capacity" | "status" | "activeCount">>;

export type AdminPromoCampaignPatch = Partial<
  Pick<AdminPromoCampaign, "status" | "spent" | "budget" | "endsAt" | "linkedPromotionIds">
>;
