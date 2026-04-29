"use client";

import Link from "next/link";
import { useState } from "react";

import { useSavedSearches } from "@/components/saved-searches/saved-searches-provider";
import { FeatureGate } from "@/components/platform";
import { useSavedSearchMatchSummary } from "@/hooks/data/use-saved-search-matches";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import type { SavedSearch } from "@/entities/search/model";
import { buildSearchHrefFromIntent, formatSavedSearchCreatedAt } from "@/lib/saved-searches";
import { buildCreateRequestHrefFromIntent } from "@/services/requests/intent-adapter";

type SavedSearchCardProps = {
  search: SavedSearch;
};

export function SavedSearchCard({ search }: SavedSearchCardProps) {
  const { removeSearch, updateSearch, updateAlertPreference } = useSavedSearches();
  const { summary: matchSummary, loading: matchLoading } = useSavedSearchMatchSummary(search);
  const alertsGate = useFeatureGate();
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(search.title ?? search.intent.autoTitle);

  const href = buildSearchHrefFromIntent(search.intent);
  const requestHref = buildCreateRequestHrefFromIntent(search.intent);
  const summary = search.intent.chips.map((chip) => `${chip.label}: ${chip.value ?? "—"}`).join(" · ");
  const modeLabel =
    search.intent.mode === "natural_language" ? "AI" : search.intent.mode === "image" ? "photo" : "keyword";
  const newMatchesLabel = matchLoading ? "…" : `+${matchSummary?.newMatches ?? 0} новых`;

  const commitRename = () => {
    updateSearch(search.id, { title: draftName });
    setIsEditingName(false);
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
                    setDraftName(search.title ?? search.intent.autoTitle);
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
              <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                {search.title ?? search.intent.autoTitle}
              </h2>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                {modeLabel}
              </span>
              <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                {newMatchesLabel}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${
                  search.alertPreference.enabled
                    ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
                    : "bg-slate-50 text-slate-600 ring-slate-100"
                }`}
              >
                {search.alertPreference.enabled ? `Alerts: ${search.alertPreference.channel}` : "Alerts выкл."}
              </span>
            </div>
          )}

          <p className="text-xs text-slate-500">Создано {formatSavedSearchCreatedAt(search.createdAt)}</p>
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
            <Link
              href={requestHref}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Разместить запрос
            </Link>
            <button
              type="button"
              onClick={() => {
                setDraftName(search.title ?? search.intent.autoTitle);
                setIsEditingName(true);
              }}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
                Редактировать
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

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => updateAlertPreference(search.id, { channel: "off", enabled: false })}
          className="rounded-lg border border-slate-200 px-2 py-1"
        >
          Alerts off
        </button>
        <button
          type="button"
          onClick={() => updateAlertPreference(search.id, { channel: "push", enabled: true })}
          className="rounded-lg border border-slate-200 px-2 py-1"
        >
          Push
        </button>
        {alertsGate.canUse("saved_searches_alerts") ? (
          <button
            type="button"
            onClick={() => updateAlertPreference(search.id, { channel: "email", enabled: true })}
            className="rounded-lg border border-slate-200 px-2 py-1"
          >
            Email
          </button>
        ) : (
          <FeatureGate
            feature="saved_searches_alerts"
            fallback={<p className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-amber-700">Email alerts доступны на Pro+</p>}
          >
            <span />
          </FeatureGate>
        )}
      </div>
    </article>
  );
}
