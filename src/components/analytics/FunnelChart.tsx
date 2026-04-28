"use client";

import type { FunnelStep } from "@/entities/analytics/model";

type FunnelChartProps = {
  steps: FunnelStep[];
};

export function FunnelChart({ steps }: FunnelChartProps) {
  const max = Math.max(1, ...steps.map((s) => s.value));

  return (
    <div className="space-y-2.5">
      {steps.map((step, index) => {
        const prev = index > 0 ? steps[index - 1].value : step.value;
        const pctFromPrev = index === 0 ? 100 : prev > 0 ? (step.value / prev) * 100 : 0;
        const widthPct = (step.value / max) * 100;
        return (
          <div key={step.label}>
            <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
              <span className="font-medium text-slate-800">{step.label}</span>
              <span className="tabular-nums text-slate-700">
                {new Intl.NumberFormat("ru-RU").format(step.value)}
                {index > 0 ? (
                  <span className="ml-1.5 text-slate-500">({pctFromPrev.toFixed(1)}% от пред.)</span>
                ) : null}
              </span>
            </div>
            <div className="mt-1 h-9 overflow-hidden rounded-lg bg-slate-100">
              <div
                className="flex h-full items-center rounded-lg bg-slate-800/90 px-2 text-[11px] font-semibold text-white transition-all"
                style={{ width: `${Math.max(8, widthPct)}%` }}
              >
                {widthPct > 22 ? `${widthPct.toFixed(0)}% от макс.` : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
