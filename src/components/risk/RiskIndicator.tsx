"use client";

import type { RiskLevel } from "@/services/risk";

const toneByLevel: Record<RiskLevel, string> = {
  low: "border-slate-200 bg-slate-50 text-slate-700",
  medium: "border-amber-200 bg-amber-50 text-amber-900",
  high: "border-orange-200 bg-orange-50 text-orange-900",
};

const labelByLevel: Record<RiskLevel, string> = {
  low: "Низкий риск",
  medium: "Есть факторы риска",
  high: "Повышенное внимание",
};

export function RiskIndicator({ level }: { level: RiskLevel }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${toneByLevel[level]}`}>{labelByLevel[level]}</span>;
}

