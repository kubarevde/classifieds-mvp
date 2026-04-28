"use client";

import Link from "next/link";

import { Button } from "@/components/ui";
import type { UnifiedCatalogListing } from "@/lib/listings";

type AIPriceRecommendationProps = {
  min: number;
  max: number;
  recommended: number;
  reasoning: string;
  comparables: UnifiedCatalogListing[];
  loading: boolean;
  disabled: boolean;
  onSuggest: () => void;
  onApply: (value: number) => void;
  onDismiss?: () => void;
};

export function AIPriceRecommendation({
  min,
  max,
  recommended,
  reasoning,
  comparables,
  loading,
  disabled,
  onSuggest,
  onApply,
  onDismiss,
}: AIPriceRecommendationProps) {
  const hasData = !loading && (min > 0 || max > 0);
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/90 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Рекомендация цены</p>
        <div className="flex flex-wrap gap-1">
          <Button type="button" size="sm" variant="outline" disabled={disabled || loading} onClick={onSuggest}>
            {loading ? "…" : "Обновить"}
          </Button>
          {onDismiss && hasData ? (
            <Button type="button" size="sm" variant="ghost" disabled={disabled} onClick={onDismiss}>
              Скрыть
            </Button>
          ) : null}
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-12 animate-pulse rounded-lg bg-slate-200/80" />
        </div>
      ) : (
        <>
          <p className="text-sm font-medium text-slate-900">
            Диапазон: {min.toLocaleString("ru-RU")} – {max.toLocaleString("ru-RU")} ₽
          </p>
          <p className="text-lg font-bold text-slate-900">Рекомендуем: {recommended.toLocaleString("ru-RU")} ₽</p>
          <p className="text-xs leading-relaxed text-slate-600">{reasoning}</p>
          <Button type="button" size="sm" variant="primary" className="w-full sm:w-auto" disabled={disabled} onClick={() => onApply(recommended)}>
            Применить в поле
          </Button>
        </>
      )}
      <div className="border-t border-slate-200 pt-2">
        <p className="text-xs font-semibold text-slate-700">Похожие объявления</p>
        {comparables.length ? (
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {comparables.map((listing) => {
              const href = listing.detailsHref ?? `/listings/${listing.id}`;
              return (
                <Link
                  key={listing.id}
                  href={href}
                  className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-slate-300"
                >
                  <div className={`h-16 bg-gradient-to-br ${listing.image}`} />
                  <div className="space-y-1 p-2">
                    <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-slate-900">{listing.title}</p>
                    <p className="text-xs font-bold text-slate-800">{listing.price}</p>
                    <p className="text-[10px] text-slate-500">{listing.location}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="mt-1 text-xs text-slate-500">Нет превью в текущей выборке каталога.</p>
        )}
      </div>
    </div>
  );
}
