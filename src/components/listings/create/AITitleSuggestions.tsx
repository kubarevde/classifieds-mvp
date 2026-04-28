"use client";

import { useState } from "react";

import { Button } from "@/components/ui";
import { cn } from "@/components/ui/cn";

function confidenceBadge(confidence: number): { text: string; className: string } {
  if (confidence >= 0.75) return { text: "Высокая", className: "bg-emerald-100 text-emerald-800" };
  if (confidence >= 0.55) return { text: "Средняя", className: "bg-amber-100 text-amber-900" };
  return { text: "Низкая", className: "bg-slate-200 text-slate-700" };
}

type AITitleSuggestionsProps = {
  suggestions: string[];
  confidence: number;
  loading: boolean;
  disabled: boolean;
  onApply: (title: string) => void;
  onGenerate: () => void;
  onMore: () => void;
  onDismiss?: () => void;
};

export function AITitleSuggestions({
  suggestions,
  confidence,
  loading,
  disabled,
  onApply,
  onGenerate,
  onMore,
  onDismiss,
}: AITitleSuggestionsProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const badge = confidenceBadge(confidence);

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Варианты заголовка</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", badge.className)}>Уверенность: {badge.text}</span>
          {onDismiss && suggestions.length ? (
            <button type="button" className="text-[11px] font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900" onClick={onDismiss}>
              Скрыть
            </button>
          ) : null}
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-9 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-9 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-9 animate-pulse rounded-lg bg-slate-200" />
        </div>
      ) : suggestions.length ? (
        <ul className="space-y-1.5">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => setPicked(s)}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-left text-sm transition",
                  picked === s
                    ? "border-slate-900 bg-white ring-1 ring-slate-900/10"
                    : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-600">Сгенерируйте варианты — затем выберите строку и примените.</p>
      )}
      {picked ? (
        <div className="flex flex-wrap gap-2 border-t border-slate-200/80 pt-2">
          <Button type="button" size="sm" variant="primary" disabled={disabled} onClick={() => onApply(picked)}>
            Применить выбранный
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => setPicked(null)}>
            Снять выбор
          </Button>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" disabled={disabled || loading} onClick={onGenerate}>
          Сгенерировать
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={disabled || loading || !suggestions.length} onClick={onMore}>
          Ещё варианты
        </Button>
      </div>
    </div>
  );
}
