"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { CategoryBreakdownRow } from "@/entities/analytics/model";
import { analyticsChartColors } from "@/components/analytics/analytics-chart-theme";

const COLORS = ["#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"];

type CategoryBreakdownChartProps = {
  rows: CategoryBreakdownRow[];
};

export function CategoryBreakdownChart({ rows }: CategoryBreakdownChartProps) {
  const data = [...rows].sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Категории</h3>
        <p className="mt-8 text-center text-sm text-slate-500">Нет разбивки.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Вклад категорий</h3>
      <p className="text-xs text-slate-500">Доля просмотров по категориям витрины, %.</p>
      <div className="mt-4 min-h-[200px] h-[200px] w-full min-w-0 sm:h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
            barCategoryGap={6}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={analyticsChartColors.grid} horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: analyticsChartColors.muted }}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
            />
            <YAxis
              type="category"
              dataKey="category"
              width={88}
              tick={{ fontSize: 11, fill: "#334155" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => {
                const v = typeof value === "number" ? value : 0;
                return [`${v.toFixed(1)}%`, "Доля"];
              }}
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={data[i].category} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
