"use client";

import { ChevronDown } from "lucide-react";
import type { UnifiedCategoryOption } from "@/lib/listings";

const DEFAULT_TOP = 6;

type CatalogCategoryScopeProps = {
  categoryOptions: UnifiedCategoryOption[];
  resolvedCategory: "all" | string;
  onCategoryChange: (id: "all" | string) => void;
  /** Called when user picks a category (for intent mode). */
  onInteract?: () => void;
  /** How many top categories show as quick chips before the “more” control. */
  topQuickCategories?: number;
  /** Lighter surface for world hub vs full listings page. */
  density?: "default" | "compact";
};

export function CatalogCategoryScope({
  categoryOptions,
  resolvedCategory,
  onCategoryChange,
  onInteract,
  topQuickCategories = DEFAULT_TOP,
  density = "default",
}: CatalogCategoryScopeProps) {
  const top = categoryOptions.slice(0, topQuickCategories);
  const rest = categoryOptions.slice(topQuickCategories);
  const inRest = rest.some((o) => o.id === resolvedCategory);
  const chipIds = ["all", ...top.map((o) => o.id)] as const;

  const wrapClass =
    density === "compact"
      ? "rounded-xl border border-slate-100/90 bg-white/80 px-2 py-2"
      : "rounded-xl border border-slate-100 bg-white px-2 py-2.5 shadow-sm shadow-slate-900/[0.02]";

  return (
    <div className={`${wrapClass} space-y-2`}>
      <div className="flex flex-wrap items-center gap-2 px-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Раздел</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {chipIds.map((id) => {
          const label =
            id === "all"
              ? "Все"
              : (categoryOptions.find((item) => item.id === id)?.label ?? id);
          const active = resolvedCategory === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                onInteract?.();
                onCategoryChange(id);
              }}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition sm:px-3 sm:py-1.5 ${
                active
                  ? "border-slate-800 bg-slate-900 text-white"
                  : "border-slate-200/90 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-white"
              }`}
            >
              {label}
            </button>
          );
        })}

        {rest.length > 0 ? (
          <label className="relative inline-flex min-w-[9.5rem] flex-1 items-center sm:max-w-[220px] sm:flex-none">
            <span className="sr-only">Другие категории</span>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <select
              value={inRest ? resolvedCategory : ""}
              onChange={(event) => {
                const value = event.target.value;
                onInteract?.();
                if (!value) {
                  return;
                }
                onCategoryChange(value);
              }}
              className="h-8 w-full cursor-pointer appearance-none rounded-full border border-dashed border-slate-200 bg-white py-1 pl-3 pr-8 text-xs font-medium text-slate-600 outline-none transition hover:border-slate-300 hover:text-slate-900 focus:border-slate-400 sm:h-9 sm:text-[13px]"
            >
              <option value="">Ещё категории…</option>
              {rest.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    </div>
  );
}
