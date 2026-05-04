"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";
import { MessageComposer } from "@/components/messages/message-composer";
import { dealsService, type Offer } from "@/services/deals";
import { messagesService, type MessageThread } from "@/services/messages";

export function StoreDashboardInboxSection({ sellerId }: { sellerId: string }) {
  const actorId = `seller-account:${sellerId}`;
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [quickThreadId, setQuickThreadId] = useState<string | null>(null);
  const [offersTick, setOffersTick] = useState(0);

  const refresh = useCallback(() => {
    void Promise.all([messagesService.getMyThreads(actorId), messagesService.getUnreadCount(actorId)]).then(([rows, unread]) => {
      setThreads(rows.slice(0, 5));
      setUnreadTotal(unread);
      setQuickThreadId(rows.find((t) => t.unreadCount > 0)?.id ?? rows[0]?.id ?? null);
    });
  }, [actorId]);

  useEffect(() => {
    refresh();
  }, [refresh, offersTick]);

  function findPendingOfferForThread(thread: MessageThread): Offer | undefined {
    if (!thread.listingId) return undefined;
    return dealsService
      .getOffersForListing(thread.listingId)
      .find(
        (o) =>
          o.sellerId === actorId &&
          thread.participantIds.includes(o.buyerId) &&
          (o.status === "pending" || o.status === "countered"),
      );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Входящие</h2>
          <p className="text-sm text-slate-600">Последние диалоги и быстрый ответ без перехода на полный экран.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-slate-500">Непрочитано</p>
          <p className="text-lg font-semibold tabular-nums text-slate-900">{unreadTotal}</p>
        </div>
        <Link
          href={`/dashboard/store?sellerId=${encodeURIComponent(sellerId)}&section=messages`}
          className="inline-flex rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Все сообщения
        </Link>
      </div>
      {threads.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Диалогов пока нет.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {threads.map((thread) => {
            const pending = findPendingOfferForThread(thread);
            return (
              <li key={thread.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/messages?thread=${encodeURIComponent(thread.id)}&actor=store`}
                    className="line-clamp-1 flex-1 text-sm font-semibold text-slate-900 hover:underline"
                  >
                    {thread.lastMessage}
                  </Link>
                  {pending ? (
                    <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-800">
                      Новое предложение
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{new Date(thread.lastMessageAt).toLocaleString("ru-RU")}</span>
                  {thread.unreadCount > 0 ? (
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">{thread.unreadCount}</span>
                  ) : null}
                </div>
                {pending ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: "primary", size: "sm" }), "rounded-lg")}
                      onClick={() => {
                        void dealsService.acceptOffer(pending.id, actorId).then(() => {
                          setOffersTick((n) => n + 1);
                          refresh();
                        });
                      }}
                    >
                      Принять
                    </button>
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-lg")}
                      onClick={() => {
                        void dealsService.declineOffer(pending.id, actorId).then(() => {
                          setOffersTick((n) => n + 1);
                          refresh();
                        });
                      }}
                    >
                      Отклонить
                    </button>
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "rounded-lg")}
                      onClick={() => {
                        const raw = typeof window !== "undefined" ? window.prompt("Встречная сумма, ₽", String(pending.counterAmount ?? pending.amount)) : null;
                        const n = raw != null ? Number(raw) : NaN;
                        if (!Number.isFinite(n) || n <= 0) return;
                        void dealsService.counterOffer(pending.id, actorId, n).then(() => {
                          setOffersTick((x) => x + 1);
                          refresh();
                        });
                      }}
                    >
                      Встречное
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      {quickThreadId ? (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Быстрый ответ</p>
          <MessageComposer
            role="store_owner"
            suggestMode="chips"
            placeholder="Напишите покупателю из кабинета…"
            onSend={async (input) => {
              await messagesService.sendMessage({
                threadId: quickThreadId,
                senderId: actorId,
                senderRole: "store_owner",
                content: input.content,
                attachments: input.attachments,
              });
              refresh();
            }}
          />
        </div>
      ) : null}
    </section>
  );
}
