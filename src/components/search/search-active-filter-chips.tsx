"use client";

import { X } from "lucide-react";

import { cn } from "@/components/ui/cn";
import { buttonVariants } from "@/lib/button-styles";

export type SearchActiveChip = {
  id: string;
  label: string;
  onRemove: () => void;
};

type SearchActiveFilterChipsProps = {
  chips: SearchActiveChip[];
  onClearAll?: () => void;
  clearAllLabel?: string;
  className?: string;
};

export function SearchActiveFilterChips({
  chips,
  onClearAll,
  clearAllLabel = "Сбросить",
  className = "",
}: SearchActiveFilterChipsProps) {
  if (!chips.length) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <div className="-mx-0.5 flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto px-0.5 pb-0.5 [scrollbar-width:thin]">
        {chips.map((chip) => (
          <span
            key={chip.id}
            className="inline-flex max-w-[min(100%,18rem)] shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white py-1 pl-2.5 pr-1 text-xs font-medium text-slate-800 shadow-sm"
          >
            <span className="truncate">{chip.label}</span>
            <button
              type="button"
              onClick={chip.onRemove}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label={`Убрать фильтр: ${chip.label}`}
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </span>
        ))}
      </div>
      {onClearAll ? (
        <button
          type="button"
          onClick={onClearAll}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "shrink-0 whitespace-nowrap rounded-lg px-2 text-xs font-semibold text-slate-600 hover:text-slate-900",
          )}
        >
          {clearAllLabel}
        </button>
      ) : null}
    </div>
  );
}
