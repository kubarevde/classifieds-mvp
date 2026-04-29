"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { cn } from "@/components/ui/cn";
import { buttonVariants } from "@/lib/button-styles";
import type { BuyerRequest } from "@/entities/requests/model";
import { unifiedCatalogListings } from "@/lib/listings.data";
import { getStorefrontSellerById } from "@/lib/sellers";
import { detectMessageRisk } from "@/services/risk";
import { ScamPatternNotice } from "@/components/risk/ScamPatternNotice";

type RequestResponseComposerProps = {
  request: BuyerRequest;
  sellerId: string;
  sellerName: string;
  storeId?: string;
  storeName?: string;
  onSubmit: (input: {
    requestId: string;
    sellerId: string;
    sellerName: string;
    storeId?: string;
    storeName?: string;
    listingId?: string;
    message: string;
    price?: number;
    canMeetBudget: boolean;
  }) => Promise<void> | void;
};

export function RequestResponseComposer({
  request,
  sellerId,
  sellerName,
  storeId,
  storeName,
  onSubmit,
}: RequestResponseComposerProps) {
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState("");
  const [listingId, setListingId] = useState("");
  const [canMeetBudget, setCanMeetBudget] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const seller = getStorefrontSellerById(sellerId);
  const sellerListingIds = new Set(
    (seller?.listingRefs ?? []).filter((item) => item.status === "active").map((item) => item.listingId),
  );
  const requestKeywords = `${request.title} ${request.description} ${request.tags.join(" ")}`.toLowerCase();
  const attachableListings = unifiedCatalogListings
    .filter((listing) => sellerListingIds.has(listing.id))
    .filter((listing) => {
      const text = `${listing.title} ${listing.description} ${listing.categoryId}`.toLowerCase();
      return listing.categoryId === request.categoryId || requestKeywords.split(/\s+/).some((word) => text.includes(word));
    });
  const messageRiskSignals = detectMessageRisk(message);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    await onSubmit({
      requestId: request.id,
      sellerId,
      sellerName,
      storeId,
      storeName,
      listingId: listingId || undefined,
      message: message.trim(),
      price: price ? Number(price) : undefined,
      canMeetBudget,
    });
    setMessage("");
    setPrice("");
    setListingId("");
    setCanMeetBudget(true);
    setIsSending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-base font-semibold text-slate-900">Отклик продавца</h3>
      <ol className="space-y-1 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
        <li>1. Опишите отклик и условия.</li>
        <li>2. Прикрепите существующее объявление (если есть).</li>
        <li>3. Укажите цену и отметьте бюджет.</li>
      </ol>
      <textarea
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="min-h-[110px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        placeholder="Опишите отклик, сроки и условия"
      />
      <ScamPatternNotice signals={messageRiskSignals} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="h-11 min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
          placeholder="Цена в отклике"
        />
        <select
          value={listingId}
          onChange={(e) => setListingId(e.target.value)}
          className="h-11 min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
        >
          <option value="">Без привязки объявления</option>
          {attachableListings.map((listing) => (
            <option key={listing.id} value={listing.id}>
              {listing.title}
            </option>
          ))}
        </select>
      </div>
      {attachableListings.length === 0 ? (
        <p className="text-xs text-slate-500">
          Подходящих активных объявлений не найдено. Можно отправить отклик без привязки и позже подготовить карточку товара.
        </p>
      ) : (
        <p className="text-xs text-slate-500">Найдено релевантных объявлений для привязки: {attachableListings.length}.</p>
      )}
      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={canMeetBudget}
          onChange={(e) => setCanMeetBudget(e.target.checked)}
        />
        Укладываемся в бюджет покупателя
      </label>
      <button
        type="submit"
        disabled={isSending}
        className={cn(
          buttonVariants({ variant: "primary", size: "md" }),
          "justify-center disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {isSending ? "Отправляем..." : "Отправить отклик"}
      </button>
      {attachableListings.length === 0 ? (
        <Link href="/create-listing" className="inline-flex min-h-11 items-center text-sm font-medium text-slate-600 hover:text-slate-900">
          Создать новое объявление под запрос
        </Link>
      ) : null}
    </form>
  );
}

