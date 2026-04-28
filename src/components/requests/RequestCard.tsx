"use client";

import Link from "next/link";
import { MessageSquare, MapPin, Sparkles } from "lucide-react";

import type { BuyerRequest } from "@/entities/requests/model";
import type { RequestMatchResult } from "@/services/requests/matching";

import {
  formatRequestBudget,
  formatRequestDate,
  getRequestCategoryLabel,
  getRequestUrgencyLabel,
  getRequestWorldLabel,
} from "./request-format";

type RequestCardProps = {
  request: BuyerRequest;
  role: "buyer" | "seller" | "neutral";
  match?: RequestMatchResult;
};

function statusTone(status: BuyerRequest["status"]) {
  if (status === "fulfilled") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "cancelled") return "border-slate-200 bg-slate-100 text-slate-600";
  if (status === "expired") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-white text-slate-600";
}

export function RequestCard({ request, role, match }: RequestCardProps) {
  const detailsHref = `/requests/${request.id}`;
  const isClosed = request.status !== "active";
  const actionLabel =
    role === "seller" ? (isClosed ? "Запрос закрыт" : "Откликнуться") : role === "buyer" ? "Смотреть отклики" : "Подробнее";
  const fitLabel =
    match?.fitLevel === "high" ? "Высокое совпадение" : match?.fitLevel === "medium" ? "Подходит" : "Частично подходит";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
          {getRequestWorldLabel(request.worldId)}
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-600">
          {getRequestCategoryLabel(request.categoryId)}
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-600">
          {getRequestUrgencyLabel(request.urgency)}
        </span>
        <span className={`rounded-full border px-2.5 py-1 font-medium ${statusTone(request.status)}`}>{request.status}</span>
      </div>

      <h3 className="mt-3 text-base font-semibold text-slate-900 sm:text-lg">{request.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{request.description}</p>

      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <dt className="text-xs text-slate-500">Бюджет</dt>
          <dd className="font-semibold text-slate-800">{formatRequestBudget(request)}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <dt className="text-xs text-slate-500">Локация</dt>
          <dd className="inline-flex items-center gap-1 font-semibold text-slate-800">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} /> {request.location}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>Опубликовано: {formatRequestDate(request.createdAt)}</span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} /> {request.responseCount} откликов
        </span>
        <span>{request.viewCount} просмотров</span>
      </div>

      {role === "seller" && match ? (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Почему вам подходит</p>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">{fitLabel}</p>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-700">
              Match {match.matchScore}
            </span>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {match.matchReasons.map((reason) => (
              <li key={reason}>• {reason}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between">
        {isClosed && role === "seller" ? (
          <span className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-200 px-3.5 text-sm font-semibold text-slate-500">
            {actionLabel}
          </span>
        ) : (
          <Link
            href={detailsHref}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-3.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {actionLabel}
          </Link>
        )}
        <div className="flex items-center gap-2">
          {role === "seller" && match?.relevantListingIds.length ? (
            <Link
              href={detailsHref}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
              Предложить объявление
            </Link>
          ) : null}
          {role === "seller" && !match?.relevantListingIds.length ? (
            <Link href="/create-listing" className="text-xs font-medium text-slate-500 hover:text-slate-700">
              Создать объявление под запрос
            </Link>
          ) : null}
          {request.searchIntent ? (
            <Link
              href={`/listings?q=${encodeURIComponent(request.searchIntent.rawQuery)}&category=${request.categoryId}&location=${encodeURIComponent(request.location)}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
              Похожие объявления
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

