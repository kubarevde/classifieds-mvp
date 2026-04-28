"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { useFeatureGate } from "@/hooks/useFeatureGate";
import type { Feature } from "@/entities/billing/model";
import type { FeatureGateContext } from "@/services/feature-gate";

import { UpgradeBanner } from "./UpgradeBanner";
import { UpgradeModal } from "./UpgradeModal";

type FeatureGateProps = {
  feature: Feature;
  fallback?: ReactNode;
  context?: FeatureGateContext;
  children: ReactNode;
};

export function FeatureGate({ feature, fallback, context, children }: FeatureGateProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getGateResult } = useFeatureGate();
  const gate = getGateResult(feature, context);
  if (gate.allowed) {
    return <>{children}</>;
  }
  return (
    <>
      {fallback ?? (
        <button type="button" className="w-full text-left" onClick={() => setIsModalOpen(true)}>
          <UpgradeBanner feature={feature} />
        </button>
      )}
      <UpgradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reason={gate.reason}
        currentPlan={gate.currentPlan}
        requiredPlan={gate.requiredPlan}
        currentUsage={gate.currentUsage}
        limit={gate.limit}
        featureLabel={gate.featureLabel}
      />
    </>
  );
}
