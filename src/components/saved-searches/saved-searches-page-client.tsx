"use client";

import Link from "next/link";

import { useSavedSearches } from "@/components/saved-searches/saved-searches-provider";
import { SavedSearchList } from "@/components/saved-searches/saved-search-list";

export function SavedSearchesPageClient() {
  const { searches } = useSavedSearches();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Сохранённые поиски
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
              Быстро возвращайтесь к фильтрам каталога и включайте уведомления о новых совпадениях (демо на
              фронтенде).
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Link
              href="/listings"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              В каталог
            </Link>
            <Link
              href="/notifications"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Уведомления
            </Link>
          </div>
        </div>
      </div>

      <SavedSearchList searches={searches} />
    </div>
  );
}
