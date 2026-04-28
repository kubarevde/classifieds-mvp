"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import type { TopListingAnalyticsRow } from "@/entities/analytics/model";
import type { SellerDashboardListing } from "@/lib/sellers";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { UpgradeModal } from "@/components/platform/UpgradeModal";

type SortKey = "views" | "contacts" | "conversionRate" | "favorites";

type TopListingsTableProps = {
  rows: TopListingAnalyticsRow[];
  listings: SellerDashboardListing[];
  sellerId: string;
};

export function TopListingsTable({ rows, listings, sellerId }: TopListingsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const { canUse, getGateResult } = useFeatureGate();
  const promoteAllowed = canUse("listing_promote");

  const titleById = useMemo(() => {
    const m = new Map<string, string>();
    listings.forEach((l) => m.set(l.id, l.title));
    return m;
  }, [listings]);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const mul = sortDir === "desc" ? -1 : 1;
      return av > bv ? mul : av < bv ? -mul : 0;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const promoteGateResult = getGateResult("listing_promote");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const boostHref = `/dashboard/store?sellerId=${encodeURIComponent(sellerId)}&marketing=boosts`;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm sm:p-4">
      <h3 className="text-sm font-semibold text-slate-900">Топ объявлений</h3>
      <p className="text-xs text-slate-500">
        Сортировка по метрикам того же периода, что и графики; усильте слабые строки через бусты.
      </p>
      <div className="mt-3 overflow-x-auto rounded-lg ring-1 ring-slate-100">
        <table className="w-full min-w-[480px] border-collapse text-left text-xs sm:min-w-[520px]">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-2">Объявление</th>
              {(["views", "contacts", "conversionRate", "favorites"] as const).map((key) => (
                <th key={key} className="py-2 px-2 text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort(key)}
                    className="inline-flex items-center gap-0.5 font-semibold text-slate-600 hover:text-slate-900"
                  >
                    {key === "views"
                      ? "Просмотры"
                      : key === "contacts"
                        ? "Контакты"
                        : key === "favorites"
                          ? "Избранное"
                          : "Конверсия"}
                    {sortKey === key ? (
                      sortDir === "desc" ? (
                        <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUp className="h-3 w-3" />
                      )
                    ) : null}
                  </button>
                </th>
              ))}
              <th className="py-2 pl-2 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const title = titleById.get(row.listingId) ?? `Объявление ${row.listingId}`;
              return (
                <tr key={row.listingId} className="border-b border-slate-100 last:border-0">
                  <td className="max-w-[200px] py-2.5 pr-2 font-medium text-slate-900">
                    <span className="line-clamp-2">{title}</span>
                  </td>
                  <td className="py-2.5 px-2 text-right tabular-nums text-slate-700">
                    {new Intl.NumberFormat("ru-RU").format(row.views)}
                  </td>
                  <td className="py-2.5 px-2 text-right tabular-nums text-slate-700">
                    {new Intl.NumberFormat("ru-RU").format(row.contacts)}
                  </td>
                  <td className="py-2.5 px-2 text-right tabular-nums text-slate-700">
                    {(row.conversionRate * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-2 text-right tabular-nums text-slate-700">
                    {new Intl.NumberFormat("ru-RU").format(row.favorites)}
                  </td>
                  <td className="py-2.5 pl-2 text-right">
                    {promoteAllowed ? (
                      <Link
                        href={boostHref}
                        className="inline-flex rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                      >
                        Продвинуть
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPromoModalOpen(true)}
                        className="inline-flex rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-950 transition hover:bg-amber-100"
                      >
                        Продвинуть
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        Продвижение ведёт в раздел маркетинга «Бусты» — там же можно сочетать с купонами и кампаниями.
      </p>
      {!promoteAllowed ? (
        <UpgradeModal
          isOpen={promoModalOpen}
          onClose={() => setPromoModalOpen(false)}
          reason={promoteGateResult.reason}
          currentPlan={promoteGateResult.currentPlan}
          requiredPlan={promoteGateResult.requiredPlan}
          currentUsage={promoteGateResult.currentUsage}
          limit={promoteGateResult.limit}
          featureLabel={promoteGateResult.featureLabel}
        />
      ) : null}
    </div>
  );
}
