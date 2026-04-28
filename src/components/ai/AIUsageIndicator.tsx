"use client";

import { Infinity as InfinityIcon } from "lucide-react";

import { cn } from "@/components/ui/cn";

type AIUsageIndicatorProps = {
  usedToday: number;
  dailyLimit: number;
  className?: string;
};

export function AIUsageIndicator({ usedToday, dailyLimit, className }: AIUsageIndicatorProps) {
  const unlimited = !Number.isFinite(dailyLimit) || dailyLimit <= 0 || dailyLimit === Number.POSITIVE_INFINITY;

  if (unlimited) {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-slate-600", className)}>
        <InfinityIcon className="h-3.5 w-3.5 text-slate-500" aria-hidden />
        <span>Без ограничений по вашему тарифу</span>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((usedToday / Math.max(1, dailyLimit)) * 100));

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
        <span>
          {usedToday} из {dailyLimit} запросов сегодня
        </span>
        <span className="font-medium text-slate-800">{Math.max(0, dailyLimit - usedToday)} осталось</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-slate-800 transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
