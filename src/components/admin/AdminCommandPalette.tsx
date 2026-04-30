"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import { filterAdminSearchHits, getAdminSearchIndex, type AdminSearchHit } from "@/services/admin";

import { useAdminConsole } from "./admin-console-context";

export function AdminCommandPalette() {
  const { appendAdminHref, setCommandPaletteOpen } = useAdminConsole();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const index = useMemo(() => getAdminSearchIndex(), []);

  const results = useMemo(() => filterAdminSearchHits(index, query, 50), [index, query]);

  const hilite = results.length ? Math.min(active, results.length - 1) : 0;

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, []);

  const close = useCallback(() => setCommandPaletteOpen(false), [setCommandPaletteOpen]);

  const go = useCallback(
    (hit: AdminSearchHit) => {
      router.push(appendAdminHref(hit.href));
      close();
    },
    [appendAdminHref, close, router],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && results.length) {
        e.preventDefault();
        go(results[hilite]!);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, go, hilite, results]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${hilite}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [hilite]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 px-3 pt-[12vh] backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="Поиск по консоли"
      onClick={close}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.5} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Пользователи, магазины, объявления, тикеты…"
            className="min-w-0 flex-1 border-0 py-2 text-sm outline-none ring-0"
          />
          <button type="button" onClick={close} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Закрыть">
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul ref={listRef} className="max-h-[50vh] overflow-y-auto py-1">
          {results.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-slate-500">Ничего не найдено</li>
          ) : (
            results.map((hit, idx) => (
              <li key={`${hit.type}-${hit.href}`}>
                <button
                  type="button"
                  data-idx={idx}
                  onClick={() => go(hit)}
                  className={`flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm ${
                    idx === hilite ? "bg-slate-100" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="mt-0.5 shrink-0 rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-700">
                    {hit.typeLabel}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-slate-900">{hit.title}</span>
                    {hit.subtitle ? <span className="block truncate text-xs text-slate-500">{hit.subtitle}</span> : null}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500">
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1">↑</kbd>{" "}
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1">↓</kbd> навигация ·{" "}
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1">Enter</kbd> открыть ·{" "}
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1">Esc</kbd> закрыть
        </div>
      </div>
    </div>
  );
}
