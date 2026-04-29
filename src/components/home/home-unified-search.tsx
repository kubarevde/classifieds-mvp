"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { UnifiedSearchShell } from "@/components/search/unified-search-shell";
import { CatalogWorld } from "@/lib/listings";
import {
  buildListingsHref,
  defaultSavedSearchFilters,
  type SavedSearchFilters,
} from "@/lib/saved-searches";

const quickFilters: { label: string; href: string }[] = [
  { label: "Новые сегодня", href: "/listings?sort=newest" },
  { label: "С доставкой", href: "/listings?q=доставка" },
  { label: "До 50 000 ₽", href: "/listings?sort=price_asc&q=50000" },
  { label: "Только аукционы", href: "/listings?saleMode=auction" },
];

type WorldOption = { id: Exclude<CatalogWorld, "all">; label: string };

type HomeUnifiedSearchProps = {
  worldOptions: WorldOption[];
};

export function HomeUnifiedSearch({ worldOptions }: HomeUnifiedSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [world, setWorld] = useState<CatalogWorld>("all");

  const filtersForSubmit = useMemo((): SavedSearchFilters => {
    const w = worldOptions.some((o) => o.id === world) ? world : "all";
    return {
      ...defaultSavedSearchFilters,
      world: w,
      query: query.trim(),
    };
  }, [query, world, worldOptions]);

  const submit = () => {
    router.push(buildListingsHref(filtersForSubmit));
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <UnifiedSearchShell
        target="listing"
        onTargetChange={() => {}}
        showVerticalTabs={false}
        photoSearch="never"
        query={query}
        onQueryChange={setQuery}
        onQuerySubmit={submit}
        placeholder="Что вы ищете?"
        tone="marketplace"
        endSlot={
          <button
            type="button"
            onClick={submit}
            className="inline-flex h-11 min-w-[6.5rem] items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Найти
          </button>
        }
        extraControls={
          <label className="flex w-full min-w-0 flex-col gap-1 sm:max-w-[14rem]">
            <span className="text-xs font-medium text-slate-500">Мир</span>
            <select
              value={world}
              onChange={(e) => setWorld((e.target.value || "all") as CatalogWorld)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            >
              <option value="all">Все миры</option>
              {worldOptions.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </label>
        }
      />
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => (
          <a
            key={filter.label}
            href={filter.href}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
          >
            {filter.label}
          </a>
        ))}
      </div>
    </div>
  );
}
