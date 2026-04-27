"use client";

import { useMemo } from "react";

import { useDemoRole } from "@/components/demo-role/demo-role";
import { useSubscription } from "@/components/subscription/subscription-provider";
import type { Feature } from "@/entities/billing/model";
import { createMockFeatureGateService } from "@/services/feature-gate/mock";
import type { FeatureGateContext } from "@/services/feature-gate";

export type FeatureGateApi = {
  canUse: (feature: Feature, context?: FeatureGateContext) => boolean;
  getLimit: (feature: string) => number;
  getUpgradeReason: (feature: Feature) => string;
};

export type FeatureGateApiForFeature = FeatureGateApi & {
  allowed: boolean;
  upgradeReason: string;
};

export function useFeatureGate(): FeatureGateApi;
export function useFeatureGate(feature: Feature): FeatureGateApiForFeature;
export function useFeatureGate(feature?: Feature): FeatureGateApi | FeatureGateApiForFeature {
  const subscription = useSubscription();
  const { role } = useDemoRole();

  const service = useMemo(
    () =>
      createMockFeatureGateService(
        {
          isPro: subscription.isPro,
          planName: subscription.planName,
          storePlan: subscription.storePlan,
        },
        role,
      ),
    [subscription.isPro, subscription.planName, subscription.storePlan, role],
  );

  return useMemo(() => {
    const canUse = (f: Feature, context?: FeatureGateContext) => service.canUse(f, context);
    const getLimit = (f: string) => service.getLimit(f);
    const getUpgradeReason = (f: Feature) => service.getUpgradeReason(f);
    const base: FeatureGateApi = { canUse, getLimit, getUpgradeReason };
    if (feature === undefined) {
      return base;
    }
    return {
      ...base,
      allowed: canUse(feature),
      upgradeReason: getUpgradeReason(feature),
    };
  }, [service, feature]);
}
