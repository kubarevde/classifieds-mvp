"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
import { buildListingsHrefFromIntent } from "@/lib/saved-searches";
import { mockBuyerRequestsService } from "@/services/requests";
import { buildRecreateRequestHrefFromBuyerRequest, buyerRequestToSearchIntent } from "@/services/requests/intent-adapter";
import { cn } from "@/components/ui/cn";
import { buttonVariants } from "@/lib/button-styles";
import { resolvePrimaryActorId } from "@/lib/messages-actors";
import { messagesService } from "@/services/messages";
import { getStorefrontSellerById } from "@/lib/sellers";
import { ReportAbuseButton } from "@/components/safety/ReportAbuseButton";
import { detectRequestRisk } from "@/services/risk";
import { RiskWarningBanner } from "@/components/risk/RiskWarningBanner";
import { TransactionSafetyChecklist } from "@/components/risk/TransactionSafetyChecklist";

type RequestDetailsClientProps = {
  request: BuyerRequest;
  initialResponses: RequestResponse[];
};

export function RequestDetailsClient({ request, initialResponses }: RequestDetailsClientProps) {
  const router = useRouter();
  const { role, currentSellerId } = useDemoRole();
  const [currentRequest, setCurrentRequest] = useState(request);
  const [responses, setResponses] = useState(initialResponses);
  const currentUserId = "buyer-dmitriy";
  const isAuthor = (role === "buyer" || role === "all") && currentRequest.authorId === currentUserId;
  const canRespond = (role === "seller" || role === "all") && currentRequest.status === "active";
  const intent = buyerRequestToSearchIntent(currentRequest);
  const seller = currentSellerId ? getStorefrontSellerById(currentSellerId) : null;
  const listingsHref = buildListingsHrefFromIntent(intent);
  const similarRequestHref = buildRecreateRequestHrefFromBuyerRequest(currentRequest);
  const requestRisk = detectRequestRisk({
    categoryId: currentRequest.categoryId,
    title: currentRequest.title,
    description: currentRequest.description,
    budget: currentRequest.budget,
  }).find((s) => s.level === "high" || s.level === "medium");

  const authorStatusActions = (
    <>
      <button
        type="button"
        onClick={async () => {
          const updated = await mockBuyerRequestsService.updateBuyerRequestStatus(currentRequest.id, "fulfilled");
          if (updated) setCurrentRequest(updated);
        }}
        className={cn(
          buttonVariants({ variant: "secondary", size: "md" }),
          "w-full justify-center border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 sm:w-auto",
        )}
      >
        Завершить
      </button>
      <button
        type="button"
        onClick={async () => {
          const updated = await mockBuyerRequestsService.updateBuyerRequestStatus(currentRequest.id, "cancelled");
          if (updated) setCurrentRequest(updated);
        }}
        className={cn(buttonVariants({ variant: "outline", size: "md" }), "w-full justify-center sm:w-auto")}
      >
        Закрыть
      </button>
    </>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-none sm:p-5">
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
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{currentRequest.title}</h1>
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

        {requestRisk ? (
          <RiskWarningBanner
            signal={requestRisk}
            ctaHref="/safety"
            ctaLabel="Рекомендации по безопасности"
          />
        ) : null}
        <p className="rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2 text-xs leading-relaxed text-amber-950 sm:text-sm">
          Не отправляйте предоплату без проверки условий сделки и не публикуйте лишние персональные данные.
        </p>
        <TransactionSafetyChecklist variant="compact" />
        <div className="flex flex-wrap justify-end gap-2">
          <ReportAbuseButton
            targetType="request"
            targetId={currentRequest.id}
            targetLabel={currentRequest.title}
            variant="outline"
            className="text-sm"
          />
        </div>

        {canRespond ? (
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 lg:hidden">
            <p className="text-sm font-medium text-slate-800">Вы продаёте</p>
            <p className="mt-1 text-xs text-slate-600">Отклик оформляется ниже: текст, цена, привязка к объявлению.</p>
            <div className="mt-3 flex flex-col gap-2">
              <a
                href="#request-respond"
                className={cn(buttonVariants({ variant: "primary", size: "md" }), "w-full justify-center rounded-xl")}
              >
                Предложить объявление
              </a>
              <Link
                href="#"
                onClick={async (event) => {
                  event.preventDefault();
                  const starterId = resolvePrimaryActorId(role, currentSellerId);
                  const otherUserId = currentRequest.authorId;
                  const thread = await messagesService.createThread({
                    starterId,
                    otherUserId,
                    requestId: currentRequest.id,
                    storeId: currentSellerId ?? undefined,
                  });
                  router.push(`/messages/${encodeURIComponent(thread.id)}`);
                }}
                className={cn(buttonVariants({ variant: "outline", size: "md" }), "w-full justify-center rounded-xl")}
              >
                Написать автору
              </Link>
            </div>
          </div>
        ) : null}

        {isAuthor && currentRequest.status === "active" ? (
          <>
            <details className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-3 sm:hidden">
              <summary className="cursor-pointer text-sm font-semibold text-slate-800">Действия с запросом</summary>
              <div className="mt-3 flex flex-col gap-2 border-t border-slate-200/80 pt-3">{authorStatusActions}</div>
            </details>
            <div className="hidden flex-wrap gap-2 sm:flex">{authorStatusActions}</div>
          </>
        ) : null}
        {isAuthor && currentRequest.status !== "active" ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            Запрос закрыт. Можно открыть каталог или создать новый запрос с теми же параметрами.
          </div>
        ) : null}

        <div className="space-y-2 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Связь с поиском и доской</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link
              href={listingsHref}
              className={cn(buttonVariants({ variant: "primary", size: "md" }), "w-full justify-center rounded-xl sm:w-auto")}
            >
              Открыть каталог
            </Link>
            <Link
              href={similarRequestHref}
              className={cn(buttonVariants({ variant: "secondary", size: "md" }), "w-full justify-center rounded-xl sm:w-auto")}
            >
              Новый запрос как этот
            </Link>
            <Link
              href="/requests"
              className={cn(buttonVariants({ variant: "outline", size: "md" }), "w-full justify-center rounded-xl sm:w-auto")}
            >
              К доске запросов
            </Link>
          </div>
          {isAuthor ? <p className="text-xs text-slate-500">Поля нового запроса заполнятся из этого обращения.</p> : null}
        </div>
      </section>

      <aside className="space-y-4">
        {canRespond ? (
          <div id="request-respond" className="scroll-mt-28">
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
          </div>
        ) : null}
        {isAuthor ? (
          <section className="space-y-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-none">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Отклики ({responses.length})</h2>
            <RequestResponsesList responses={responses} />
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200/90 bg-white p-4 text-sm text-slate-600 shadow-none">
            Отклики видит автор. Как продавец — оформите отклик в форме выше или перейдите в сообщения.
          </section>
        )}
      </aside>
    </div>
  );
}
