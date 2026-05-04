"use client";

import type { ReactNode } from "react";

import type { MessageThread } from "@/services/messages";

export type InboxTab = "all" | "unread" | "archived";

type ThreadListProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  inboxTab: InboxTab;
  onInboxTabChange: (tab: InboxTab) => void;
  threads: MessageThread[];
  renderRow: (thread: MessageThread) => ReactNode;
  emptyCta?: ReactNode;
  showBuyerContextFilters?: boolean;
  contextFilter?: "all" | "listing" | "request" | "store";
  onContextFilterChange?: (value: "all" | "listing" | "request" | "store") => void;
};

export function ThreadList({
  searchQuery,
  onSearchChange,
  inboxTab,
  onInboxTabChange,
  threads,
  renderRow,
  emptyCta,
  showBuyerContextFilters,
  contextFilter,
  onContextFilterChange,
}: ThreadListProps) {
  return (
    <div className="flex flex-col border-b border-slate-100 bg-white">
      <div className="space-y-2 p-2">
        <label className="sr-only" htmlFor="thread-search">
          Поиск по диалогам
        </label>
        <input
          id="thread-search"
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по имени, тексту…"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-slate-900/10 focus:border-slate-300 focus:ring-2"
        />
        <div className="flex flex-wrap gap-1">
          {(
            [
              ["all", "Все"],
              ["unread", "Непрочитанные"],
              ["archived", "Архив"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => onInboxTabChange(id)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                inboxTab === id ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {showBuyerContextFilters && onContextFilterChange && contextFilter ? (
        <div className="flex flex-wrap gap-1 border-t border-slate-100 bg-slate-50/80 px-2 py-2">
          {(
            [
              ["all", "Контекст: все"],
              ["listing", "Объявления"],
              ["request", "Запросы"],
              ["store", "Магазины"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => onContextFilterChange(id)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                contextFilter === id ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
      {threads.length === 0 ? (
        <div className="p-4 text-sm text-slate-600">
          <p className="font-medium text-slate-900">Нет диалогов</p>
          <p className="mt-1">Измените фильтр или поисковый запрос.</p>
          {emptyCta ? <div className="mt-3">{emptyCta}</div> : null}
        </div>
      ) : (
        <ul className="max-h-[480px] overflow-y-auto">{threads.map((thread) => renderRow(thread))}</ul>
      )}
    </div>
  );
}
