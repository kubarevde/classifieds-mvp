"use client";

import Link from "next/link";

import { cn } from "@/components/ui/cn";
import type { BuyerRequest } from "@/entities/requests/model";
import { buttonVariants } from "@/lib/button-styles";
import { formatRequestBudget, formatRequestDate, getRequestUrgencyLabel } from "@/components/requests/request-format";
import { REQUESTS_NEW_PATH } from "@/services/requests/intent-adapter";

type MyRequestsSectionProps = {
  requests: BuyerRequest[];
  onMarkFulfilled: (id: string) => void;
  onCancel: (id: string) => void;
};

function statusTone(status: BuyerRequest["status"]) {
  if (status === "fulfilled") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "cancelled") return "border-slate-200 bg-slate-100 text-slate-600";
  if (status === "expired") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-sky-200 bg-sky-50 text-sky-700";
}

function statusLabel(status: BuyerRequest["status"]) {
  if (status === "fulfilled") return "Выполнен";
  if (status === "cancelled") return "Закрыт";
  if (status === "expired") return "Истёк";
  return "Активен";
}

export function MyRequestsSection({ requests, onMarkFulfilled, onCancel }: MyRequestsSectionProps) {
  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-sky-50/80 to-white p-4 shadow-none sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Мои запросы на покупку</h2>
            <p className="text-sm text-slate-600">
              Тот же контур, что и публичная доска: отсюда — к карточке запроса и откликам. Доска — для обзора всего спроса.
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
            <Link
              href={REQUESTS_NEW_PATH}
              className={cn(buttonVariants({ variant: "primary", size: "md" }), "justify-center rounded-xl")}
            >
              Создать запрос
            </Link>
            <Link
              href="/requests"
              className={cn(buttonVariants({ variant: "secondary", size: "md" }), "justify-center rounded-xl")}
            >
              Доска запросов
            </Link>
          </div>
        </div>
      </header>

      {requests.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-base font-semibold text-slate-900">У вас пока нет запросов</p>
          <p className="mt-2 text-sm text-slate-600">Опубликуйте запрос — продавцы пришлют релевантные отклики на доске.</p>
          <div className="mt-4">
            <Link
              href={REQUESTS_NEW_PATH}
              className={cn(buttonVariants({ variant: "primary", size: "md" }), "inline-flex justify-center rounded-xl")}
            >
              Создать запрос
            </Link>
          </div>
        </section>
      ) : (
        <section className="space-y-3">
          {requests.map((request) => {
            const isActive = request.status === "active";
            return (
              <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="min-w-0 text-base font-semibold text-slate-900">{request.title}</h3>
                  <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(request.status)}`}>
                    {statusLabel(request.status)}
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{request.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                  <span>Бюджет: {formatRequestBudget(request)}</span>
                  <span className="hidden sm:inline">·</span>
                  <span>{request.location}</span>
                  <span className="hidden sm:inline">·</span>
                  <span>{getRequestUrgencyLabel(request.urgency)}</span>
                  <span className="hidden sm:inline">·</span>
                  <span>{formatRequestDate(request.createdAt)}</span>
                  <span className="hidden sm:inline">·</span>
                  <span>{request.responseCount} откликов</span>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <Link
                    href={`/requests/${request.id}`}
                    className={cn(buttonVariants({ variant: "primary", size: "md" }), "w-full justify-center rounded-xl sm:w-auto")}
                  >
                    Открыть запрос и отклики
                  </Link>
                  <Link
                    href="/requests"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "md" }),
                      "w-full justify-center rounded-xl border-slate-200 sm:w-auto",
                    )}
                  >
                    На доску
                  </Link>
                  {isActive ? (
                    <div className="flex w-full flex-col gap-2 border-t border-slate-100 pt-3 sm:ml-auto sm:w-auto sm:flex-row sm:border-0 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => onMarkFulfilled(request.id)}
                        className={cn(
                          buttonVariants({ variant: "secondary", size: "md" }),
                          "justify-center rounded-xl border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100",
                        )}
                      >
                        Завершить
                      </button>
                      <button
                        type="button"
                        onClick={() => onCancel(request.id)}
                        className={cn(buttonVariants({ variant: "ghost", size: "md" }), "justify-center rounded-xl text-slate-600")}
                      >
                        Закрыть
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
