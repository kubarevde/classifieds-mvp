"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { StoreAnalytics } from "@/entities/analytics/model";
import {
  analyticsChartColors,
  chartOuterMarginBottom,
  denseDateAxisProps,
} from "@/components/analytics/analytics-chart-theme";
import { GatedChartOverlay } from "@/components/analytics/GatedChartOverlay";
import { featureForHistoryOverlay } from "@/components/analytics/history-overlay-feature";

type ViewsChartProps = {
  analytics: StoreAnalytics;
  historyCapDays: number;
};

export function ViewsChart({ analytics, historyCapDays }: ViewsChartProps) {
  const n = analytics.views.length;
  const lockedLeftFraction = n > 0 ? Math.max(0, (n - Math.min(n, historyCapDays)) / n) : 0;
  const overlayFeature = featureForHistoryOverlay(historyCapDays);
  const axisProps = denseDateAxisProps(n);
  const mb = chartOuterMarginBottom(n);

  const chartData = analytics.views.map((v, i) => {
    const views = v.value;
    const clicks = analytics.clicks[i]?.value ?? 0;
    const contacts = analytics.contacts[i]?.value ?? 0;
    const conversionPct = views > 0 ? (contacts / views) * 100 : 0;
    return {
      date: v.date.slice(5),
      views,
      conversionPct,
      clicks,
    };
  });

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm sm:p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Просмотры и конверсия</h3>
        <p className="text-xs text-slate-500">Столбцы — просмотры; линия — доля контактов к просмотрам.</p>
      </div>
      <div className="relative mt-3 min-h-[200px] h-[220px] w-full min-w-0 sm:h-[260px]">
        {chartData.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">Нет данных.</p>
        ) : (
          <>
            <GatedChartOverlay feature={overlayFeature} lockedLeftFraction={lockedLeftFraction} />
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 6, right: 4, left: -8, bottom: mb }}>
                <CartesianGrid strokeDasharray="3 3" stroke={analyticsChartColors.grid} vertical={false} />
                <XAxis dataKey="date" tickLine={false} {...axisProps} />
                <YAxis
                  yAxisId="left"
                  width={36}
                  tick={{ fontSize: 10, fill: analyticsChartColors.muted }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  width={36}
                  tick={{ fontSize: 10, fill: analyticsChartColors.muted }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v.toFixed(0)}%`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                  formatter={(value, name) => {
                    const num = typeof value === "number" ? value : 0;
                    if (name === "conversionPct") {
                      return [`${num.toFixed(2)}%`, "Конверсия"];
                    }
                    if (name === "views") {
                      return [new Intl.NumberFormat("ru-RU").format(num), "Просмотры"];
                    }
                    return [new Intl.NumberFormat("ru-RU").format(num), "Клики"];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  yAxisId="left"
                  dataKey="views"
                  name="Просмотры"
                  fill={analyticsChartColors.views}
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="conversionPct"
                  name="Конверсия %"
                  stroke={analyticsChartColors.conversion}
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}
