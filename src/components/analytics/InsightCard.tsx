"use client";

import type { StoreInsight, StoreInsightSeverity } from "@/entities/analytics/model";
import { cn } from "@/components/ui/cn";

const severityRing: Record<StoreInsightSeverity, string> = {
  info: "border-slate-200 bg-slate-50/80",
  success: "border-emerald-200 bg-emerald-50/70",
  warning: "border-amber-200 bg-amber-50/80",
};

type InsightCardProps = {
  insight: StoreInsight;
};

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <article
      className={cn(
        "rounded-xl border p-3 shadow-sm",
        severityRing[insight.severity] ?? severityRing.info,
      )}
    >
      <span className="inline-block rounded-md bg-white/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 ring-1 ring-slate-200/80">
        {insight.kind}
      </span>
      <h4 className="mt-2 text-sm font-semibold leading-snug text-slate-900">{insight.title}</h4>
      <p className="mt-1 text-xs leading-snug text-slate-700">{insight.body}</p>
    </article>
  );
}
