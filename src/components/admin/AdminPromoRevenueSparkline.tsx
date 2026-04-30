"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { AdminTimeSeriesPoint } from "@/services/admin/types";

export function AdminPromoRevenueSparkline({ series, title = "Доход от продвижения (mock)" }: { series: AdminTimeSeriesPoint[]; title?: string }) {
  const data = series.map((p) => ({ name: p.label, promo: p.value }));
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold text-slate-700">{title}</p>
      <div className="mt-2 h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
            <Tooltip formatter={(v: unknown) => (typeof v === "number" ? `${v.toLocaleString("ru-RU")} ₽` : String(v ?? ""))} />
            <Line type="monotone" dataKey="promo" name="Промо" stroke="#7c3aed" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
