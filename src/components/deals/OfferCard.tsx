"use client";

import Link from "next/link";
import { useState } from "react";

import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";
import { dealsService, type Offer, type OfferStatus } from "@/services/deals";

const statusLabel: Record<OfferStatus, string> = {
  pending: "Ожидает ответа",
  countered: "Встречное предложение",
  accepted: "Принято",
  declined: "Отклонено",
  expired: "Истекло",
};

const statusTone: Record<OfferStatus, string> = {
  pending: "bg-amber-50 text-amber-900 border-amber-200",
  countered: "bg-sky-50 text-sky-900 border-sky-200",
  accepted: "bg-emerald-50 text-emerald-900 border-emerald-200",
  declined: "bg-slate-100 text-slate-700 border-slate-200",
  expired: "bg-slate-100 text-slate-500 border-slate-200",
};

type Props = {
  offer: Offer;
  currentUserId: string;
  onChanged?: () => void;
};

export function OfferCard({ offer, currentUserId, onChanged }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [counterOpen, setCounterOpen] = useState(false);
  const [counterValue, setCounterValue] = useState(String(offer.counterAmount ?? offer.amount));
  const [counterNote, setCounterNote] = useState("");

  const isSeller = currentUserId === offer.sellerId;
  const canAct = isSeller && (offer.status === "pending" || offer.status === "countered");

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setErr(null);
    try {
      await action();
      onChanged?.();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Предложение цены</p>
          <p className="text-lg font-bold text-slate-900">{offer.amount.toLocaleString("ru-RU")} ₽</p>
          {offer.counterAmount != null ? (
            <p className="text-sm text-slate-600">
              Встречная цена: <span className="font-semibold">{offer.counterAmount.toLocaleString("ru-RU")} ₽</span>
            </p>
          ) : null}
        </div>
        <span className={cn("rounded-full border px-2 py-0.5 text-xs font-semibold", statusTone[offer.status])}>
          {statusLabel[offer.status]}
        </span>
      </div>
      {offer.message ? <p className="mt-2 text-sm text-slate-700">{offer.message}</p> : null}
      {err ? <p className="mt-2 text-xs text-rose-600">{err}</p> : null}

      {canAct ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            className={cn(buttonVariants({ variant: "primary", size: "sm" }), "rounded-lg")}
            onClick={() =>
              run(async () => {
                await dealsService.acceptOffer(offer.id, currentUserId);
              })
            }
          >
            Принять
          </button>
          <button
            type="button"
            disabled={busy}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-lg")}
            onClick={() =>
              run(async () => {
                const note = typeof window !== "undefined" ? window.prompt("Комментарий (необязательно)") : null;
                await dealsService.declineOffer(offer.id, currentUserId, note ?? undefined);
              })
            }
          >
            Отклонить
          </button>
          <button
            type="button"
            disabled={busy}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "rounded-lg")}
            onClick={() => setCounterOpen((v) => !v)}
          >
            Сделать встречное
          </button>
        </div>
      ) : null}

      {counterOpen && canAct ? (
        <div className="mt-3 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-2">
          <label className="block text-xs font-medium text-slate-600">
            Сумма, ₽
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              value={counterValue}
              onChange={(e) => setCounterValue(e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Комментарий
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              value={counterNote}
              onChange={(e) => setCounterNote(e.target.value)}
              placeholder="Необязательно"
            />
          </label>
          <button
            type="button"
            disabled={busy}
            className={cn(buttonVariants({ variant: "primary", size: "sm" }), "rounded-lg")}
            onClick={() =>
              run(async () => {
                const n = Number(counterValue);
                if (!Number.isFinite(n) || n <= 0) throw new Error("Введите корректную сумму");
                await dealsService.counterOffer(offer.id, currentUserId, n, counterNote.trim() || undefined);
                setCounterOpen(false);
              })
            }
          >
            Отправить встречное
          </button>
        </div>
      ) : null}

      {offer.status === "accepted" ? (
        <p className="mt-2 text-xs text-slate-500">
          По принятому предложению создана сделка — смотрите системные сообщения в чате или раздел «Сделки».
        </p>
      ) : null}
      <p className="mt-2 text-[11px] text-slate-400">ID: {offer.id}</p>
      <Link href={`/listings/${offer.listingId}`} className="mt-1 inline-block text-xs font-medium text-sky-700 hover:underline">
        К объявлению
      </Link>
    </div>
  );
}
