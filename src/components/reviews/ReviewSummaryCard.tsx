"use client";

import type { ReviewSummary } from "@/services/reviews";

type Props = {
  summary: ReviewSummary;
  title?: string;
};

export function ReviewSummaryCard({ summary, title = "Сводка отзывов" }: Props) {
  const max = Math.max(...Object.values(summary.distribution), 1);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <p className="text-3xl font-bold text-slate-900">{summary.avgRating.toFixed(1)}</p>
        <p className="text-sm text-slate-600">из 5 · {summary.totalCount} отзывов</p>
      </div>
      <div className="mt-4 space-y-2">
        {([5, 4, 3, 2, 1] as const).map((rating) => (
          <div key={rating} className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-6">{rating}★</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-800"
                style={{ width: `${Math.round((summary.distribution[rating] / max) * 100)}%` }}
              />
            </div>
            <span className="w-6 text-right tabular-nums">{summary.distribution[rating]}</span>
          </div>
        ))}
      </div>
      {summary.highlights.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {summary.highlights.map((h) => (
            <li key={h} className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-900">
              {h}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
