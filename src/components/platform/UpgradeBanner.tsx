"use client";

import type { Feature } from "@/entities/billing/model";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { Card } from "@/components/ui/card";

export type UpgradeBannerProps = {
  feature: Feature;
  compact?: boolean;
  /** Переопределение текста (например из FeatureGate с кастомным fallback). */
  title?: string;
  body?: string;
};

export function UpgradeBanner({ feature, compact, title, body }: UpgradeBannerProps) {
  const { getUpgradeReason } = useFeatureGate();
  const resolvedBody = body ?? getUpgradeReason(feature) ?? "Оформите подходящий план, чтобы открыть эту функцию.";
  const resolvedTitle = title ?? "Нужен более высокий тариф";

  return (
    <Card
      className={
        compact
          ? "border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-950"
          : "border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-950"
      }
    >
      <p className="font-semibold">{resolvedTitle}</p>
      <p className={compact ? "mt-1 text-[11px] leading-snug text-amber-900/90" : "mt-1 text-amber-900/90"}>
        {resolvedBody}
      </p>
    </Card>
  );
}
