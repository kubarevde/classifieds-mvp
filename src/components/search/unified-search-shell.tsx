"use client";

/**
 * Global / contextual search chrome on top of unified SearchIntent:
 * - Optional vertical tabs (Товары / Магазины) for catalog surfaces only.
 * - Photo search only for listing discovery (`photoSearch="when-listing"` + target listing), never for store-only contexts.
 * - Refinements and category scope stay outside this component.
 */

import { ImagePlus, Search } from "lucide-react";
import type { ReactNode } from "react";

import type { SearchTarget } from "@/entities/search/model";

export type UnifiedSearchShellTone = "marketplace" | "minimal";

type UnifiedSearchShellProps = {
  target: SearchTarget;
  onTargetChange: (next: SearchTarget) => void;
  /** When false, hides Товары/Магазины (world hub, /stores, storefront). */
  showVerticalTabs?: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onQuerySubmit?: () => void;
  onPhotoSearch?: () => void;
  /**
   * `when-listing`: show control only for listing target (hidden in store mode — not a misleading disabled CTA).
   * `never`: never show (e.g. future in-store inventory-only surfaces).
   */
  photoSearch?: "when-listing" | "never";
  placeholder?: string;
  extraControls?: ReactNode;
  tone?: UnifiedSearchShellTone;
};

export function UnifiedSearchShell({
  target,
  onTargetChange,
  showVerticalTabs = true,
  query,
  onQueryChange,
  onQuerySubmit,
  onPhotoSearch,
  photoSearch = "when-listing",
  placeholder = "Поиск",
  extraControls,
  tone = "marketplace",
}: UnifiedSearchShellProps) {
  const showPhoto =
    photoSearch === "when-listing" && target === "listing" && typeof onPhotoSearch === "function";

  const surface =
    tone === "minimal"
      ? "rounded-xl border border-slate-100 bg-white/90 p-3 shadow-none"
      : "rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/90 p-3 shadow-sm shadow-slate-900/[0.04] sm:p-4";

  return (
    <section className={surface}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        {showVerticalTabs ? (
          <div className="inline-flex shrink-0 rounded-xl bg-slate-900/[0.06] p-1">
            <button
              type="button"
              onClick={() => onTargetChange("listing")}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                target === "listing" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Товары
            </button>
            <button
              type="button"
              onClick={() => onTargetChange("store")}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                target === "store" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Магазины
            </button>
          </div>
        ) : null}

        {extraControls ? (
          <div className="flex flex-wrap items-center justify-end gap-2 sm:min-w-[8rem] sm:flex-1">{extraControls}</div>
        ) : null}
      </div>

      <div className={`mt-3 flex flex-col gap-2 ${showVerticalTabs || extraControls ? "" : "mt-0"} sm:flex-row sm:items-stretch`}>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onQuerySubmit?.();
              }
            }}
            placeholder={placeholder}
            className="h-11 w-full rounded-xl border border-slate-200/90 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
          />
        </div>
        {showPhoto ? (
          <button
            type="button"
            onClick={() => onPhotoSearch?.()}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ImagePlus className="h-4 w-4 text-slate-500" />
            <span className="hidden sm:inline">По фото</span>
            <span className="sm:hidden">Фото</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
