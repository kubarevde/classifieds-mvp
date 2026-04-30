"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { MessageBubble } from "@/components/messages/message-bubble";
import { MessageComposer } from "@/components/messages/message-composer";
import { formatPresence } from "@/components/messages/message-presence";
import { roleByActorId } from "@/lib/messages-actors";
import { mockListingsService } from "@/services/listings";
import { messagesService, type Message, type MessageParticipant, type MessageThread } from "@/services/messages";
import { getBuyerRequestById } from "@/services/requests";
import { getStorefrontSellerById } from "@/services/sellers/seller-data";

type Props = {
  actorIds: string[];
  title: string;
  subtitle: string;
  fullscreenHref: string;
  backHref?: string;
  backLabel?: string;
  isSellerWorkspace?: boolean;
  selectedThreadId?: string | null;
  onSelectedThreadChange?: (threadId: string | null) => void;
  emptyCtaHref?: string;
};

function formatLastAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export function MessagesSplitView({
  actorIds,
  title,
  subtitle,
  fullscreenHref,
  backHref,
  backLabel,
  isSellerWorkspace = false,
  selectedThreadId = null,
  onSelectedThreadChange,
  emptyCtaHref = "/listings",
}: Props) {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [participants, setParticipants] = useState<Record<string, MessageParticipant>>({});
  const [listingTitles, setListingTitles] = useState<Record<string, string>>({});
  const [requestTitles, setRequestTitles] = useState<Record<string, string>>({});
  const [storeNames, setStoreNames] = useState<Record<string, string>>({});
  const [localActiveThreadId, setLocalActiveThreadId] = useState<string | null>(selectedThreadId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");
  const feedRef = useRef<HTMLDivElement | null>(null);

  const activeThreadId = selectedThreadId ?? localActiveThreadId;

  useEffect(() => {
    let alive = true;
    async function loadInbox() {
      if (actorIds.length === 0) {
        if (!alive) return;
        setThreads([]);
        return;
      }
      const groups = await Promise.all(actorIds.map((id) => messagesService.getMyThreads(id)));
      if (!alive) return;
      const merged = [...groups.flat()].sort((a, b) => {
        if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
        return +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt);
      });
      const unique = Array.from(new Map(merged.map((t) => [t.id, t])).values());
      setThreads(unique);

      if (!(selectedThreadId ?? localActiveThreadId) && unique.length > 0) {
        const firstId = unique[0]?.id ?? null;
        setLocalActiveThreadId(firstId);
        onSelectedThreadChange?.(firstId);
      }

      const counterpartyIds = new Set<string>();
      for (const thread of unique) {
        const me = thread.participantIds.find((id) => actorIds.includes(id)) ?? actorIds[0];
        const other = thread.participantIds.find((id) => id !== me);
        if (other) counterpartyIds.add(other);
      }
      const people = await Promise.all([...counterpartyIds].map((id) => messagesService.getParticipant(id)));
      if (!alive) return;
      const nextPeople: Record<string, MessageParticipant> = {};
      for (const p of people) {
        if (p) nextPeople[p.userId] = p;
      }
      setParticipants(nextPeople);

      const listingEntries = await Promise.all(
        [...new Set(unique.map((t) => t.listingId).filter(Boolean))].map(async (id) => [id, (await mockListingsService.getById(String(id)))?.title] as const),
      );
      const reqEntries = await Promise.all(
        [...new Set(unique.map((t) => t.requestId).filter(Boolean))].map(async (id) => [id, (await getBuyerRequestById(String(id), { incrementView: false }))?.title] as const),
      );
      const storeEntries = [...new Set(unique.map((t) => t.storeId).filter(Boolean))].map((id) => [id, getStorefrontSellerById(String(id))?.storefrontName] as const);
      if (!alive) return;
      setListingTitles(Object.fromEntries(listingEntries.filter((x) => x[0] && x[1])) as Record<string, string>);
      setRequestTitles(Object.fromEntries(reqEntries.filter((x) => x[0] && x[1])) as Record<string, string>);
      setStoreNames(Object.fromEntries(storeEntries.filter((x) => x[0] && x[1])) as Record<string, string>);
    }
    queueMicrotask(() => {
      void loadInbox();
    });
    const onFocus = () => {
      void loadInbox();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void loadInbox();
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      alive = false;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [actorIds, localActiveThreadId, onSelectedThreadChange, selectedThreadId]);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? null,
    [threads, activeThreadId],
  );
  const activeActorId = useMemo(
    () => activeThread?.participantIds.find((id) => actorIds.includes(id)) ?? actorIds[0] ?? null,
    [activeThread, actorIds],
  );
  const activeCounterparty = useMemo(() => {
    if (!activeThread || !activeActorId) return null;
    const otherId = activeThread.participantIds.find((id) => id !== activeActorId);
    return otherId ? participants[otherId] ?? null : null;
  }, [activeActorId, activeThread, participants]);

  useEffect(() => {
    if (!activeThreadId || !activeActorId) {
      return;
    }
    const threadId = activeThreadId;
    const actorId = activeActorId;
    let alive = true;
    async function loadThread() {
      const rows = await messagesService.getMessages(threadId);
      if (!alive) return;
      setMessages(rows);
      await messagesService.markThreadRead(threadId, actorId);
      const groups = await Promise.all(actorIds.map((id) => messagesService.getMyThreads(id)));
      if (!alive) return;
      const merged = [...groups.flat()].sort((a, b) => +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt));
      const unique = Array.from(new Map(merged.map((t) => [t.id, t])).values());
      setThreads(unique);
    }
    void loadThread();
    return () => {
      alive = false;
    };
  }, [activeActorId, activeThreadId, actorIds]);

  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, activeThreadId]);

  const contextLabel = useMemo(() => {
    if (!activeThread) return null;
    if (activeThread.listingId) return `По объявлению: ${listingTitles[activeThread.listingId] ?? activeThread.listingId}`;
    if (activeThread.requestId) return `По запросу: ${requestTitles[activeThread.requestId] ?? activeThread.requestId}`;
    if (activeThread.storeId) return `По магазину: ${storeNames[activeThread.storeId] ?? activeThread.storeId}`;
    return null;
  }, [activeThread, listingTitles, requestTitles, storeNames]);
  const groupedThreads = useMemo(() => {
    if (!isSellerWorkspace) {
      return { needsReply: threads, rest: [] as MessageThread[] };
    }
    const needsReply = threads.filter((thread) => thread.unreadCount > 0 || thread.lastMessage.includes("Диалог создан"));
    const rest = threads.filter((thread) => !needsReply.some((item) => item.id === thread.id));
    return { needsReply, rest };
  }, [isSellerWorkspace, threads]);

  const replyStatusByThread = useMemo(() => {
    const map = new Map<string, "Новый лид" | "Ждёт ответа" | null>();
    for (const thread of threads) {
      if (isSellerWorkspace) {
        if (thread.lastMessage.includes("Диалог создан")) {
          map.set(thread.id, "Новый лид");
        } else if (thread.unreadCount > 0) {
          map.set(thread.id, "Ждёт ответа");
        } else {
          map.set(thread.id, null);
        }
      }
    }
    return map;
  }, [isSellerWorkspace, threads]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            {backHref && backLabel ? (
              <Link href={backHref} className="text-sm font-medium text-slate-600 hover:text-slate-900">
                ← {backLabel}
              </Link>
            ) : null}
            <Link href={fullscreenHref} className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Открыть на весь экран
            </Link>
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600">{subtitle}</p>
        </div>
      </div>

      <div className="grid min-h-[560px] gap-3 md:grid-cols-[320px_minmax(0,1fr)]">
        <aside className={`${mobileView === "thread" ? "hidden md:block" : "block"} overflow-hidden rounded-xl border border-slate-200`}>
          {threads.length === 0 ? (
            <div className="p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900">Диалогов пока нет</p>
              <p className="mt-1">Найдите объявление, чтобы начать диалог.</p>
              <Link href={emptyCtaHref} className="mt-3 inline-flex rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
                Перейти в каталог
              </Link>
            </div>
          ) : (
            <ul className="max-h-[560px] overflow-y-auto">
              {isSellerWorkspace && groupedThreads.needsReply.length > 0 ? <li className="sticky top-0 z-10 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Требуют ответа</li> : null}
              {(isSellerWorkspace ? groupedThreads.needsReply : threads).map((thread) => {
                const me = thread.participantIds.find((id) => actorIds.includes(id)) ?? actorIds[0];
                const otherId = thread.participantIds.find((id) => id !== me);
                const counterpart = otherId ? participants[otherId] : null;
                const selected = thread.id === activeThreadId;
                const contextChip = thread.listingId ? "Объявление" : thread.requestId ? "Запрос" : "Магазин";
                const sellerStatus = replyStatusByThread.get(thread.id);
                return (
                  <li key={thread.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setLocalActiveThreadId(thread.id);
                        onSelectedThreadChange?.(thread.id);
                        setMobileView("thread");
                      }}
                      className={`w-full border-b border-slate-100 px-3 py-3 text-left transition ${selected ? "bg-slate-100" : "hover:bg-slate-50"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                            <span className={`mr-1 inline-block h-2 w-2 rounded-full ${counterpart?.isOnline ? "bg-emerald-500" : "bg-slate-300"}`} />
                            {counterpart?.name ?? "Собеседник"}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">{formatPresence(counterpart ?? {})}</p>
                        </div>
                        {thread.unreadCount > 0 ? (
                          <span className="inline-flex rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white">{thread.unreadCount}</span>
                        ) : null}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600">{contextChip}</span>
                        {sellerStatus ? (
                          <span className={`rounded-full px-2 py-0.5 text-[11px] ${sellerStatus === "Новый лид" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {sellerStatus}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-600">
                        {thread.listingId ? `По объявлению: ${listingTitles[thread.listingId] ?? thread.listingId}` : thread.requestId ? `По запросу: ${requestTitles[thread.requestId] ?? thread.requestId}` : `По магазину: ${storeNames[thread.storeId ?? ""] ?? thread.storeId ?? "—"}`}
                      </p>
                      <p className="line-clamp-1 text-xs text-slate-500">{thread.lastMessage}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{formatLastAt(thread.lastMessageAt)}</p>
                    </button>
                  </li>
                );
              })}
              {isSellerWorkspace && groupedThreads.rest.length > 0 ? <li className="sticky top-0 z-10 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Остальные</li> : null}
              {isSellerWorkspace
                ? groupedThreads.rest.map((thread) => {
                    const me = thread.participantIds.find((id) => actorIds.includes(id)) ?? actorIds[0];
                    const otherId = thread.participantIds.find((id) => id !== me);
                    const counterpart = otherId ? participants[otherId] : null;
                    const selected = thread.id === activeThreadId;
                    const contextChip = thread.listingId ? "Объявление" : thread.requestId ? "Запрос" : "Магазин";
                    const sellerStatus = replyStatusByThread.get(thread.id);
                    return (
                      <li key={thread.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setLocalActiveThreadId(thread.id);
                            onSelectedThreadChange?.(thread.id);
                            setMobileView("thread");
                          }}
                          className={`w-full border-b border-slate-100 px-3 py-3 text-left transition ${selected ? "bg-slate-100" : "hover:bg-slate-50"}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                                <span className={`mr-1 inline-block h-2 w-2 rounded-full ${counterpart?.isOnline ? "bg-emerald-500" : "bg-slate-300"}`} />
                                {counterpart?.name ?? "Собеседник"}
                              </p>
                              <p className="mt-1 text-[11px] text-slate-500">{formatPresence(counterpart ?? {})}</p>
                            </div>
                            {thread.unreadCount > 0 ? (
                              <span className="inline-flex rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white">{thread.unreadCount}</span>
                            ) : null}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1">
                            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600">{contextChip}</span>
                            {sellerStatus ? (
                              <span className={`rounded-full px-2 py-0.5 text-[11px] ${sellerStatus === "Новый лид" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                {sellerStatus}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 line-clamp-1 text-xs text-slate-600">
                            {thread.listingId ? `По объявлению: ${listingTitles[thread.listingId] ?? thread.listingId}` : thread.requestId ? `По запросу: ${requestTitles[thread.requestId] ?? thread.requestId}` : `По магазину: ${storeNames[thread.storeId ?? ""] ?? thread.storeId ?? "—"}`}
                          </p>
                          <p className="line-clamp-1 text-xs text-slate-500">{thread.lastMessage}</p>
                          <p className="mt-1 text-[11px] text-slate-500">{formatLastAt(thread.lastMessageAt)}</p>
                        </button>
                      </li>
                    );
                  })
                : null}
            </ul>
          )}
        </aside>

        <article className={`${mobileView === "thread" ? "flex" : "hidden md:flex"} min-h-[560px] flex-col overflow-hidden rounded-xl border border-slate-200`}>
          {activeThread ? (
            <>
              <header className="border-b border-slate-100 px-4 py-3">
                <button type="button" onClick={() => setMobileView("list")} className="mb-2 inline-flex text-sm font-medium text-slate-600 md:hidden">
                  ← Диалоги
                </button>
                <p className="text-sm font-semibold text-slate-900">
                  <span className={`mr-1 inline-block h-2 w-2 rounded-full ${activeCounterparty?.isOnline ? "bg-emerald-500" : "bg-slate-300"}`} />
                  {activeCounterparty?.name ?? "Собеседник"}
                </p>
                <p className="text-xs text-slate-500">{formatPresence(activeCounterparty ?? {})}</p>
                {contextLabel ? <p className="mt-1 text-xs text-slate-500">{contextLabel}</p> : null}
                {(activeThread.listingId || activeThread.requestId || activeThread.storeId) ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activeThread.listingId ? <Link href={`/listings/${activeThread.listingId}`} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700">Открыть объявление</Link> : null}
                    {activeThread.requestId ? <Link href={`/requests/${activeThread.requestId}`} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700">Открыть запрос</Link> : null}
                    {activeThread.storeId ? <Link href={`/stores/${activeThread.storeId}`} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700">Открыть магазин</Link> : null}
                    <span className="rounded-lg border border-dashed border-slate-300 px-2 py-1 text-xs text-slate-500">Создать сделку — скоро</span>
                  </div>
                ) : null}
              </header>
              {isSellerWorkspace ? (
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-600">
                  Рабочий inbox продавца: сначала диалоги с непрочитанными и новыми лидами.
                </div>
              ) : (
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-600">
                  Общайтесь с продавцами по объявлениям, запросам и заказам.
                </div>
              )}
              <div ref={feedRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-4">
                {messages.map((message) => <MessageBubble key={message.id} message={message} mine={message.senderId === activeActorId} />)}
              </div>
              <MessageComposer
                role={roleByActorId(activeActorId)}
                suggestMode={isSellerWorkspace ? "chips" : "dropdown"}
                placeholder={isSellerWorkspace ? "Ответьте покупателю..." : "Введите сообщение..."}
                onSend={async (input) => {
                  const sent = await messagesService.sendMessage({
                    threadId: activeThread.id,
                    senderId: activeActorId,
                    senderRole: roleByActorId(activeActorId),
                    content: input.content,
                    attachments: input.attachments,
                  });
                  setMessages((prev) => [...prev, sent]);
                  const groups = await Promise.all(actorIds.map((id) => messagesService.getMyThreads(id)));
                  const merged = [...groups.flat()].sort((a, b) => +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt));
                  setThreads(Array.from(new Map(merged.map((t) => [t.id, t])).values()));
                }}
              />
            </>
          ) : (
            <div className="grid flex-1 place-items-center p-6 text-center text-sm text-slate-500">Выберите диалог слева</div>
          )}
        </article>
      </div>
    </section>
  );
}
