"use client";

import { Wand2 } from "lucide-react";

import { AIUsageIndicator } from "@/components/ai/AIUsageIndicator";
import { Button } from "@/components/ui";
import { cn } from "@/components/ui/cn";

type AIStepSummaryCardProps = {
  featureAllowed: boolean;
  dailyLimit: number;
  usedToday: number;
  hasUnlimited: boolean;
  score: number | null;
  scoreLoading: boolean;
  onOpenAssistant: () => void;
  onQuickScore?: () => void;
  className?: string;
};

export function AIStepSummaryCard({
  featureAllowed,
  dailyLimit,
  usedToday,
  hasUnlimited,
  score,
  scoreLoading,
  onOpenAssistant,
  onQuickScore,
  className,
}: AIStepSummaryCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm ring-1 ring-slate-900/[0.03]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
            <Wand2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Подсказки AI</p>
            <p className="text-xs text-slate-500">Контекст шага · без автозаписи в форму</p>
          </div>
        </div>
        {scoreLoading ? (
          <span className="h-6 w-10 shrink-0 animate-pulse rounded bg-slate-100" />
        ) : score !== null ? (
          <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-800">
            {score}
          </span>
        ) : null}
      </div>
      <div className="mt-2">
        <AIUsageIndicator usedToday={usedToday} dailyLimit={dailyLimit} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="primary" className="flex-1 min-w-[8rem]" disabled={!featureAllowed} onClick={onOpenAssistant}>
          Открыть помощник
        </Button>
        {onQuickScore && featureAllowed ? (
          <Button type="button" size="sm" variant="outline" onClick={onQuickScore}>
            Оценка
          </Button>
        ) : null}
      </div>
      {!featureAllowed ? <p className="mt-2 text-[11px] text-slate-500">Доступно на расширенных тарифах.</p> : null}
      {!hasUnlimited && Number.isFinite(dailyLimit) && featureAllowed ? (
        <p className="mt-1.5 text-[11px] leading-snug text-slate-500">
          Лимит запросов сбрасывается ежедневно. Больше — на тарифах с расширенным ИИ.
        </p>
      ) : null}
    </div>
  );
}
