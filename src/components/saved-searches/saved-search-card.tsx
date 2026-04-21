"use client";

import Link from "next/link";
import { useState } from "react";

import { useNotifications } from "@/components/notifications/notifications-provider";
import { useSavedSearches } from "@/components/saved-searches/saved-searches-provider";
import { AlertsToggle } from "@/components/saved-searches/alerts-toggle";
import {
  SavedSearch,
  buildListingsHref,
  buildSearchSummary,
  formatSavedSearchCreatedAt,
} from "@/lib/saved-searches";

type SavedSearchCardProps = {
  search: SavedSearch;
};

export function SavedSearchCard({ search }: SavedSearchCardProps) {
  const { removeSearch, renameSearch, setAlertsEnabled } = useSavedSearches();
  const { addNotification } = useNotifications();
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(search.name);

  const href = buildListingsHref(search.filters);
  const summary = buildSearchSummary(search.filters);

  const commitRename = () => {
    renameSearch(search.id, draftName);
    setIsEditingName(false);
  };

  const handleAlertsChange = (next: boolean) => {
    setAlertsEnabled(search.id, next);
    if (next) {
      addNotification({
        type: "search_alert",
        title: "Новые объявления по поиску",
        body: `Появились новые объявления по вашему поиску «${search.name}». Это демо-уведомление для MVP.`,
        createdAtIso: new Date().toISOString(),
        isRead: false,
        link: { href, label: "Открыть в каталоге" },
        metadata: { savedSearchId: search.id },
      });
    }
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          {isEditingName ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400 sm:max-w-md"
                aria-label="Название поиска"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={commitRename}
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraftName(search.name);
                    setIsEditingName(false);
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">{search.name}</h2>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${
                  search.alertsEnabled
                    ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
                    : "bg-slate-50 text-slate-600 ring-slate-100"
                }`}
              >
                {search.alertsEnabled ? "Alerts вкл." : "Alerts выкл."}
              </span>
            </div>
          )}

          <p className="text-xs text-slate-500">Создано {formatSavedSearchCreatedAt(search.createdAtIso)}</p>
          <p className="text-sm text-slate-600">{summary}</p>
        </div>

        {!isEditingName ? (
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Link
              href={href}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-3.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Открыть
            </Link>
            <button
              type="button"
              onClick={() => {
                setDraftName(search.name);
                setIsEditingName(true);
              }}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Переименовать
            </button>
            <button
              type="button"
              onClick={() => removeSearch(search.id)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-3.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
            >
              Удалить
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <AlertsToggle id={search.id} enabled={search.alertsEnabled} onChange={handleAlertsChange} />
      </div>
    </article>
  );
}
