import { categoryLabels, ListingsView, SortOption } from "@/lib/listings";
import { ListingCategory } from "@/lib/types";
import { SortSelect } from "@/components/listings/sort-select";

type FiltersBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  category: "all" | ListingCategory;
  onCategoryChange: (value: "all" | ListingCategory) => void;
  location: "all" | string;
  onLocationChange: (value: "all" | string) => void;
  locations: string[];
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  view: ListingsView;
  onViewChange: (value: ListingsView) => void;
};

export function FiltersBar({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  location,
  onLocationChange,
  locations,
  sortBy,
  onSortChange,
  view,
  onViewChange,
}: FiltersBarProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
          onChange={(event) => onCategoryChange(event.target.value as "all" | ListingCategory)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400"
        >
          <option value="all">Все категории</option>
          {Object.entries(categoryLabels).map(([categoryKey, label]) => (
            <option key={categoryKey} value={categoryKey}>
              {label}
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

      <div className="flex items-center justify-between gap-3">
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
      </div>
    </section>
  );
}
