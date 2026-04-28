"use client";

import { useMemo } from "react";

import { useDemoRole } from "@/components/demo-role/demo-role";
import { useSubscription } from "@/components/subscription/subscription-provider";
import { resolveDailyAiRequestLimit, type AiLimitContext } from "@/entities/ai/limits";
import { useFeatureGate } from "@/hooks/useFeatureGate";

export function useAiListingGate() {
  const subscription = useSubscription();
  const { role } = useDemoRole();
  const unlimitedGate = useFeatureGate("ai_listing_assistant_unlimited");

  const limit = useMemo(() => {
    const ctx: AiLimitContext = {
      role,
      storePlan: subscription.storePlan,
      planName: subscription.planName,
      isBuyerPro: subscription.isPro,
      hasUnlimitedFeature: unlimitedGate.allowed,
    };
    return resolveDailyAiRequestLimit(ctx);
  }, [role, subscription.isPro, subscription.planName, subscription.storePlan, unlimitedGate.allowed]);

  return {
    dailyLimit: limit,
    hasUnlimited: unlimitedGate.allowed,
    upgradeReasonUnlimited: unlimitedGate.upgradeReason,
  };
}
