"use client";

import type { AIIssue } from "@/services/ai/listing-assistant";
import { Button } from "@/components/ui";
import { cn } from "@/components/ui/cn";

const fieldLabels: Record<AIIssue["field"], string> = {
  title: "Заголовок",
  description: "Описание",
  price: "Цена",
  photos: "Фото",
};

const severityClass: Record<AIIssue["severity"], string> = {
  error: "border-rose-200 bg-rose-50 text-rose-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  suggestion: "border-slate-200 bg-white text-slate-700",
};

type AIListingScoreProps = {
  score: number | null;
  issues: AIIssue[];
  loading: boolean;
  onRefresh: () => void;
  onFix: (issue: AIIssue) => void;
  onScrollToField?: (field: AIIssue["field"]) => void;
  disabled: boolean;
};

export function AIListingScore({ score, issues, loading, onRefresh, onFix, onScrollToField, disabled }: AIListingScoreProps) {
  const breakdown =
    score === null
      ? null
      : [
          { id: "title" as const, label: "Заголовок", part: Math.min(30, Math.round(score * 0.3)) },
          { id: "description" as const, label: "Описание", part: Math.min(35, Math.round(score * 0.35)) },
          { id: "price" as const, label: "Цена / категория", part: Math.max(0, score - Math.min(30, Math.round(score * 0.3)) - Math.min(35, Math.round(score * 0.35))) },
        ];

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Качество объявления</p>
        <Button type="button" size="sm" variant="outline" disabled={disabled || loading} onClick={onRefresh}>
          {loading ? "…" : "Обновить оценку"}
        </Button>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-10 w-20 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-2 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 animate-pulse rounded bg-slate-200" />
        </div>
      ) : score === null ? (
        <p className="text-xs text-slate-600">Оценка появится после запроса.</p>
      ) : (
        <>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold tabular-nums text-slate-900">{score}</span>
            <span className="pb-1 text-sm text-slate-500">/ 100</span>
          </div>
          {breakdown ? (
            <div className="space-y-1.5">
              {breakdown.map((row) => (
                <div key={row.id} className="flex items-center gap-2 text-xs">
                  <span className="w-28 shrink-0 text-slate-600">{row.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-slate-700" style={{ width: `${Math.min(100, row.part)}%` }} />
                  </div>
                  <span className="w-8 text-right font-medium text-slate-800">{row.part}</span>
                </div>
              ))}
            </div>
          ) : null}
        </>
      )}
      {issues.length ? (
        <ul className="space-y-2 border-t border-slate-100 pt-2">
          {issues.map((issue, i) => (
            <li
              key={`${issue.field}-${i}`}
              className={cn("rounded-lg border px-2.5 py-2 text-xs", severityClass[issue.severity])}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{fieldLabels[issue.field]}</p>
                  <p className="mt-0.5">{issue.message}</p>
                  {issue.fix ? <p className="mt-1 text-[11px] opacity-80">{issue.fix}</p> : null}
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button type="button" size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onFix(issue)}>
                    Исправить
                  </Button>
                  {onScrollToField ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[11px]"
                      onClick={() => onScrollToField(issue.field)}
                    >
                      К полю
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
