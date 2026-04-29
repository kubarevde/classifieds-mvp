"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { searchHelpArticles } from "@/services/support";
import type { HelpArticle } from "@/services/support";
import { cn } from "@/components/ui/cn";

const DEBOUNCE_MS = 250;

type HelpSearchBarProps = {
  className?: string;
  inputId?: string;
  onNavigate?: () => void;
};

export function HelpSearchBar({ className, inputId = "help-search", onNavigate }: HelpSearchBarProps) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query), DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  const results = debounced.trim().length >= 2 ? searchHelpArticles(debounced) : [];
  const showPanel = debounced.trim().length >= 2;

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={inputId} className="sr-only">
        Поиск по статьям помощи
      </label>
      <input
        id={inputId}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск по статьям…"
        autoComplete="off"
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-slate-200 transition focus:border-blue-500 focus:ring-2"
      />
      {showPanel ? (
        <ul className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-500">Ничего не найдено</li>
          ) : (
            results.map((article: HelpArticle) => (
              <li key={article.id}>
                <Link
                  href={`/support/${article.categorySlug}/${article.slug}`}
                  onClick={() => {
                    onNavigate?.();
                    setQuery("");
                    setDebounced("");
                  }}
                  className="block px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-50"
                >
                  <span className="font-medium">{article.title}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{article.summary}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
