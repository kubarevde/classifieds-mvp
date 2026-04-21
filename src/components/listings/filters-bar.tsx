import { ReactNode } from "react";

import { ListingsView, SortOption, UnifiedCategoryOption } from "@/lib/listings";
import { SortSelect } from "@/components/listings/sort-select";

type FiltersBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  category: "all" | string;
  onCategoryChange: (value: "all" | string) => void;
  categoryOptions: UnifiedCategoryOption[];
  location: "all" | string;
  onLocationChange: (value: "all" | string) => void;
  locations: string[];
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  view: ListingsView;
  onViewChange: (value: ListingsView) => void;
  actions?: ReactNode;
  className?: string;
};

export function FiltersBar({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  categoryOptions,
  location,
  onLocationChange,
  locations,
  sortBy,
  onSortChange,
  view,
  onViewChange,
  actions,
  className = "",
}: FiltersBarProps) {
  return (
    <section className={`space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Поиск по названию"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
        />

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

        <select
          value={location}
          onChange={(event) => onLocationChange(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400"
        >
          <option value="all">Все города</option>
          {locations.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <SortSelect value={sortBy} onChange={onSortChange} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => onViewChange("grid")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
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
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
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
