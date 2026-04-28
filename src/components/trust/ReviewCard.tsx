"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ThumbsUp } from "lucide-react";

import type { Review } from "@/entities/trust/model";

type ReviewCardProps = {
  review: Review;
  onHelpful: (reviewId: string) => void;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function Stars({ rating }: { rating: Review["rating"] }) {
  return (
    <span className="text-amber-500">{Array.from({ length: 5 }, (_, index) => (index < rating ? "★" : "☆")).join("")}</span>
  );
}

export function ReviewCard({ review, onHelpful }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const isLong = review.text.length > 180;

  return (
    <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{review.authorName}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Stars rating={review.rating} />
            <span>{formatDate(review.createdAt)}</span>
            {review.verified ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700">
                Проверенная сделка
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <p className={`text-sm leading-relaxed text-slate-700 ${!isExpanded && isLong ? "line-clamp-4" : ""}`}>{review.text}</p>
      {isLong ? (
        <button type="button" onClick={() => setIsExpanded((current) => !current)} className="text-xs font-medium text-slate-600 hover:text-slate-900">
          {isExpanded ? "Свернуть" : "Читать полностью"}
        </button>
      ) : null}

      {review.pros || review.cons ? (
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          {review.pros ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Плюсы</p>
              <p className="mt-1 text-emerald-900">{review.pros}</p>
            </div>
          ) : null}
          {review.cons ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Минусы</p>
              <p className="mt-1 text-rose-900">{review.cons}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {review.photos?.length ? (
        <div className="flex flex-wrap gap-2">
          {review.photos.slice(0, 4).map((photo, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`${review.id}-${index}`} src={photo} alt="Фото отзыва" className="h-14 w-14 rounded-lg object-cover" />
          ))}
        </div>
      ) : null}

      {review.sellerReply ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <button
            type="button"
            onClick={() => setShowReply((current) => !current)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700"
          >
            Ответ продавца {showReply ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {showReply ? <p className="mt-1 text-sm text-slate-700">{review.sellerReply}</p> : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onHelpful(review.id)}
        className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
        Полезно {review.helpful}
      </button>
    </article>
  );
}
