"use client";

import Link from "next/link";
import { useState } from "react";

import { useSavedSearches } from "@/components/saved-searches/saved-searches-provider";
import type { SavedSearchFilters } from "@/lib/saved-searches";

type SaveSearchButtonProps = {
  filters: SavedSearchFilters;
  className?: string;
};

export function SaveSearchButton({ filters, className = "" }: SaveSearchButtonProps) {
  const { addSearch } = useSavedSearches();
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    addSearch(filters);
    setShowSaved(true);
    window.setTimeout(() => setShowSaved(false), 3200);
  };

  return (
    <div className={`flex flex-col items-stretch gap-2 sm:items-end ${className}`}>
      <button
        type="button"
        onClick={handleSave}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-slate-500" aria-hidden="true">
          <path
            d="M6 4h12v16l-6-4-6 4V4Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
        Сохранить поиск
      </button>
      {showSaved ? (
        <div className="flex flex-col items-end gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-right text-xs text-emerald-900 sm:max-w-sm">
          <p className="font-medium">Поиск сохранён</p>
          <p className="text-emerald-800/90">
            Откройте{" "}
            <Link href="/saved-searches" className="font-semibold underline decoration-emerald-300 underline-offset-2">
              сохранённые поиски
            </Link>
            , чтобы переименовать или включить уведомления.
          </p>
        </div>
      ) : null}
    </div>
  );
}
