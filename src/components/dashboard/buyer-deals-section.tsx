"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";
import { dealsService, type Deal, type DealStatus } from "@/services/deals";
import { reviewsService } from "@/services/reviews";

import { DealStatusBadge } from "@/components/deals/DealStatusBadge";

const DEMO_BUYER_ID = "buyer-dmitriy";

type Filter = "all" | DealStatus;

export function BuyerDealsSection() {
  const [filter, setFilter] = useState<Filter>("all");
  const deals = useMemo(() => dealsService.getDealsForUser(DEMO_BUYER_ID), []);
  const rows = useMemo(() => {
    if (filter === "all") return deals;
    return deals.filter((d) => d.status === filter);
  }, [deals, filter]);

  return (
    <div className="space-y-4">
      <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">
        ← Назад в кабинет
      </Link>
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Мои сделки</h1>
        <p className="text-sm text-slate-600">Статусы и быстрые действия по демо-данным.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "Все"],
            ["active", "Активные"],
            ["completed", "Завершённые"],
            ["cancelled", "Отменённые"],
            ["disputed", "Споры"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold",
              filter === id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">Нет сделок в этом фильтре.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((d) => (
            <DealRow key={d.id} deal={d} buyerId={DEMO_BUYER_ID} />
          ))}
        </ul>
      )}
    </div>
  );
}

function DealRow({ deal, buyerId }: { deal: Deal; buyerId: string }) {
  const el = useMemo(() => reviewsService.getReviewEligibility(deal.id, buyerId), [deal, buyerId]);
  const showReviewCta = deal.status === "completed" && deal.reviewEligible && el.canReview;
  const reviewDone = deal.status === "completed" && deal.reviewEligible && el.reason === "already_reviewed";
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <DealStatusBadge status={deal.status} />
          <p className="mt-1 font-semibold text-slate-900">{deal.amount.toLocaleString("ru-RU")} ₽</p>
          <p className="text-xs text-slate-500">Объявление {deal.listingId}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Link href={`/deals/${encodeURIComponent(deal.id)}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-lg")}>
            Детали
          </Link>
          {showReviewCta ? (
            <Link
              href={`/reviews/new?dealId=${encodeURIComponent(deal.id)}`}
              className={cn(buttonVariants({ variant: "primary", size: "sm" }), "rounded-lg")}
            >
              Оставить отзыв
            </Link>
          ) : null}
          {reviewDone ? (
            <span className="text-xs font-medium text-emerald-700">Отзыв оставлен</span>
          ) : null}
          {deal.status === "active" ? (
            <Link href={`/deals/${encodeURIComponent(deal.id)}`} className="text-xs font-medium text-sky-700 hover:underline">
              Отметить завершённой
            </Link>
          ) : null}
        </div>
      </div>
    </li>
  );
}
