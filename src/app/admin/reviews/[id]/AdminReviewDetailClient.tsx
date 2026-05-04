"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { cn } from "@/components/ui/cn";
import { buttonVariants } from "@/lib/button-styles";
import { dealsService } from "@/services/deals";
import { reviewsService, type Review } from "@/services/reviews";

export function AdminReviewDetailClient({ review }: { review: Review }) {
  const router = useRouter();
  const [row, setRow] = useState(review);
  const [busy, setBusy] = useState(false);
  const deal = dealsService.getDealById(row.dealId);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
        <p className="text-xs font-semibold uppercase text-slate-500">Статус</p>
        <p className="mt-1 font-medium text-slate-900">{row.status}</p>
        {row.flagReason ? <p className="mt-1 text-xs text-rose-700">Причина жалобы: {row.flagReason}</p> : null}
        <p className="mt-3 text-xs text-slate-500">Автор</p>
        <p className="font-mono text-xs">{row.authorId}</p>
        <p className="mt-3 text-xs text-slate-500">Цель</p>
        <p className="font-mono text-xs">
          {row.targetType} · {row.targetId}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-800">{row.text}</p>
      </div>
      {deal ? (
        <p className="text-sm text-slate-600">
          Сделка:{" "}
          <AdminInternalLink href={`/deals/${encodeURIComponent(deal.id)}`} className="font-semibold hover:underline">
            {deal.id}
          </AdminInternalLink>{" "}
          · листинг {deal.listingId}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || row.status === "published"}
          className={cn(buttonVariants({ variant: "primary", size: "md" }), "rounded-lg")}
          onClick={() => {
            setBusy(true);
            void reviewsService.approveReview(row.id, "moderator").then((next) => {
              setRow(next);
              router.refresh();
              setBusy(false);
            });
          }}
        >
          Одобрить (опубликовать)
        </button>
        <button
          type="button"
          disabled={busy}
          className={cn(buttonVariants({ variant: "outline", size: "md" }), "rounded-lg")}
          onClick={() => {
            setBusy(true);
            void reviewsService.removeReview(row.id, "moderator", "Решение модератора").then((next) => {
              setRow(next);
              router.refresh();
              setBusy(false);
            });
          }}
        >
          Снять с публикации
        </button>
      </div>
    </div>
  );
}
