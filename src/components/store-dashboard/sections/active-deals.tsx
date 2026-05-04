"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";
import { dealsService } from "@/services/deals";

import { DealStatusBadge } from "@/components/deals/DealStatusBadge";

export function StoreActiveDealsSection({ sellerId }: { sellerId: string }) {
  const actorId = `seller-account:${sellerId}`;
  const [deals, setDeals] = useState(() => dealsService.getDealsForSeller(sellerId));
  const active = useMemo(
    () => deals.filter((d) => d.status === "active" || d.status === "disputed"),
    [deals],
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const completedReviewDeal = useMemo(
    () => deals.find((d) => d.status === "completed" && d.reviewEligible),
    [deals],
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-slate-900">Активные сделки</h2>
      <p className="text-sm text-slate-600">Сделки по вашим объявлениям в статусах «активна» и «спор».</p>
      {active.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Активных сделок нет.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {active.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <DealStatusBadge status={d.status} />
                  <span className="font-semibold text-slate-900">{d.amount.toLocaleString("ru-RU")} ₽</span>
                </div>
                <p className="text-xs text-slate-500">Листинг {d.listingId}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/deals/${encodeURIComponent(d.id)}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-lg")}>
                  Открыть
                </Link>
                {d.status === "active" && !d.sellerCompleted ? (
                  <button
                    type="button"
                    disabled={busyId === d.id}
                    className={cn(buttonVariants({ variant: "primary", size: "sm" }), "rounded-lg")}
                    onClick={() => {
                      setBusyId(d.id);
                      void dealsService
                        .markDealCompletedBySeller(d.id, actorId)
                        .then(() => {
                          setDeals(dealsService.getDealsForSeller(sellerId));
                        })
                        .finally(() => setBusyId(null));
                    }}
                  >
                    Отметить завершённой
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
      {completedReviewDeal ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950">
          <p className="font-semibold">Сделка завершена — оставьте отзыв</p>
          <p className="text-xs text-emerald-900">Для завершённых сделок доступен отзыв (P33).</p>
          <Link
            href={`/reviews/new?dealId=${encodeURIComponent(completedReviewDeal.id)}`}
            className={cn(buttonVariants({ variant: "primary", size: "sm" }), "mt-2 inline-flex rounded-lg")}
          >
            Оставить отзыв
          </Link>
        </div>
      ) : null}
    </section>
  );
}
