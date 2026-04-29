"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";

import { useSavedSearches } from "@/components/saved-searches/saved-searches-provider";
import { cn } from "@/components/ui/cn";
import { buttonVariants } from "@/lib/button-styles";
import { FeatureGate } from "@/components/platform";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { useToast } from "@/components/ui/toast";
import type { SearchAlertChannel, SearchIntent } from "@/entities/search/model";
import {
  createSearchIntentFromFilters,
  defaultSavedSearchFilters,
  hasPersistableListingFilters,
  hasPersistableSearchIntent,
  type SavedSearchFilters,
} from "@/lib/saved-searches";

type SaveSearchButtonProps = {
  filters?: SavedSearchFilters;
  intent?: SearchIntent;
  className?: string;
};

export function SaveSearchButton({ filters, intent, className = "" }: SaveSearchButtonProps) {
  const { addSearch } = useSavedSearches();
  const { showToast } = useToast();
  const { canUse } = useFeatureGate();
  const [isOpen, setIsOpen] = useState(false);
  const effectiveIntent = intent ?? createSearchIntentFromFilters(filters ?? defaultSavedSearchFilters);
  const canSave = intent ? hasPersistableSearchIntent(intent) : hasPersistableListingFilters(filters ?? defaultSavedSearchFilters);
  const [title, setTitle] = useState(effectiveIntent.autoTitle);
  const [channel, setChannel] = useState<SearchAlertChannel>("off");

  if (!canSave) {
    return null;
  }

  const handleSave = () => {
    addSearch(
      effectiveIntent,
      {
        channel,
        enabled: channel !== "off",
      },
      title,
    );
    setIsOpen(false);
    showToast("Поиск сохранён. Мы сообщим, когда появятся новые совпадения.", "success");
  };

  return (
    <div className={`flex flex-col items-stretch gap-2 sm:items-end ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(buttonVariants({ variant: "secondary", size: "md" }), "gap-2 rounded-xl px-3.5")}
      >
        <Bookmark className="h-4 w-4 text-slate-500" strokeWidth={1.5} aria-hidden="true" />
        Сохранить поиск
      </button>
      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-900/35 p-4">
          <div className="mx-auto mt-24 w-full max-w-lg rounded-2xl border border-slate-200/90 bg-white p-4 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">Сохранить поиск</h3>
            <p className="mt-1 text-sm text-slate-600">
              Сохраните текущий набор фильтров и включите уведомления о новых совпадениях.
            </p>
            <label className="mt-3 block space-y-1 text-sm">
              <span className="text-slate-600">Название</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <fieldset className="mt-3 space-y-2 text-sm text-slate-700">
              <legend className="text-slate-600">Уведомления</legend>
              <label className="flex items-center gap-2">
                <input type="radio" checked={channel === "off"} onChange={() => setChannel("off")} />
                Выкл.
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={channel === "push"} onChange={() => setChannel("push")} />
                Push
              </label>
              <div className="rounded-xl border border-slate-200 p-2">
                {canUse("saved_searches_alerts") ? (
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={channel === "email"} onChange={() => setChannel("email")} />
                    Email
                  </label>
                ) : (
                  <FeatureGate feature="saved_searches_alerts" fallback={<p className="text-xs text-amber-700">Email alerts доступны на Pro+ тарифе.</p>}>
                    <label className="flex items-center gap-2">
                      <input type="radio" checked={channel === "email"} onChange={() => setChannel("email")} />
                      Email
                    </label>
                  </FeatureGate>
                )}
              </div>
            </fieldset>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white"
              >
                Сохранить
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
