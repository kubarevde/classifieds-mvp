"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemoRole } from "@/components/demo-role/demo-role";
import { RequestResponseComposer } from "@/components/requests/RequestResponseComposer";
import { RequestResponsesList } from "@/components/requests/RequestResponsesList";
import {
  formatRequestBudget,
  formatRequestDate,
  getRequestCategoryLabel,
  getRequestConditionLabel,
  getRequestUrgencyLabel,
  getRequestWorldLabel,
} from "@/components/requests/request-format";
import type { BuyerRequest, RequestResponse } from "@/entities/requests/model";
import { mockBuyerRequestsService } from "@/services/requests";
import { buyerRequestToSearchIntent } from "@/services/requests/intent-adapter";
import { getStorefrontSellerById } from "@/lib/sellers";

type RequestDetailsClientProps = {
  request: BuyerRequest;
  initialResponses: RequestResponse[];
};

export function RequestDetailsClient({ request, initialResponses }: RequestDetailsClientProps) {
  const { role, currentSellerId } = useDemoRole();
  const [currentRequest, setCurrentRequest] = useState(request);
  const [responses, setResponses] = useState(initialResponses);
  const currentUserId = "buyer-dmitriy";
  const isAuthor = (role === "buyer" || role === "all") && currentRequest.authorId === currentUserId;
  const canRespond = (role === "seller" || role === "all") && currentRequest.status === "active";
  const intent = buyerRequestToSearchIntent(currentRequest);
  const seller = currentSellerId ? getStorefrontSellerById(currentSellerId) : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
            {getRequestWorldLabel(request.worldId)}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-600">
            {getRequestCategoryLabel(currentRequest.categoryId)}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-600">
            {getRequestUrgencyLabel(currentRequest.urgency)}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-600">
            {currentRequest.status}
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{currentRequest.title}</h1>
        <p className="text-sm text-slate-600">{currentRequest.description}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-xs text-slate-500">Бюджет</p>
            <p className="font-semibold text-slate-900">{formatRequestBudget(currentRequest)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-xs text-slate-500">Локация</p>
            <p className="font-semibold text-slate-900">{currentRequest.location}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-xs text-slate-500">Состояние</p>
            <p className="font-semibold text-slate-900">{getRequestConditionLabel(currentRequest.condition)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-xs text-slate-500">Опубликовано</p>
            <p className="font-semibold text-slate-900">{formatRequestDate(currentRequest.createdAt)}</p>
          </div>
        </div>
        {currentRequest.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {currentRequest.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
        {isAuthor && currentRequest.status === "active" ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Статус запроса</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={async () => {
                  const updated = await mockBuyerRequestsService.updateBuyerRequestStatus(currentRequest.id, "fulfilled");
                  if (updated) setCurrentRequest(updated);
                }}
                className="inline-flex h-8 items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700"
              >
                Отметить выполненным
              </button>
              <button
                type="button"
                onClick={async () => {
                  const updated = await mockBuyerRequestsService.updateBuyerRequestStatus(currentRequest.id, "cancelled");
                  if (updated) setCurrentRequest(updated);
                }}
                className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600"
              >
                Больше не актуально
              </button>
            </div>
          </div>
        ) : null}
        {isAuthor && currentRequest.status !== "active" ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            Запрос закрыт. Дальше можно открыть похожие объявления, перейти в магазин откликнувшегося продавца или создать новый запрос.
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/listings?q=${encodeURIComponent(intent.rawQuery)}&category=${currentRequest.categoryId}&location=${encodeURIComponent(currentRequest.location)}`}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Открыть релевантные объявления
          </Link>
          <Link
            href="/requests/new"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Разместить запрос о покупке
          </Link>
          <Link
            href="/requests"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Назад к запросам
          </Link>
        </div>
      </section>

      <aside className="space-y-4">
        {canRespond ? (
          <RequestResponseComposer
            request={currentRequest}
            sellerId={currentSellerId ?? "agro-tech"}
            sellerName={seller?.displayName ?? "Продавец"}
            storeId={currentSellerId ?? undefined}
            storeName={seller?.storefrontName ?? undefined}
            onSubmit={async (input) => {
              const created = await mockBuyerRequestsService.respondToBuyerRequest(input);
              setResponses((prev) => [created, ...prev]);
            }}
          />
        ) : null}
        {isAuthor ? (
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Отклики продавцов ({responses.length})</h2>
            <RequestResponsesList responses={responses} />
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            Отклики видит автор запроса. Для продавца доступна форма ответа и переход в витрины конкурентов.
          </section>
        )}
      </aside>
    </div>
  );
}

