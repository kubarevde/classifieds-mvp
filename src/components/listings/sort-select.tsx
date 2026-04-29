import { SortOption, sortOptions } from "@/lib/listings";

type SortSelectProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
  compact?: boolean;
};

export function SortSelect({ value, onChange, compact = false }: SortSelectProps) {
  return (
    <label
      className={`flex items-center gap-2 text-slate-600 ${compact ? "gap-1.5 text-sm text-slate-500" : "text-sm"}`}
    >
      <span className={compact ? "hidden sm:inline" : ""}>Сортировка:</span>
      <select
        className={`rounded-xl border border-slate-200/90 bg-white font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200 ${
          compact ? "h-11 min-h-[44px] px-2.5 text-sm" : "px-3 py-2 text-sm"
        }`}
        value={value}
        onChange={(event) => onChange(event.target.value as SortOption)}
      >
        {Object.entries(sortOptions).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
