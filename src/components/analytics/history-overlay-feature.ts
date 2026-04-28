import type { Feature } from "@/entities/billing/model";

/** Какую фичу показывать в CTA оверлея, когда выбранный период шире доступной истории. */
export function featureForHistoryOverlay(historyCapDays: number): Feature {
  if (historyCapDays < 30) {
    return "store_analytics_history_30d";
  }
  if (historyCapDays < 90) {
    return "store_analytics_history_90d";
  }
  return "store_analytics_history_1y";
}
