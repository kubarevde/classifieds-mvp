import { SortOption, sortOptions } from "@/lib/listings";

type SortSelectProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
  compact?: boolean;
};

export function SortSelect({ value, onChange, compact = false }: SortSelectProps) {
  return (
    <label
      className={`flex items-center gap-2 text-slate-600 ${compact ? "gap-1.5 text-xs text-slate-500" : "text-sm"}`}
    >
      <span className={compact ? "hidden sm:inline" : ""}>Сортировка:</span>
      <select
        className={`rounded-xl border border-slate-200 bg-white font-medium text-slate-700 outline-none transition focus:border-slate-400 ${
          compact ? "h-9 px-2.5 py-1 text-xs" : "px-3 py-2 text-sm"
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
