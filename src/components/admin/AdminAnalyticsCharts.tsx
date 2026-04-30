"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AdminTimeSeriesPoint } from "@/services/admin/types";

export function AdminAnalyticsCharts({
  series,
}: {
  series: { users: AdminTimeSeriesPoint[]; listings: AdminTimeSeriesPoint[]; revenue: AdminTimeSeriesPoint[] };
}) {
  const merged = series.users.map((u, i) => ({
    name: u.label,
    users: u.value,
    listings: series.listings[i]?.value ?? 0,
    revenue: series.revenue[i]?.value ?? 0,
  }));

  if (merged.length === 0) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
        Нет точек ряда для графика (mock). После появления данных график отрисуется автоматически.
      </div>
    );
  }

  return (
    <div className="h-72 min-h-[18rem] w-full rounded-xl border border-slate-200 bg-white p-2">
      <ResponsiveContainer width="100%" height="100%" minHeight={288}>
        <LineChart data={merged} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748b" />
          <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
          <Tooltip
            formatter={(value: unknown) => (typeof value === "number" ? value.toLocaleString("ru-RU") : String(value ?? ""))}
            labelFormatter={(label) => `Период: ${label}`}
          />
          <Legend />
          <Line type="monotone" dataKey="users" name="Пользователи" stroke="#0f172a" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="listings" name="Объявления" stroke="#2563eb" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="revenue" name="Выручка (mock)" stroke="#059669" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
