"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { MessageBubble } from "@/components/messages/message-bubble";
import { MessageComposer } from "@/components/messages/message-composer";
import { MessagingTrustStrip } from "@/components/messages/messaging-trust-strip";
import { formatPresence } from "@/components/messages/message-presence";
import { ThreadContextCard } from "@/components/messages/ThreadContextCard";
import { ThreadList, type InboxTab } from "@/components/messages/ThreadList";
import { ThreadPanel } from "@/components/messages/ThreadPanel";
import { roleByActorId } from "@/lib/messages-actors";
import {
  computeSellerMessagingSummary,
  filterThreadsByContext,
  formatUsualReplyMinutes,
  getSellerLeadState,
  partitionSellerInbox,
  sellerLeadLabel,
  sortThreadsForBuyerInbox,
  sortThreadsForSellerInbox,
  type ThreadContextKind,
} from "@/lib/messages-derived";
import { ListingOfferSheet } from "@/components/deals/ListingOfferSheet";
import { OfferCard } from "@/components/deals/OfferCard";
import { mockListingsService } from "@/services/listings";
import { dealsService } from "@/services/deals";
import { messagesService, type Message, type MessageContext, type MessageParticipant, type MessageThread } from "@/services/messages";
import { mockTrustService } from "@/services/trust";
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

function pinnedStorageKey(actorIds: string[]) {
  return `classifieds-mvp:pinned-threads:${[...actorIds].sort().join("|")}`;
}

