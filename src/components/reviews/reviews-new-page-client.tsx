"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ReviewForm } from "@/components/reviews/ReviewForm";
import { useDemoRole } from "@/components/demo-role/demo-role";
import { useToast } from "@/components/ui/toast";
import { buttonVariants } from "@/lib/button-styles";
import { resolvePrimaryActorId } from "@/lib/messages-actors";
import { cn } from "@/components/ui/cn";
import { dealsService } from "@/services/deals";
import { reviewsService } from "@/services/reviews";

type Props = {
  dealId: string | null;
};

export function ReviewsNewPageClient({ dealId }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const { role, currentSellerId } = useDemoRole();
  const actorId = useMemo(() => resolvePrimaryActorId(role, currentSellerId), [role, currentSellerId]);
  const [done, setDone] = useState(false);

  const eligibility = useMemo(() => {
    if (!dealId) return null;
    return reviewsService.getReviewEligibility(dealId, actorId);
  }, [dealId, actorId]);

  const deal = dealId ? dealsService.getDealById(dealId) : undefined;

  if (!dealId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Нужна сделка</h1>
        <p className="mt-2 text-sm text-slate-600">Откройте эту страницу по ссылке из карточки завершённой сделки с параметром dealId.</p>
        <Link href="/dashboard?section=deals" className={cn(buttonVariants({ variant: "secondary", size: "md" }), "mt-4 inline-flex rounded-xl")}>
          Мои сделки
        </Link>
      </div>
    );
  }

  if (!eligibility) {
    return null;
  }

  const reasonText: Record<string, string> = {
    deal_not_found: "Сделка не найдена.",
    not_participant: "Вы не участник этой сделки.",
    deal_not_completed: "Отзыв доступен только после завершения сделки и взаимного подтверждения сторонами (reviewEligible).",
    already_reviewed: "Вы уже оставили отзыв по этой сделке.",
    target_not_resolved: "Не удалось определить адресата отзыва.",
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950 shadow-sm">
        <p className="font-semibold">Спасибо! Отзыв опубликован.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/deals/${encodeURIComponent(dealId)}`} className={cn(buttonVariants({ variant: "outline", size: "md" }), "rounded-xl")}>
            К сделке
          </Link>
          <Link
            href={eligibility.targetType === "store" ? `/stores/${encodeURIComponent(eligibility.targetId ?? "")}` : "/dashboard?section=deals"}
            className={cn(buttonVariants({ variant: "primary", size: "md" }), "rounded-xl")}
          >
            {eligibility.targetType === "store" ? "Витрина магазина" : "Мои сделки"}
          </Link>
        </div>
      </div>
    );
  }

  if (!eligibility.canReview) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-rose-950 shadow-sm">
        <h1 className="text-lg font-semibold">Нельзя оставить отзыв</h1>
        <p className="mt-2 text-sm">{reasonText[eligibility.reason ?? "deal_not_found"]}</p>
        {deal ? (
          <p className="mt-2 text-xs text-rose-800">
            Сделка {deal.id} · статус {deal.status} · reviewEligible: {deal.reviewEligible ? "да" : "нет"}
          </p>
        ) : null}
        <Link href="/dashboard?section=deals" className={cn(buttonVariants({ variant: "secondary", size: "md" }), "mt-4 inline-flex rounded-xl")}>
          Мои сделки
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Отзыв по сделке</h1>
        <p className="mt-1 text-sm text-slate-600">
          Сделка <span className="font-mono text-xs">{dealId}</span> · адресат: {eligibility.targetType === "store" ? "магазин" : "покупатель"}{" "}
          <span className="font-mono text-xs">{eligibility.targetId}</span>
        </p>
      </div>
      <ReviewForm
        onSubmit={async (input) => {
          await reviewsService.createReview({
            dealId,
            authorId: actorId,
            rating: input.rating,
            text: input.text,
          });
          showToast("Отзыв опубликован", "success");
          setDone(true);
          router.refresh();
        }}
      />
    </div>
  );
}
