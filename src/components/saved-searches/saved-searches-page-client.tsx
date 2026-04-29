"use client";

import Link from "next/link";

import { useSavedSearches } from "@/components/saved-searches/saved-searches-provider";
import { SavedSearchList } from "@/components/saved-searches/saved-search-list";
import { Card, buttonVariants } from "@/components/ui";
import { useSavedSearchesNewMatchesTotal } from "@/hooks/data/use-saved-search-matches";

export function SavedSearchesPageClient() {
  const { searches } = useSavedSearches();
  const { total: totalNewMatches, loading: matchesLoading } = useSavedSearchesNewMatchesTotal(searches);

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Сохранённые поиски
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
              Быстро возвращайтесь к фильтрам каталога и включайте уведомления о новых совпадениях (демо на
              фронтенде).
            </p>
            <p className="text-xs font-semibold text-slate-700">
              Новых объявлений сегодня: {matchesLoading ? "…" : totalNewMatches}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Link
              href="/listings"
              className={buttonVariants({ variant: "outline" })}
            >
              В каталог
            </Link>
            <Link
              href="/dashboard?tab=notifications"
              className={buttonVariants({ variant: "primary" })}
            >
              Уведомления
            </Link>
          </div>
        </div>
      </Card>

      <SavedSearchList searches={searches} />
    </div>
  );
}
