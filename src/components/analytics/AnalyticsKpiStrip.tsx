"use client";

import type { StoreAnalytics } from "@/entities/analytics/model";

type AnalyticsKpiStripProps = {
  analytics: StoreAnalytics;
  totalFollowers: number;
  /** Одна строка над карточками (период / контекст сумм). */
  summaryLine?: string;
};

function sum(points: { value: number }[]): number {
  return points.reduce((a, p) => a + p.value, 0);
}

export function AnalyticsKpiStrip({ analytics, totalFollowers, summaryLine }: AnalyticsKpiStripProps) {
  const rev = sum(analytics.revenue);
  const ord = sum(analytics.orders);
  const vw = sum(analytics.views);
  const ct = sum(analytics.contacts);
  const nf = sum(analytics.newFollowers);
  const conv = vw > 0 ? (ct / vw) * 100 : 0;

  const items = [
    { label: "Выручка", value: `${new Intl.NumberFormat("ru-RU").format(rev)} ₽`, hint: "сумма по дням" },
    { label: "Заказы", value: new Intl.NumberFormat("ru-RU").format(ord), hint: "всего шт." },
    { label: "Просмотры", value: new Intl.NumberFormat("ru-RU").format(vw), hint: "сумма по дням" },
    { label: "Конверсия", value: `${conv.toFixed(1)}%`, hint: "контакты / просмотры" },
    {
      label: "Подписчики",
      value: new Intl.NumberFormat("ru-RU").format(totalFollowers),
      hint: nf > 0 ? `+${nf} за период` : "всего",
    },
  ];

  return (
    <div>
      {summaryLine ? (
        <p className="mb-2 text-[11px] leading-relaxed text-slate-500 sm:mb-3">{summaryLine}</p>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 shadow-sm"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight text-slate-900">{item.value}</p>
          <p className="text-[11px] text-slate-500">{item.hint}</p>
        </div>
      ))}
      </div>
    </div>
  );
}
