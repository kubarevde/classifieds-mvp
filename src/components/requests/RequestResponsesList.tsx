"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { RequestResponse } from "@/entities/requests/model";
import { formatRequestDate } from "@/components/requests/request-format";

type RequestResponsesListProps = {
  responses: RequestResponse[];
};

export function RequestResponsesList({ responses }: RequestResponsesListProps) {
  const [sortBy, setSortBy] = useState<"relevance" | "recent" | "price">("relevance");
  const sortedResponses = useMemo(() => {
    return [...responses].sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "price") {
        return (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER);
      }
      const scoreA =
        (a.canMeetBudget ? 35 : 0) + (a.listingId ? 30 : 0) + (a.storeId ? 20 : 0) + (a.trustScore ?? 0) / 5;
      const scoreB =
        (b.canMeetBudget ? 35 : 0) + (b.listingId ? 30 : 0) + (b.storeId ? 20 : 0) + (b.trustScore ?? 0) / 5;
      return scoreB - scoreA || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [responses, sortBy]);

  if (responses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        Пока нет откликов. Когда продавцы ответят, они появятся здесь.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
        <span className="font-medium text-slate-600">Сортировка откликов</span>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs"
        >
          <option value="relevance">По релевантности</option>
          <option value="recent">Сначала новые</option>
          <option value="price">По цене</option>
        </select>
      </div>
      {sortedResponses.map((response) => (
        <article key={response.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-slate-900">
              {response.storeName ?? response.sellerName}
              {typeof response.trustScore === "number" ? (
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  Trust {response.trustScore}
                </span>
              ) : null}
            </h4>
            <span className="text-xs text-slate-500">{formatRequestDate(response.createdAt)}</span>
          </div>
          <p className="mt-2 text-sm text-slate-700">{response.message}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            {typeof response.price === "number" ? (
              <span className="rounded-full border border-slate-200 px-2 py-1">
                {new Intl.NumberFormat("ru-RU").format(response.price)} ₽
              </span>
            ) : null}
            <span className="rounded-full border border-slate-200 px-2 py-1">
              {response.canMeetBudget ? "В бюджете" : "Выше бюджета"}
            </span>
            {response.listingId ? <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">Есть объявление</span> : null}
            {response.storeId ? <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-sky-700">Ответ магазина</span> : null}
            {response.storeId ? (
              <Link href={`/sellers/${response.storeId}`} className="font-medium text-slate-700 hover:text-slate-900">
                Витрина продавца
              </Link>
            ) : null}
            {response.listingId ? (
              <Link href={`/listings/${response.listingId}`} className="font-medium text-slate-700 hover:text-slate-900">
                Предложенное объявление
              </Link>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

