"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useDemoRole } from "@/components/demo-role/demo-role";
import { buttonVariants } from "@/lib/button-styles";
import { resolvePrimaryActorId } from "@/lib/messages-actors";
import { cn } from "@/components/ui/cn";
import { mockListingsService } from "@/services/listings";
import { dealsService, type Deal } from "@/services/deals";
import { reviewsService } from "@/services/reviews";
import { messagesService, type MessageParticipant } from "@/services/messages";

import { DealStatusBadge } from "./DealStatusBadge";
import { DealTimeline } from "./DealTimeline";

const cancelReasons = ["Не удалось договориться", "Передумал", "Нашёл другой вариант", "Продавец не выходит на связь"];

type Props = {
  initialDeal: Deal;
};

export function DealPageClient({ initialDeal }: Props) {
  const router = useRouter();
  const { role, currentSellerId } = useDemoRole();
  const [deal, setDeal] = useState<Deal>(initialDeal);
  const [listingTitle, setListingTitle] = useState<string>("");
  const [buyerP, setBuyerP] = useState<MessageParticipant | null>(null);
  const [sellerP, setSellerP] = useState<MessageParticipant | null>(null);
  const [chatHref, setChatHref] = useState<string>("/messages");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeNote, setDisputeNote] = useState("");

  const actorId = useMemo(() => resolvePrimaryActorId(role, currentSellerId), [role, currentSellerId]);

  const isBuyer = actorId === deal.buyerId;
  const isSeller = actorId === deal.sellerId;

  const reviewEligibility = useMemo(() => reviewsService.getReviewEligibility(deal.id, actorId), [deal, actorId]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const listing = await mockListingsService.getById(deal.listingId);
      const [bp, sp, threads] = await Promise.all([
        messagesService.getParticipant(deal.buyerId),
        messagesService.getParticipant(deal.sellerId),
        messagesService.getThreadsByListingId(deal.listingId),
      ]);
      if (!alive) return;
      setListingTitle(listing?.title ?? deal.listingId);
      setBuyerP(bp);
      setSellerP(sp);
      const thread = threads.find((t) => t.participantIds.includes(deal.buyerId) && t.participantIds.includes(deal.sellerId));
      if (thread) {
        setChatHref(`/messages?thread=${encodeURIComponent(thread.id)}`);
      }
    })();
    return () => {
      alive = false;
    };
  }, [deal.buyerId, deal.listingId, deal.sellerId]);

  async function run(action: () => Promise<Deal>) {
    setBusy(true);
    setErr(null);
    try {
      const next = await action();
      setDeal(next);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  const storeSlug = deal.sellerId.startsWith("seller-account:") ? deal.sellerId.slice("seller-account:".length) : deal.sellerId;

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <Link href="/dashboard?section=deals" className="text-sm font-medium text-slate-600 hover:text-slate-900">
        ← Мои сделки
      </Link>

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <DealStatusBadge status={deal.status} />
          <span className="text-2xl font-bold text-slate-900">{deal.amount.toLocaleString("ru-RU")} ₽</span>
        </div>
        <h1 className="text-xl font-semibold text-slate-900">{listingTitle || "Объявление"}</h1>
        <p className="text-xs text-slate-500">Сделка {deal.id}</p>
      </header>

      {deal.status === "completed" && deal.reviewEligible && reviewEligibility.canReview ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
          <p className="font-semibold">Сделка завершена — оставьте отзыв</p>
          <Link
            href={`/reviews/new?dealId=${encodeURIComponent(deal.id)}`}
            className={cn(buttonVariants({ variant: "primary", size: "sm" }), "mt-2 inline-flex rounded-lg")}
          >
            Оставить отзыв
          </Link>
        </div>
      ) : null}
      {deal.status === "completed" && deal.reviewEligible && reviewEligibility.reason === "already_reviewed" ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
          <p className="font-semibold">Ваш отзыв по этой сделке уже опубликован</p>
          {reviewEligibility.targetType === "store" && reviewEligibility.targetId ? (
            <Link href={`/stores/${encodeURIComponent(reviewEligibility.targetId)}#store-reputation`} className="mt-2 inline-block text-sm font-medium text-sky-700 hover:underline">
              Смотреть на витрине
            </Link>
          ) : null}
        </div>
      ) : null}

      {deal.status === "disputed" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-semibold">Спор по сделке</p>
          <p className="mt-1 text-amber-900">Полноценный раздел споров появится в P37. Пока зафиксировано состояние «спор».</p>
          <button type="button" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-2 rounded-lg")} disabled>
            Перейти к спору (скоро)
          </button>
        </div>
      ) : null}

      {err ? <p className="text-sm text-rose-600">{err}</p> : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Участники</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <span className="text-slate-500">Покупатель: </span>
            <span className="font-medium">{buyerP?.name ?? deal.buyerId}</span>
            {deal.buyerId.startsWith("buyer-") ? (
              <Link href={`/dashboard`} className="ml-2 text-sky-700 hover:underline">
                Кабинет
              </Link>
            ) : null}
          </li>
          <li>
            <span className="text-slate-500">Продавец: </span>
            <span className="font-medium">{sellerP?.name ?? deal.sellerId}</span>
            <Link href={`/stores/${encodeURIComponent(storeSlug)}`} className="ml-2 text-sky-700 hover:underline">
              Витрина
            </Link>
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Таймлайн</h2>
        <div className="mt-3">
          <DealTimeline events={deal.timeline} />
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link href={chatHref} className={cn(buttonVariants({ variant: "outline", size: "md" }), "rounded-xl")}>
          Открыть чат по сделке
        </Link>
        <Link href={`/listings/${deal.listingId}`} className={cn(buttonVariants({ variant: "secondary", size: "md" }), "rounded-xl")}>
          Объявление
        </Link>
      </div>

      {deal.status === "active" ? (
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Действия</h2>
          <div className="flex flex-wrap gap-2">
            {isBuyer && !deal.buyerCompleted ? (
              <button
                type="button"
                disabled={busy}
                className={cn(buttonVariants({ variant: "primary", size: "md" }), "rounded-xl")}
                onClick={() => void run(() => dealsService.markDealCompletedByBuyer(deal.id, actorId))}
              >
                Отметить сделку завершённой
              </button>
            ) : null}
            {isSeller && !deal.sellerCompleted ? (
              <button
                type="button"
                disabled={busy}
                className={cn(buttonVariants({ variant: "primary", size: "md" }), "rounded-xl")}
                onClick={() => void run(() => dealsService.markDealCompletedBySeller(deal.id, actorId))}
              >
                Отметить сделку завершённой
              </button>
            ) : null}
            <button
              type="button"
              disabled={busy}
              className={cn(buttonVariants({ variant: "outline", size: "md" }), "rounded-xl")}
              onClick={() => setCancelOpen((v) => !v)}
            >
              Отменить сделку
            </button>
            <button
              type="button"
              disabled={busy}
              className={cn(buttonVariants({ variant: "secondary", size: "md" }), "rounded-xl")}
              onClick={() => setDisputeOpen((v) => !v)}
            >
              Открыть спор
            </button>
          </div>
          {cancelOpen ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm">
              <p className="font-medium text-slate-800">Причина отмены</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {cancelReasons.map((r) => (
                  <button
                    key={r}
                    type="button"
                    disabled={busy}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800 hover:bg-slate-100"
                    onClick={() => void run(() => dealsService.cancelDeal(deal.id, actorId, r))}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {disputeOpen ? (
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-sm">
              <label className="block text-xs font-medium text-slate-700">
                Комментарий
                <textarea className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" rows={2} value={disputeNote} onChange={(e) => setDisputeNote(e.target.value)} />
              </label>
              <button
                type="button"
                disabled={busy}
                className={cn(buttonVariants({ variant: "primary", size: "sm" }), "mt-2 rounded-lg")}
                onClick={() =>
                  void run(async () => dealsService.openDisputeForDeal(deal.id, actorId, disputeNote.trim() || undefined))
                }
              >
                Подтвердить спор
              </button>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
