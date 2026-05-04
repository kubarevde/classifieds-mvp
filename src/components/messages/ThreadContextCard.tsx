"use client";

import Link from "next/link";

import type { MessageContext, MessageThread } from "@/services/messages";

function contextHref(thread: MessageThread, ctx: MessageContext): string | null {
  if (ctx.entityType === "listing") return `/listings/${encodeURIComponent(ctx.entityId)}`;
  if (ctx.entityType === "request") return `/requests/${encodeURIComponent(ctx.entityId)}`;
  if (ctx.entityType === "store") return `/stores/${encodeURIComponent(ctx.entityId)}`;
  if (ctx.entityType === "support_ticket") return `/support/tickets/${encodeURIComponent(ctx.entityId)}`;
  return null;
}

export function ThreadContextCard({
  thread,
  context,
  loading,
}: {
  thread: MessageThread;
  context: MessageContext | null;
  loading?: boolean;
}) {
  if (thread.type === "support" && !context && !loading) {
    return (
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Поддержка Classify</p>
        <p className="mt-1 text-xs text-slate-600">Тикет: {thread.contextEntityId}</p>
        <Link href={`/support/tickets/${encodeURIComponent(thread.contextEntityId)}`} className="mt-2 inline-flex text-xs font-semibold text-sky-800 hover:underline">
          Открыть обращение
        </Link>
      </div>
    );
  }

  if (loading || !context) {
    return (
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
        {loading ? "Загрузка контекста…" : "Контекст недоступен"}
      </div>
    );
  }

  const href = contextHref(thread, context);

  return (
    <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
      <div className="flex gap-3">
        {context.imageUrl ? (
          <div className="shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={context.imageUrl} alt="" className="h-14 w-14 object-cover" />
          </div>
        ) : (
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-500">
            {context.entityType === "listing" ? "Лот" : context.entityType === "request" ? "Запр." : "Маг."}
          </div>
        )}
        <div className="min-w-0 flex-1 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {context.entityType === "listing"
              ? "Объявление"
              : context.entityType === "request"
                ? "Запрос покупателя"
                : context.entityType === "store"
                  ? "Магазин"
                  : "Поддержка"}
          </p>
          <p className="mt-0.5 line-clamp-2 font-semibold text-slate-900">{context.title}</p>
          {context.price ? <p className="mt-1 text-xs text-slate-600">{context.price}</p> : null}
          {context.status ? <p className="mt-0.5 text-[11px] text-slate-500">Статус: {context.status}</p> : null}
          {href ? (
            <Link href={href} className="mt-2 inline-flex text-xs font-semibold text-sky-800 hover:underline">
              Перейти к карточке
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
