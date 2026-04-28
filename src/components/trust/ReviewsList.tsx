"use client";

import { useEffect, useMemo, useState } from "react";

import type { Review } from "@/entities/trust/model";
import { mockTrustService, type ReviewFilters, type ReviewStats } from "@/services/trust";

import { ReviewCard } from "./ReviewCard";
import { ReviewFormModal } from "./ReviewFormModal";
import { ratingLabel } from "./trust-utils";

type ReviewsListProps = {
  targetId: string;
  /** Скрыть CTA «Написать отзыв» (например, в кабинете продавца). */
  hideWriteReview?: boolean;
  /** Якорь для навигации (например, полный список отзывов на витрине). */
  sectionId?: string;
  /** Внутри составной секции витрины: без дублирующего заголовка «Отзывы» и строки рейтинга. */
  compactHeader?: boolean;
};

const ratingFilters: Array<{ id: "all" | 5 | 4 | 3 | 2 | 1; label: string }> = [
  { id: "all", label: "Все" },
  { id: 5, label: "5★" },
  { id: 4, label: "4★" },
  { id: 3, label: "3★" },
  { id: 2, label: "2★" },
  { id: 1, label: "1★" },
];

export function ReviewsList({ targetId, hideWriteReview = false, sectionId, compactHeader = false }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [rating, setRating] = useState<ReviewFilters["rating"] | "all">("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<ReviewFilters["sort"]>("newest");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filters: ReviewFilters = useMemo(
    () => ({
      rating: rating === "all" ? undefined : rating,
      verifiedOnly,
      sort,
    }),
    [rating, sort, verifiedOnly],
  );

  useEffect(() => {
    let cancelled = false;
    void Promise.all([mockTrustService.getReviews(targetId, filters), mockTrustService.getReviewStats(targetId)]).then(
      ([nextReviews, nextStats]) => {
        if (cancelled) {
          return;
        }
        setReviews(nextReviews);
        setStats(nextStats);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [targetId, filters]);

  async function reload() {
    const [nextReviews, nextStats] = await Promise.all([
      mockTrustService.getReviews(targetId, filters),
      mockTrustService.getReviewStats(targetId),
    ]);
    setReviews(nextReviews);
    setStats(nextStats);
  }

  async function handleHelpful(reviewId: string) {
    await mockTrustService.markHelpful(reviewId);
    await reload();
  }

  async function handleCreateReview(input: Parameters<typeof mockTrustService.addReview>[0]) {
    await mockTrustService.addReview(input);
    await reload();
  }

  return (
    <section id={sectionId} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      {compactHeader ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Фильтры и полный список</p>
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">Отзывы</h3>
            <p className="mt-1 text-sm text-slate-600">
              Рейтинг {stats ? ratingLabel(stats.overallRating) : "—"} / 5 · {stats?.total ?? 0} отзывов
            </p>
          </div>
          {hideWriteReview ? null : (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white"
            >
              Написать отзыв
            </button>
          )}
        </div>
      )}

      {stats ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {stats.distribution.map((item) => (
            <div key={item.rating} className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-6">{item.rating}★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-800"
                  style={{ width: `${stats.total ? Math.round((item.count / stats.total) * 100) : 0}%` }}
                />
              </div>
              <span className="w-6 text-right tabular-nums">{item.count}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
        {ratingFilters.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setRating(option.id)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              rating === option.id ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-white"
            }`}
          >
            {option.label}
          </button>
        ))}
        <label className="ml-auto inline-flex items-center gap-1 text-xs text-slate-700">
          <input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} />
          Только проверенные
        </label>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as ReviewFilters["sort"])}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"
        >
          <option value="newest">Новые</option>
          <option value="helpful">Полезные</option>
          <option value="critical">Критические</option>
        </select>
      </div>

      <div className="space-y-3">
        {reviews.length ? (
          reviews.map((review) => <ReviewCard key={review.id} review={review} onHelpful={handleHelpful} />)
        ) : (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
            Отзывов пока нет. Станьте первым, кто поделится опытом.
          </p>
        )}
      </div>

      {hideWriteReview ? null : (
        <ReviewFormModal targetId={targetId} open={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateReview} />
      )}
    </section>
  );
}
