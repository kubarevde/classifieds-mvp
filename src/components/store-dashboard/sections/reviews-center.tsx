"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewSummaryCard } from "@/components/reviews/ReviewSummaryCard";
import { SellerReplyForm } from "@/components/reviews/SellerReplyForm";
import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";
import { reviewsService } from "@/services/reviews";

export function StoreReviewsCenterSection({ sellerId }: { sellerId: string }) {
  const actorId = `seller-account:${sellerId}`;
  const [tick, setTick] = useState(0);
  /** Фиксированная «текущая дата» сессии для mock-трендов без Date.now() в рендере. */
  const [trendClock] = useState(() => Date.now());
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  const summary = useMemo(() => {
    void tick;
    return reviewsService.getReviewSummary(sellerId, "store");
  }, [sellerId, tick]);

  const allForStore = useMemo(() => {
    void tick;
    return reviewsService.getReviewsForTarget(sellerId, "store").filter((r) => r.status !== "removed");
  }, [sellerId, tick]);

  const pending = useMemo(() => {
    void tick;
    return reviewsService.getPendingReplyReviewsForSeller(sellerId);
  }, [sellerId, tick]);

  const restReviews = useMemo(() => {
    const ids = new Set(pending.map((p) => p.id));
    return allForStore.filter((r) => !ids.has(r.id));
  }, [allForStore, pending]);

  const avg30 = summary.avgRating;
  const newCount = useMemo(() => {
    void tick;
    return allForStore.filter((r) => {
      const t = new Date(r.createdAt).getTime();
      return trendClock - t < 30 * 86400000;
    }).length;
  }, [allForStore, tick, trendClock]);

  return (
    <div className="space-y-4">
      <Link href={`/dashboard/store?sellerId=${encodeURIComponent(sellerId)}`} className="text-sm font-medium text-slate-600 hover:text-slate-900">
        ← Назад в кабинет
      </Link>
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Центр отзывов</h1>
        <p className="text-sm text-slate-600">Отзывы после завершённых сделок (P33) и ответы покупателям.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">30 дней (mock)</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{avg30.toFixed(1)}</p>
          <p className="text-xs text-slate-600">средняя оценка</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Новые</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{newCount}</p>
          <p className="text-xs text-slate-600">за 30 дней</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Ждут ответа</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{pending.length}</p>
          <p className="text-xs text-slate-600">без ответа продавца</p>
        </div>
      </div>
      <ReviewSummaryCard summary={summary} title="Сводка по магазину" />
      {pending.length > 0 ? (
        <section className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
          <h2 className="text-sm font-semibold text-amber-950">Требуют ответа</h2>
          <ul className="space-y-3">
            {pending.map((r) => (
              <li key={r.id} className="rounded-xl border border-amber-100 bg-white p-3">
                <ReviewCard review={r} showFlag={false} onChanged={refresh} />
                <SellerReplyForm reviewId={r.id} authorId={actorId} onDone={refresh} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-900">Все отзывы</h2>
        <ul className="space-y-3">
          {restReviews.map((r) => (
            <li key={r.id}>
              <ReviewCard review={r} onChanged={refresh} />
            </li>
          ))}
        </ul>
      </section>
      <Link href={`/stores/${encodeURIComponent(sellerId)}#store-reputation`} className={cn(buttonVariants({ variant: "outline", size: "md" }), "inline-flex rounded-xl")}>
        Как видят покупатели
      </Link>
    </div>
  );
}
