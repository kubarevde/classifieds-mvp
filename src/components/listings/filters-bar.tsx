import { ReactNode } from "react";

import type { AuctionSaleMode } from "@/entities/auction/model";
import { ListingsView, SortOption, UnifiedCategoryOption } from "@/lib/listings";
import { SortSelect } from "@/components/listings/sort-select";

type FiltersBarVariant = "full" | "refinements-only";

type FiltersBarProps = {
  /** `refinements-only`: no text search input — query lives in the canonical search shell above. */
  variant?: FiltersBarVariant;
  /** When category is controlled by a scope row (chips) above, hide the duplicate category `<select>`. */
  hideCategory?: boolean;
  query?: string;
  onQueryChange?: (value: string) => void;
  onQuerySubmit?: () => void;
  category: "all" | string;
  onCategoryChange: (value: "all" | string) => void;
  categoryOptions: UnifiedCategoryOption[];
  location: "all" | string;
  onLocationChange: (value: "all" | string) => void;
  locations: string[];
  saleMode: AuctionSaleMode;
  onSaleModeChange: (value: AuctionSaleMode) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  view: ListingsView;
  onViewChange: (value: ListingsView) => void;
  actions?: ReactNode;
  className?: string;
};

export function FiltersBar({
  variant = "full",
  hideCategory = false,
  query = "",
  onQueryChange,
  onQuerySubmit,
  category,
  onCategoryChange,
  categoryOptions,
  location,
  onLocationChange,
  locations,
  saleMode,
  onSaleModeChange,
  sortBy,
  onSortChange,
  view,
  onViewChange,
  actions,
  className = "",
}: FiltersBarProps) {
  const isRefinementsOnly = variant === "refinements-only";
  const shellTone = isRefinementsOnly
    ? "rounded-lg border-0 border-t border-slate-200/80 bg-transparent px-0 py-3 pt-3 shadow-none sm:py-3.5"
    : "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5";

  return (
    <section className={`${shellTone} space-y-3 ${className}`}>
      {isRefinementsOnly ? (
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Фильтры выдачи</p>
      ) : null}
      <div
        className={
          isRefinementsOnly
            ? "flex flex-wrap gap-2 sm:gap-2.5"
            : "grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
        }
      >
        {!isRefinementsOnly ? (
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange?.(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onQuerySubmit?.();
              }
            }}
            placeholder="Поиск по названию"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 lg:col-span-2 xl:col-span-1"
          />
        ) : null}

        {!hideCategory ? (
          <select
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400"
          >
            <option value="all">Все категории</option>
            {categoryOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        ) : null}

        <select
          value={saleMode}
          onChange={(event) => onSaleModeChange(event.target.value as AuctionSaleMode)}
          className={`rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none transition focus:border-slate-400 ${
            isRefinementsOnly ? "h-9 min-w-[8.5rem] px-2.5 py-1" : "px-3 py-2.5"
          }`}
        >
          <option value="all">Все режимы</option>
          <option value="fixed">Продажа</option>
          <option value="auction">Аукцион</option>
          <option value="free">Бесплатно</option>
        </select>

        <select
          value={location}
          onChange={(event) => onLocationChange(event.target.value)}
          className={`rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none transition focus:border-slate-400 ${
            isRefinementsOnly ? "h-9 min-w-[9rem] px-2.5 py-1" : "px-3 py-2.5"
          }`}
        >
          <option value="all">Все города</option>
          {locations.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <SortSelect value={sortBy} onChange={onSortChange} compact={isRefinementsOnly} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className={`inline-flex rounded-xl border bg-slate-50 p-0.5 ${
            isRefinementsOnly ? "border-slate-200/80" : "border-slate-200"
          }`}
        >
          <button
            type="button"
            onClick={() => onViewChange("grid")}
            className={`rounded-lg font-medium transition ${
              isRefinementsOnly ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
            } ${
              view === "grid"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Сетка
          </button>
          <button
            type="button"
            onClick={() => onViewChange("list")}
            className={`rounded-lg font-medium transition ${
              isRefinementsOnly ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
            } ${
              view === "list"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Список
          </button>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{actions}</div> : null}
      </div>
    </section>
  );
}
