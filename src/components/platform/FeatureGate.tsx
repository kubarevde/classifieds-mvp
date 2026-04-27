"use client";

import type { ReactNode } from "react";

import { useFeatureGate } from "@/hooks/useFeatureGate";
import type { Feature } from "@/entities/billing/model";

import { UpgradeBanner } from "./UpgradeBanner";

type FeatureGateProps = {
  feature: Feature;
  fallback?: ReactNode;
  children: ReactNode;
};

export function FeatureGate({ feature, fallback, children }: FeatureGateProps) {
  const { canUse } = useFeatureGate();
  if (canUse(feature)) {
    return <>{children}</>;
  }
  return <>{fallback ?? <UpgradeBanner feature={feature} />}</>;
}
