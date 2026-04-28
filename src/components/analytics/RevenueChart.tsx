"use client";

import {
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

type RevenueChartProps = {
  analytics: StoreAnalytics;
  historyCapDays: number;
};

export function RevenueChart({ analytics, historyCapDays }: RevenueChartProps) {
  const n = analytics.revenue.length;
  const lockedLeftFraction = n > 0 ? Math.max(0, (n - Math.min(n, historyCapDays)) / n) : 0;
  const overlayFeature = featureForHistoryOverlay(historyCapDays);
  const axisProps = denseDateAxisProps(n);
  const mb = chartOuterMarginBottom(n);

  const chartData = analytics.revenue.map((r, i) => ({
    date: r.date.slice(5),
    revenue: r.value,
    orders: analytics.orders[i]?.value ?? 0,
  }));

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm sm:p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Выручка и заказы</h3>
        <p className="text-xs text-slate-500">Две оси: сумма по дням и число заказов (демо).</p>
      </div>
      <div className="relative mt-3 min-h-[200px] h-[220px] w-full min-w-0 sm:h-[260px]">
        {chartData.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">Нет данных за период.</p>
        ) : (
          <>
            <GatedChartOverlay
              feature={overlayFeature}
              lockedLeftFraction={lockedLeftFraction}
              title="Полная история"
            />
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 6, right: 4, left: -8, bottom: mb }}>
                <CartesianGrid strokeDasharray="3 3" stroke={analyticsChartColors.grid} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  {...axisProps}
                />
                <YAxis
                  yAxisId="left"
                  width={36}
                  tick={{ fontSize: 10, fill: analyticsChartColors.muted }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  width={32}
                  tick={{ fontSize: 10, fill: analyticsChartColors.muted }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                  formatter={(value, name) => {
                    const num = typeof value === "number" ? value : 0;
                    const formatted =
                      name === "revenue"
                        ? `${new Intl.NumberFormat("ru-RU").format(num)} ₽`
                        : new Intl.NumberFormat("ru-RU").format(num);
                    return [formatted, name === "revenue" ? "Выручка" : "Заказы"];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Выручка"
                  stroke={analyticsChartColors.revenue}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  name="Заказы"
                  stroke={analyticsChartColors.orders}
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