function loadPinnedSet(actorIds: string[]): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(pinnedStorageKey(actorIds));
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function savePinnedSet(actorIds: string[], ids: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(pinnedStorageKey(actorIds), JSON.stringify([...ids]));
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
  const [threadMessagesMap, setThreadMessagesMap] = useState<Map<string, Message[]>>(() => new Map());
  const [participants, setParticipants] = useState<Record<string, MessageParticipant>>({});
  const [listingTitles, setListingTitles] = useState<Record<string, string>>({});
  const [requestTitles, setRequestTitles] = useState<Record<string, string>>({});
  const [storeNames, setStoreNames] = useState<Record<string, string>>({});
  const [localActiveThreadId, setLocalActiveThreadId] = useState<string | null>(selectedThreadId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");
  const [contextFilter, setContextFilter] = useState<"all" | "listing" | "request" | "store">("all");
  const [inboxTab, setInboxTab] = useState<InboxTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [threadContext, setThreadContext] = useState<MessageContext | null>(null);
  const [threadContextLoading, setThreadContextLoading] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => new Set());
  const [buyerTrustHint, setBuyerTrustHint] = useState<string>("");
  const [offerSheetOpen, setOfferSheetOpen] = useState(false);
  const [offerPriceHint, setOfferPriceHint] = useState(10_000);
  const [offersTick, setOffersTick] = useState(0);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const localActiveThreadIdRef = useRef(localActiveThreadId);
  useLayoutEffect(() => {
    localActiveThreadIdRef.current = localActiveThreadId;
  }, [localActiveThreadId]);

  useEffect(() => {
    queueMicrotask(() => setLocalActiveThreadId(selectedThreadId));
  }, [selectedThreadId]);

  const activeThreadId = selectedThreadId ?? localActiveThreadId;
  const sellerActorId = useMemo(() => actorIds.find((id) => id.startsWith("seller-account:")) ?? "", [actorIds]);

  useEffect(() => {
    if (!isSellerWorkspace) {
      queueMicrotask(() => setPinnedIds(loadPinnedSet(actorIds)));
    }
  }, [actorIds, isSellerWorkspace]);

  const togglePin = useCallback(
    (threadId: string) => {
      setPinnedIds((prev) => {
        const next = new Set(prev);
        if (next.has(threadId)) next.delete(threadId);
        else next.add(threadId);
        savePinnedSet(actorIds, next);
        return next;
      });
    },
    [actorIds],
  );

  useEffect(() => {
    let alive = true;
    async function loadInbox() {
      if (actorIds.length === 0) {
        if (!alive) return;
        setThreads([]);
        setThreadMessagesMap(new Map());
        return;
      }
      const groups = await Promise.all(actorIds.map((id) => messagesService.getMyThreads(id)));
      if (!alive) return;
      const merged = [...groups.flat()].sort((a, b) => {
        if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
        return +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt);
      });
      const unique = Array.from(new Map(merged.map((t) => [t.id, t])).values());

      if (isSellerWorkspace && sellerActorId) {
        const entries = await Promise.all(unique.map((t) => messagesService.getMessages(t.id).then((m) => [t.id, m] as const)));
        if (!alive) return;
        const map = new Map(entries);
        setThreadMessagesMap(map);
        setThreads(sortThreadsForSellerInbox(unique, map, sellerActorId));
      } else {
        setThreadMessagesMap(new Map());
        setThreads(unique);
      }

      if (!(selectedThreadId ?? localActiveThreadIdRef.current) && unique.length > 0) {
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
  }, [actorIds, isSellerWorkspace, onSelectedThreadChange, selectedThreadId, sellerActorId]);

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

  const listingSellerAccount = useMemo(
    () => activeThread?.participantIds.find((id) => id.startsWith("seller-account:")) ?? null,
    [activeThread],
  );

  void offersTick;
  const threadOffers =
    !activeThread?.listingId
      ? []
      : (() => {
          const buyer = activeThread.participantIds.find((id) => id.startsWith("buyer-"));
          const seller = activeThread.participantIds.find((id) => id.startsWith("seller-account:"));
          if (!buyer || !seller) return [];
          return dealsService.getOffersForListing(activeThread.listingId).filter((o) => o.buyerId === buyer && o.sellerId === seller);
        })();

  useEffect(() => {
    if (!offerSheetOpen || !activeThread?.listingId) return;
    let alive = true;
    void mockListingsService.getById(activeThread.listingId).then((l) => {
      if (!alive || !l?.priceValue) return;
      setOfferPriceHint(l.priceValue);
    });
    return () => {
      alive = false;
    };
  }, [offerSheetOpen, activeThread?.listingId]);

  const buyerListThreads = useMemo(() => {
    const filtered = filterThreadsByContext(threads, contextFilter === "all" ? "all" : (contextFilter as ThreadContextKind));
    return sortThreadsForBuyerInbox(filtered, pinnedIds);
  }, [contextFilter, pinnedIds, threads]);

  const sellerPartition = useMemo(() => {
    if (!isSellerWorkspace || !sellerActorId) return { needsReply: [] as MessageThread[], rest: [] as MessageThread[] };
    return partitionSellerInbox(threads, threadMessagesMap, sellerActorId);
  }, [isSellerWorkspace, sellerActorId, threadMessagesMap, threads]);

  const sellerFlatThreads = useMemo(() => {
    if (!isSellerWorkspace) return [] as MessageThread[];
    return [...sellerPartition.needsReply, ...sellerPartition.rest];
  }, [isSellerWorkspace, sellerPartition.needsReply, sellerPartition.rest]);

  const sellerSummary = useMemo(() => {
    if (!isSellerWorkspace || !sellerActorId) return null;
    return computeSellerMessagingSummary(threads, threadMessagesMap, sellerActorId);
  }, [isSellerWorkspace, sellerActorId, threadMessagesMap, threads]);

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
      const merged = [...groups.flat()].sort((a, b) => {
        if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
        return +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt);
      });
      const unique = Array.from(new Map(merged.map((t) => [t.id, t])).values());
      setThreadMessagesMap((prev) => {
        const next = new Map(prev);
        next.set(threadId, rows);
        if (isSellerWorkspace && sellerActorId) {
          queueMicrotask(() => {
            setThreads(sortThreadsForSellerInbox(unique, next, sellerActorId));
          });
        }
        return next;
      });
      if (!isSellerWorkspace) {
        setThreads(unique);
      }
    }
    void loadThread();
    return () => {
      alive = false;
    };
  }, [activeActorId, activeThreadId, actorIds, isSellerWorkspace, sellerActorId]);

  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, activeThreadId]);

  const contextLabel = useMemo(() => {
    if (!activeThread) return null;
    if (activeThread.type === "support") return `Поддержка · тикет ${activeThread.contextEntityId}`;
    if (activeThread.listingId) return `По объявлению: ${listingTitles[activeThread.listingId] ?? activeThread.listingId}`;
    if (activeThread.requestId) return `По запросу: ${requestTitles[activeThread.requestId] ?? activeThread.requestId}`;
    if (activeThread.storeId) return `По магазину: ${storeNames[activeThread.storeId] ?? activeThread.storeId}`;
    return null;
  }, [activeThread, listingTitles, requestTitles, storeNames]);

  useEffect(() => {
    const thread = threads.find((t) => t.id === activeThreadId) ?? null;
    if (!thread) {
      queueMicrotask(() => {
        setThreadContext(null);
        setThreadContextLoading(false);
      });
      return;
    }
    let alive = true;
    queueMicrotask(() => {
      if (alive) setThreadContextLoading(true);
    });
    void messagesService.resolveMessageContext(thread).then((ctx) => {
      if (!alive) return;
      setThreadContext(ctx);
      setThreadContextLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [activeThreadId, threads]);

  const trustStoreId = useMemo(() => {
    if (!activeThread || !activeCounterparty) return null;
    if (activeThread.storeId) return activeThread.storeId;
    const uid = activeCounterparty.userId;
    if (uid.startsWith("seller-account:")) return uid.slice("seller-account:".length);
    return null;
  }, [activeCounterparty, activeThread]);

  useEffect(() => {
    let alive = true;
    if (isSellerWorkspace || !trustStoreId) {
      queueMicrotask(() => {
        if (alive) setBuyerTrustHint("");
      });
      return () => {
        alive = false;
      };
    }
    void mockTrustService.getScore(trustStoreId).then((score) => {
      if (!alive) return;
      setBuyerTrustHint(formatUsualReplyMinutes(score?.components.response_time));
    });
    return () => {
      alive = false;
    };
  }, [isSellerWorkspace, trustStoreId]);

  const listThreads = isSellerWorkspace ? threads : buyerListThreads;

  const threadsForInboxList = useMemo(() => {
    const base = isSellerWorkspace ? sellerFlatThreads : buyerListThreads;
    let tabbed: MessageThread[];
    if (inboxTab === "archived") {
      tabbed = base.filter((t) => t.status === "archived");
    } else if (inboxTab === "unread") {
      tabbed = base.filter((t) => t.status === "open" && t.unreadCount > 0);
    } else {
      tabbed = base;
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tabbed;
    return tabbed.filter((thread) => {
      const me = thread.participantIds.find((id) => actorIds.includes(id)) ?? actorIds[0];
      const otherId = thread.participantIds.find((id) => id !== me);
      const counterpart = otherId ? participants[otherId] : null;
      const ctxLine = thread.listingId
        ? (listingTitles[thread.listingId] ?? thread.listingId)
        : thread.requestId
          ? (requestTitles[thread.requestId] ?? thread.requestId)
          : (storeNames[thread.storeId ?? ""] ?? thread.storeId ?? "");
      const hay = `${counterpart?.name ?? ""} ${thread.lastMessage} ${ctxLine}`.toLowerCase();
      return hay.includes(q);
    });
  }, [
    actorIds,
    buyerListThreads,
    inboxTab,
    isSellerWorkspace,
    listingTitles,
    participants,
    requestTitles,
    searchQuery,
    sellerFlatThreads,
    storeNames,
  ]);

  const renderThreadRow = (thread: MessageThread) => {
    const me = thread.participantIds.find((id) => actorIds.includes(id)) ?? actorIds[0];
    const otherId = thread.participantIds.find((id) => id !== me);
    const counterpart = otherId ? participants[otherId] : null;
    const selected = thread.id === activeThreadId;
    const contextChip =
      thread.type === "support" ? "Поддержка" : thread.listingId ? "Объявление" : thread.requestId ? "Запрос" : "Магазин";
    const leadState =
      isSellerWorkspace && sellerActorId ? getSellerLeadState(thread, threadMessagesMap.get(thread.id) ?? [], sellerActorId) : "none";
    const sellerStatusLabel = isSellerWorkspace ? sellerLeadLabel(leadState) : null;
    const onlineLabel = counterpart?.isOnline ? "Продавец в сети" : formatPresence(counterpart ?? {});
    const hasNewOffer =
      isSellerWorkspace &&
      sellerActorId &&
      thread.listingId &&
      dealsService
        .getOffersForListing(thread.listingId)
        .some(
          (o) =>
            o.sellerId === sellerActorId &&
            thread.participantIds.includes(o.buyerId) &&
            (o.status === "pending" || o.status === "countered"),
        );

    return (
      <li key={thread.id}>
        <div className={`flex border-b border-slate-100 ${selected ? "bg-slate-100" : "hover:bg-slate-50"}`}>
          <button
            type="button"
            onClick={() => {
              setLocalActiveThreadId(thread.id);
              onSelectedThreadChange?.(thread.id);
              setMobileView("thread");
            }}
            className="min-w-0 flex-1 px-3 py-3 text-left transition"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                  <span className={`mr-1 inline-block h-2 w-2 rounded-full ${counterpart?.isOnline ? "bg-emerald-500" : "bg-slate-300"}`} />
                  {counterpart?.name ?? "Собеседник"}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">{onlineLabel}</p>
                {!isSellerWorkspace && counterpart?.isOnline === false ? (
                  <p className="mt-0.5 text-[11px] text-slate-400">Обычно продавец отвечает в рабочее время</p>
                ) : null}
              </div>
              {thread.unreadCount > 0 ? (
                <span className="inline-flex rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white">{thread.unreadCount}</span>
              ) : null}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1">
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600">{contextChip}</span>
              {sellerStatusLabel ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    leadState === "new_lead"
                      ? "bg-emerald-100 text-emerald-700"
                      : leadState === "waiting_reply"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {sellerStatusLabel}
                </span>
              ) : null}
              {hasNewOffer ? (
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-800">Новое предложение</span>
              ) : null}
              {pinnedIds.has(thread.id) ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-800">Закреплён</span>
              ) : null}
            </div>
            <p className="mt-1 line-clamp-1 text-xs text-slate-600">
              {thread.listingId
                ? `По объявлению: ${listingTitles[thread.listingId] ?? thread.listingId}`
                : thread.requestId
                  ? `По запросу: ${requestTitles[thread.requestId] ?? thread.requestId}`
                  : `По магазину: ${storeNames[thread.storeId ?? ""] ?? thread.storeId ?? "—"}`}
            </p>
            <p className="line-clamp-1 text-xs text-slate-500">{thread.lastMessage}</p>
            <p className="mt-1 text-[11px] text-slate-500">{formatLastAt(thread.lastMessageAt)}</p>
          </button>
          {!isSellerWorkspace ? (
            <button
              type="button"
              title={pinnedIds.has(thread.id) ? "Открепить" : "Закрепить"}
              onClick={() => togglePin(thread.id)}
              className="shrink-0 border-l border-slate-100 px-2 text-lg text-amber-600 hover:bg-amber-50"
            >
              {pinnedIds.has(thread.id) ? "📌" : "📍"}
            </button>
          ) : null}
        </div>
      </li>
    );
  };

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

      {isSellerWorkspace && sellerSummary ? (
        <div className="mb-3 grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Среднее время ответа</p>
            <p className="mt-1 font-semibold text-slate-900">{sellerSummary.avgReplyMinutes != null ? `~${sellerSummary.avgReplyMinutes} мин` : "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Диалоги с ответом</p>
            <p className="mt-1 font-semibold text-slate-900">{Math.round(sellerSummary.answeredRatio * 100)}%</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ждут ответа</p>
            <p className="mt-1 font-semibold text-slate-900">{sellerSummary.unreadNeedingReply}</p>
          </div>
          <p className="sm:col-span-3 text-xs text-slate-600">{sellerSummary.hint}</p>
        </div>
      ) : null}

      <div className="grid min-h-[560px] gap-3 md:grid-cols-[320px_minmax(0,1fr)]">
        <aside className={`${mobileView === "thread" ? "hidden md:block" : "block"} overflow-hidden rounded-xl border border-slate-200`}>
          {listThreads.length === 0 ? (
            <div className="p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900">Диалогов пока нет</p>
              <p className="mt-1">Найдите объявление, чтобы начать диалог.</p>
              <Link href={emptyCtaHref} className="mt-3 inline-flex rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
                Перейти в каталог
              </Link>
            </div>
          ) : (
            <ThreadList
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              inboxTab={inboxTab}
              onInboxTabChange={setInboxTab}
              threads={threadsForInboxList}
              showBuyerContextFilters={!isSellerWorkspace}
              contextFilter={contextFilter}
              onContextFilterChange={(id) => setContextFilter(id)}
              emptyCta={
                <Link href={emptyCtaHref} className="inline-flex rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
                  Перейти в каталог
                </Link>
              }
              renderRow={(thread) => renderThreadRow(thread)}
            />
          )}
        </aside>

        <ThreadPanel className={mobileView === "thread" ? "" : "hidden md:flex"}>
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
                <p className="text-xs text-slate-500">
                  {activeCounterparty?.isOnline ? "Продавец в сети" : formatPresence(activeCounterparty ?? {})}
                </p>
                {!isSellerWorkspace && !activeCounterparty?.isOnline ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {buyerTrustHint || "Обычно продавец отвечает в рабочее время"} — если ответ задерживается, можно написать ещё раз позже.
                  </p>
                ) : null}
                {contextLabel ? <p className="mt-1 text-xs text-slate-500">{contextLabel}</p> : null}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {activeThread.listingId ? (
                    <Link href={`/listings/${activeThread.listingId}`} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700">
                      Открыть объявление
                    </Link>
                  ) : null}
                  {activeThread.requestId ? (
                    <Link href={`/requests/${activeThread.requestId}`} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700">
                      Открыть запрос
                    </Link>
                  ) : null}
                  {activeThread.storeId ? (
                    <Link href={`/stores/${activeThread.storeId}`} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700">
                      Открыть магазин
                    </Link>
                  ) : null}
                  {activeThread.type === "support" ? (
                    <Link
                      href={`/support/tickets/${encodeURIComponent(activeThread.contextEntityId)}`}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700"
                    >
                      Открыть тикет
                    </Link>
                  ) : null}
                  {trustStoreId ? (
                    <Link
                      href={`/stores/${encodeURIComponent(trustStoreId)}#store-reputation`}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700"
                    >
                      Отзывы о магазине
                    </Link>
                  ) : null}
                  {!isSellerWorkspace && activeThread.listingId && activeActorId?.startsWith("buyer-") && listingSellerAccount ? (
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      onClick={() => setOfferSheetOpen(true)}
                    >
                      Предложить цену
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    onClick={async () => {
                      const archived = activeThread.status === "open";
                      const updated = await messagesService.archiveThread(activeThread.id, archived);
                      if (!updated) return;
                      setThreads((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
                    }}
                  >
                    {activeThread.status === "open" ? "В архив" : "Вернуть из архива"}
                  </button>
                </div>
              </header>
              <ThreadContextCard thread={activeThread} context={threadContext} loading={threadContextLoading} />
              {activeThread.listingId && threadOffers.length > 0 ? (
                <div className="border-b border-slate-100 bg-white px-4 py-3 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Предложения по этому объявлению</p>
                  <div className="space-y-2">
                    {threadOffers.map((o) => (
                      <OfferCard
                        key={o.id}
                        offer={o}
                        currentUserId={activeActorId ?? ""}
                        onChanged={async () => {
                          setOffersTick((n) => n + 1);
                          const rows = await messagesService.getMessages(activeThread.id);
                          setMessages(rows);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
              {!isSellerWorkspace && trustStoreId ? <MessagingTrustStrip storeId={trustStoreId} /> : null}
              {isSellerWorkspace ? (
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-600">
                  Рабочий inbox: непрочитанные и новые лиды — сверху. Быстрые ответы ускоряют сделку.
                </div>
              ) : (
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-600">
                  Общайтесь с продавцами по объявлениям, запросам и заказам.
                </div>
              )}
              <div ref={feedRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} mine={message.senderId === activeActorId} />
                ))}
              </div>
              <MessageComposer
                role={roleByActorId(activeActorId)}
                suggestMode={isSellerWorkspace ? "chips" : "dropdown"}
                suggestedContext={{
                  hasListingContext: Boolean(activeThread.listingId),
                  hasRequestContext: Boolean(activeThread.requestId),
                }}
                placeholder={isSellerWorkspace ? "Ответьте покупателю..." : "Введите сообщение..."}
                onSend={async (input) => {
                  if (!activeActorId) return;
                  const sent = await messagesService.sendMessage({
                    threadId: activeThread.id,
                    senderId: activeActorId,
                    senderRole: roleByActorId(activeActorId),
                    content: input.content,
                    attachments: input.attachments,
                  });
                  setMessages((prev) => [...prev, sent]);
                  setThreadMessagesMap((prev) => {
                    const next = new Map(prev);
                    const prior = prev.get(activeThread.id) ?? [];
                    next.set(activeThread.id, [...prior, sent]);
                    void (async () => {
                      const groups = await Promise.all(actorIds.map((id) => messagesService.getMyThreads(id)));
                      const merged = [...groups.flat()].sort((a, b) => {
                        if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
                        return +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt);
                      });
                      const unique = Array.from(new Map(merged.map((t) => [t.id, t])).values());
                      if (isSellerWorkspace && sellerActorId) {
                        setThreads(sortThreadsForSellerInbox(unique, next, sellerActorId));
                      } else {
                        setThreads(unique);
                      }
                    })();
                    return next;
                  });
                }}
              />
              {!isSellerWorkspace && activeThread.listingId && activeActorId?.startsWith("buyer-") && listingSellerAccount ? (
                <ListingOfferSheet
                  open={offerSheetOpen}
                  onOpenChange={setOfferSheetOpen}
                  listingId={activeThread.listingId}
                  listingTitle={listingTitles[activeThread.listingId] ?? activeThread.listingId}
                  referencePrice={offerPriceHint}
                  buyerId={activeActorId}
                  sellerAccountId={listingSellerAccount}
                  onSubmitted={async (threadId) => {
                    if (threadId === activeThread.id) {
                      const rows = await messagesService.getMessages(activeThread.id);
                      setMessages(rows);
                    }
                  }}
                />
              ) : null}
            </>
          ) : (
            <div className="grid flex-1 place-items-center p-6 text-center text-sm text-slate-500">Выберите диалог слева</div>
          )}
        </ThreadPanel>
      </div>
    </section>
  );
}
