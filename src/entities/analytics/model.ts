/**
 * Доменная модель Store Analytics 2.0.
 * Даты в рядах — ISO YYYY-MM-DD (дружелюбно к JSON и CSV); в UI при необходимости парсятся в Date.
 */

export type StoreAnalyticsPeriod = "7d" | "30d" | "90d" | "1y";

/** Точка временного ряда (значение за календарный день). */
export type TimeSeriesPoint = {
  date: string;
  value: number;
};

/** Детальная аналитика по объявлению (расширение; витрина может использовать укороченный top-listings). */
export type ListingAnalytics = {
  listingId: string;
  views: TimeSeriesPoint[];
  clicks: TimeSeriesPoint[];
  contacts: TimeSeriesPoint[];
  favorites: TimeSeriesPoint[];
  conversionRate: number;
  avgPosition: number;
};

export type FunnelStep = {
  label: string;
  value: number;
};

export type CompetitorBenchmark = {
  niche: string;
  yourStore: number;
  nicheAverage: number;
  metric: string;
};

export type TopListingAnalyticsRow = {
  listingId: string;
  views: number;
  contacts: number;
  favorites: number;
  conversionRate: number;
};

export type CategoryBreakdownRow = {
  category: string;
  value: number;
};

/** Агрегированный снимок аналитики магазина за выбранный период. */
export type StoreAnalytics = {
  storeId: string;
  period: StoreAnalyticsPeriod;
  revenue: TimeSeriesPoint[];
  orders: TimeSeriesPoint[];
  views: TimeSeriesPoint[];
  clicks: TimeSeriesPoint[];
  contacts: TimeSeriesPoint[];
  newFollowers: TimeSeriesPoint[];
  /** Доля просмотров по категориям (сумма ~100). */
  categoryBreakdown: CategoryBreakdownRow[];
  topListings: TopListingAnalyticsRow[];
  funnelData: FunnelStep[];
  competitorBenchmark: CompetitorBenchmark[];
};

export type StoreInsightSeverity = "info" | "success" | "warning";

export type StoreInsight = {
  id: string;
  kind: string;
  title: string;
  body: string;
  severity: StoreInsightSeverity;
};
