import type { StoreAnalytics, StoreAnalyticsPeriod, StoreInsight } from "@/entities/analytics/model";
import {
  exportStoreAnalyticsCsvMock,
  getStoreAnalyticsMock,
  getStoreInsightsMock,
} from "@/services/analytics/mock";

export type { StoreAnalytics, StoreAnalyticsPeriod, StoreInsight } from "@/entities/analytics/model";

export type StoreAnalyticsService = {
  getStoreAnalytics(storeId: string, period: StoreAnalyticsPeriod): Promise<StoreAnalytics>;
  exportStoreAnalyticsCsv(storeId: string, period: StoreAnalyticsPeriod): Promise<string>;
  getStoreInsights(storeId: string, period: StoreAnalyticsPeriod): Promise<StoreInsight[]>;
};

/** Демо-сервис; позже заменяется на HTTP-клиент с тем же контрактом. */
export const mockStoreAnalyticsService: StoreAnalyticsService = {
  getStoreAnalytics: getStoreAnalyticsMock,
  exportStoreAnalyticsCsv: exportStoreAnalyticsCsvMock,
  getStoreInsights: getStoreInsightsMock,
};
