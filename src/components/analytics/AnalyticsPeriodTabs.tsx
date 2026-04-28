"use client";

import { Lock } from "lucide-react";

import type { StoreAnalyticsPeriod } from "@/entities/analytics/model";

const PERIODS: { id: StoreAnalyticsPeriod; label: string; title: string }[] = [
  { id: "7d", label: "7 дн.", title: "Последние 7 дней" },
  { id: "30d", label: "30 дн.", title: "Последние 30 дней" },
  { id: "90d", label: "90 дн.", title: "Последние 90 дней" },
  { id: "1y", label: "1 год", title: "Последний год (365 дн.)" },
];

export function periodDayCount(p: StoreAnalyticsPeriod): number {
  switch (p) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    case "1y":
      return 365;
    default:
      return 7;
  }
}

/** Краткая подпись для KPI / сводок («за 7 дней», «за год»). */
export function periodCaptionAccusative(period: StoreAnalyticsPeriod): string {
  switch (period) {
    case "7d":
      return "за последние 7 дней";
    case "30d":
      return "за последние 30 дней";
    case "90d":
      return "за последние 90 дней";
    case "1y":
      return "за последний год";
    default:
      return "за период";
  }
}

type AnalyticsPeriodTabsProps = {
  value: StoreAnalyticsPeriod;
  onChange: (next: StoreAnalyticsPeriod) => void;
  /** Макс. дней без blur (по гейту). */
  historyCapDays: number;
};

export function AnalyticsPeriodTabs({ value, onChange, historyCapDays }: AnalyticsPeriodTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Период аналитики"
      className="inline-flex w-full max-w-md flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/90 p-0.5 sm:w-auto"
    >
      {PERIODS.map((p) => {
        const need = periodDayCount(p.id);
        const gated = need > historyCapDays;
        const active = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={active}
            title={
              gated
                ? `${p.title}: ранние дни могут быть с затемнением по тарифу; свежие ${historyCapDays} дн. читаются полностью.`
                : p.title
            }
            onClick={() => onChange(p.id)}
            className={`inline-flex min-h-[36px] min-w-[3.25rem] flex-1 items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-semibold transition sm:flex-none sm:px-3 sm:py-1.5 ${
              active
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80"
                : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
            }`}
          >
            <span>{p.label}</span>
            {gated ? (
              <Lock className="h-3 w-3 shrink-0 text-amber-600" strokeWidth={2} aria-label="Часть периода по тарифу" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

type AnalyticsPeriodContextLineProps = {
  period: StoreAnalyticsPeriod;
  historyCapDays: number;
};

/** Одна ненавязчивая строка про соответствие периода и тарифа. */
export function AnalyticsPeriodContextLine({ period, historyCapDays }: AnalyticsPeriodContextLineProps) {
  const total = periodDayCount(period);
  if (total <= historyCapDays) {
    return (
      <p className="max-w-xl text-[11px] leading-relaxed text-slate-500">
        Все <span className="font-medium text-slate-700">{total}</span> дн. выбранного периода доступны по текущему
        тарифу.
      </p>
    );
  }
  return (
    <p className="max-w-xl text-[11px] leading-relaxed text-slate-500">
      Полностью без затемнения — последние{" "}
      <span className="font-medium text-slate-700">{historyCapDays}</span> дн.; более ранняя часть графика слегка
      приглушена — так показана расширенная история на старших тарифах, интерфейс в порядке.
    </p>
  );
}
