"use client";

import { useMemo } from "react";

import { useFeatureGate } from "@/hooks/useFeatureGate";

/** Максимум календарных дней истории, доступных по тарифу (без plan-check в UI). */
export function useAnalyticsHistoryCap(): number {
  const { canUse } = useFeatureGate();
  return useMemo(() => {
    if (canUse("store_analytics_history_1y")) {
      return 365;
    }
    if (canUse("store_analytics_history_90d")) {
      return 90;
    }
    if (canUse("store_analytics_history_30d")) {
      return 30;
    }
    return 7;
  }, [canUse]);
}
