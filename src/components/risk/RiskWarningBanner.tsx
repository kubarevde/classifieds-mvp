"use client";

import Link from "next/link";

import type { RiskSignal } from "@/services/risk";
import { RiskIndicator } from "./RiskIndicator";

export function RiskWarningBanner({
  signal,
  ctaHref = "/safety",
  ctaLabel = "Рекомендации по безопасности",
}: {
  signal: RiskSignal;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-slate-900">{signal.title}</p>
          <p className="text-sm text-slate-700">{signal.description}</p>
        </div>
        <RiskIndicator level={signal.level} />
      </div>
      <p className="mt-2 text-xs text-slate-700">{signal.recommendation}</p>
      <div className="mt-3">
        <Link href={ctaHref} className="inline-flex min-h-10 items-center rounded-xl border border-amber-300 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:bg-amber-100">
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

