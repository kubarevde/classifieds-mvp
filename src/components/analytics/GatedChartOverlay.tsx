"use client";

import type { Feature } from "@/entities/billing/model";
import { UpgradeBanner } from "@/components/platform/UpgradeBanner";

type GatedChartOverlayProps = {
  feature: Feature;
  /** Доля ширины графика слева, закрытая оверлеем (0–1). */
  lockedLeftFraction: number;
  title?: string;
};

export function GatedChartOverlay({ feature, lockedLeftFraction, title }: GatedChartOverlayProps) {
  if (lockedLeftFraction <= 0) {
    return null;
  }
  const pct = Math.min(100, Math.max(0, lockedLeftFraction * 100));
  return (
    <div
      className="pointer-events-none absolute inset-y-1 left-1 z-10 overflow-hidden rounded-lg"
      style={{ width: `calc(${pct}% - 2px)` }}
    >
      {/* Лёгкая вуаль: график остаётся читаемым, CTA — как «разблокировка», не как поломка */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-200/65 via-slate-100/25 to-transparent" />
      <div className="pointer-events-auto absolute bottom-2 left-2 max-w-[min(calc(100%-8px),280px)]">
        <UpgradeBanner
          feature={feature}
          compact
          title={title ?? "Расширенная история"}
          body={undefined}
        />
      </div>
    </div>
  );
}
