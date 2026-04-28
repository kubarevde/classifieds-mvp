"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { CompetitorBenchmark } from "@/entities/analytics/model";
import { analyticsChartColors } from "@/components/analytics/analytics-chart-theme";

type CompetitorBenchmarkProps = {
  rows: CompetitorBenchmark[];
  nicheLabel: string;
};

export function CompetitorBenchmark({ rows, nicheLabel }: CompetitorBenchmarkProps) {
  const data = rows.slice(0, 4).map((r) => ({
    metric: r.metric,
    you: Math.round(r.yourStore * 10) / 10,
    niche: Math.round(r.nicheAverage * 10) / 10,
  }));

  return (
    <div className="min-w-0">
      <h3 className="text-sm font-semibold text-slate-900">Вы vs ниша</h3>
      <p className="text-xs text-slate-500">Ниша: {nicheLabel}. Демо-индексы для сравнения.</p>
      <div className="mt-3 h-[220px] w-full min-w-0 sm:h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 44 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={analyticsChartColors.grid} vertical={false} />
            <XAxis
              dataKey="metric"
              tick={{ fontSize: 9, fill: analyticsChartColors.muted }}
              interval={0}
              height={40}
              tickFormatter={(v) => (String(v).length > 16 ? `${String(v).slice(0, 14)}…` : String(v))}
            />
            <YAxis tick={{ fontSize: 10, fill: analyticsChartColors.muted }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
              formatter={(value, name) => {
                const v = typeof value === "number" ? value : Number(value);
                const label = name === "you" ? "Ваш магазин" : "Среднее по нише";
                return [Number.isFinite(v) ? v : "—", label];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="you" name="Ваш магазин" fill={analyticsChartColors.benchmarkYou} radius={[4, 4, 0, 0]} />
            <Bar dataKey="niche" name="Среднее" fill={analyticsChartColors.benchmarkNiche} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
