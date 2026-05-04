"use client";

import { useState } from "react";

import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";
import { reviewsService, type Review as DealReview } from "@/services/reviews";

function formatAt(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function Stars({ rating }: { rating: DealReview["rating"] }) {
  return <span className="text-amber-500">{Array.from({ length: 5 }, (_, i) => (i < rating ? "★" : "☆")).join("")}</span>;
}

type Props = {
  review: DealReview;
  showFlag?: boolean;
  onChanged?: () => void;
};

export function ReviewCard({ review, showFlag = true, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  if (review.status === "removed") return null;

  return (
    <article className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{review.authorDisplayName ?? review.authorId}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Stars rating={review.rating} />
            <span>{formatAt(review.createdAt)}</span>
            {review.status === "flagged" ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">На модерации</span>
            ) : null}
          </div>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-slate-700">{review.text}</p>
      {review.reply ? (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <p className="text-xs font-semibold text-slate-500">Ответ</p>
          <p className="mt-1">{review.reply.text}</p>
          <p className="mt-1 text-[11px] text-slate-400">{formatAt(review.reply.createdAt)}</p>
        </div>
      ) : null}
      {showFlag && review.status === "published" ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="text-xs font-medium text-slate-500 hover:text-slate-800" onClick={() => setOpen((v) => !v)}>
            Пожаловаться (mock)
          </button>
          {open ? (
            <div className="flex flex-wrap gap-1">
              {["спам", "оскорбление", "ложная информация"].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-lg text-xs")}
                  onClick={() => {
                    void reviewsService.flagReview(review.id, "viewer", reason).then(() => {
                      setOpen(false);
                      onChanged?.();
                    });
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <p className="text-[10px] text-slate-400">Сделка {review.dealId}</p>
    </article>
  );
}
