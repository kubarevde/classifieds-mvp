"use client";

import { useState } from "react";

import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";
import { dealsService } from "@/services/deals";
import { messagesService } from "@/services/messages";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
  referencePrice: number;
  buyerId: string;
  sellerAccountId: string;
  onSubmitted?: (threadId: string) => void;
};

export function ListingOfferSheet({
  open,
  onOpenChange,
  listingId,
  listingTitle,
  referencePrice,
  buyerId,
  sellerAccountId,
  onSubmitted,
}: Props) {
  const [amount, setAmount] = useState(String(Math.max(1, Math.round(referencePrice * 0.95))));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!open) return null;

  async function submit() {
    setBusy(true);
    setErr(null);
    try {
      const n = Number(amount);
      if (!Number.isFinite(n) || n <= 0) {
        throw new Error("Введите корректную сумму");
      }
      await dealsService.createOffer({
        listingId,
        buyerId,
        sellerId: sellerAccountId,
        amount: n,
        message: message.trim() || undefined,
      });
      const threads = await messagesService.getThreadsByListingId(listingId);
      const thread =
        threads.find((t) => t.participantIds.includes(buyerId) && t.participantIds.includes(sellerAccountId)) ?? threads[0];
      const threadId = thread?.id;
      if (threadId) {
        onSubmitted?.(threadId);
      }
      onOpenChange(false);
      setMessage("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Не удалось отправить предложение");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Предложить цену</h2>
            <p className="mt-1 text-sm text-slate-600 line-clamp-2">{listingTitle}</p>
          </div>
          <button type="button" className="text-sm text-slate-500 hover:text-slate-800" onClick={() => onOpenChange(false)}>
            Закрыть
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">Ориентир по цене в объявлении: {referencePrice.toLocaleString("ru-RU")} ₽</p>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Ваша сумма, ₽
          <input
            type="number"
            min={1}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <label className="mt-3 block text-sm font-medium text-slate-700">
          Сообщение продавцу (необязательно)
          <textarea
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Например, готов забрать сегодня…"
          />
        </label>
        {err ? <p className="mt-2 text-sm text-rose-600">{err}</p> : null}
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button type="button" className={cn(buttonVariants({ variant: "outline", size: "md" }), "rounded-xl")} onClick={() => onOpenChange(false)}>
            Отмена
          </button>
          <button
            type="button"
            disabled={busy}
            className={cn(buttonVariants({ variant: "primary", size: "md" }), "rounded-xl")}
            onClick={() => void submit()}
          >
            {busy ? "Отправка…" : "Отправить"}
          </button>
        </div>
      </div>
    </div>
  );
}
