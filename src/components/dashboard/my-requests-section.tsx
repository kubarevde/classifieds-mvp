"use client";

import Link from "next/link";

import type { BuyerRequest } from "@/entities/requests/model";
import { formatRequestBudget, formatRequestDate, getRequestUrgencyLabel } from "@/components/requests/request-format";

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

export function MyRequestsSection({ requests, onMarkFulfilled, onCancel }: MyRequestsSectionProps) {
  if (requests.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-base font-semibold text-slate-900">У вас пока нет запросов о покупке</p>
        <p className="mt-2 text-sm text-slate-600">Опубликуйте запрос, и продавцы пришлют релевантные предложения с откликами.</p>
        <div className="mt-4">
          <Link
            href="/requests/new"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 px-4 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
          >
            Разместить запрос о покупке
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {requests.map((request) => {
        const isActive = request.status === "active";
        return (
          <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-900">{request.title}</h3>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(request.status)}`}>
                {request.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{request.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Бюджет: {formatRequestBudget(request)}</span>
              <span>·</span>
              <span>{request.location}</span>
              <span>·</span>
              <span>{getRequestUrgencyLabel(request.urgency)}</span>
              <span>·</span>
              <span>{formatRequestDate(request.createdAt)}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                href={`/requests/${request.id}`}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Смотреть отклики
              </Link>
              <Link
                href={`/requests/${request.id}`}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Редактировать
              </Link>
              {isActive ? (
                <>
                  <button
                    type="button"
                    onClick={() => onMarkFulfilled(request.id)}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    Отметить выполненным
                  </button>
                  <button
                    type="button"
                    onClick={() => onCancel(request.id)}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Закрыть запрос
                  </button>
                </>
              ) : null}
              <Link href="/requests/new" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Разместить запрос о покупке
              </Link>
              <Link href="/requests" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Открыть доску запросов
              </Link>
            </div>
          </article>
        );
      })}
    </section>
  );
}

