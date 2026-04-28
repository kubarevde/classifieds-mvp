"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui";
import { cn } from "@/components/ui/cn";

type InlineAISuggestionBlockProps = {
  title: string;
  children: ReactNode;
  /** Коротко «почему так» */
  rationale?: string;
  onApply: () => void;
  onDismiss: () => void;
  onRegenerate?: () => void;
  applyLabel?: string;
  disabled?: boolean;
  className?: string;
};

export function InlineAISuggestionBlock({
  title,
  children,
  rationale,
  onApply,
  onDismiss,
  onRegenerate,
  applyLabel = "Применить",
  disabled,
  className,
}: InlineAISuggestionBlockProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/90 bg-slate-50/90 p-3 shadow-sm ring-1 ring-slate-900/[0.04]",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-2 text-sm text-slate-800">{children}</div>
      {rationale ? <p className="mt-2 text-xs leading-relaxed text-slate-600">{rationale}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="primary" disabled={disabled} onClick={onApply}>
          {applyLabel}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={onDismiss}>
          Отменить
        </Button>
        {onRegenerate ? (
          <Button type="button" size="sm" variant="ghost" disabled={disabled} onClick={onRegenerate}>
            Сгенерировать снова
          </Button>
        ) : null}
      </div>
    </div>
  );
}
