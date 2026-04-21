import { DashboardFilter } from "@/components/dashboard/types";
import { dashboardFilterLabel } from "@/lib/dashboard";

type DashboardFiltersProps = {
  value: DashboardFilter;
  onChange: (filter: DashboardFilter) => void;
  counts: Record<DashboardFilter, number>;
};

const filterOptions: DashboardFilter[] = ["all", "active", "draft", "sold"];

export function DashboardFilters({ value, onChange, counts }: DashboardFiltersProps) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="inline-flex min-w-full gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-1">
        {filterOptions.map((filter) => {
          const isActive = value === filter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => onChange(filter)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
              }`}
            >
              <span>{dashboardFilterLabel[filter]}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {counts[filter]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
