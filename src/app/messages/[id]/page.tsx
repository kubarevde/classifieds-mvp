"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useDemoRole } from "@/components/demo-role/demo-role";
import { Navbar } from "@/components/layout/navbar";
import { MessageBubble } from "@/components/messages/message-bubble";
import { MessageComposer } from "@/components/messages/message-composer";
import { MessagingTrustStrip } from "@/components/messages/messaging-trust-strip";
import { formatPresence } from "@/components/messages/message-presence";
import { Container } from "@/components/ui/container";
import { DEMO_BUYER_USER_ID, resolvePrimaryActorId, roleByActorId } from "@/lib/messages-actors";
import { formatUsualReplyMinutes } from "@/lib/messages-derived";
import { mockListingsService } from "@/services/listings";
import { messagesService, type Message, type MessageParticipant, type MessageThread } from "@/services/messages";
import { getBuyerRequestById } from "@/services/requests";
import { getStorefrontSellerById } from "@/services/sellers/seller-data";
import { mockTrustService } from "@/services/trust";

export default function MessageThreadPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const threadId = decodeURIComponent(String(params.id ?? ""));
  const { role, currentSellerId } = useDemoRole();
  const actorId = resolvePrimaryActorId(role, currentSellerId);

  const [thread, setThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participant, setParticipant] = useState<MessageParticipant | null>(null);
  const [listingTitle, setListingTitle] = useState<string | null>(null);
  const [listingPrice, setListingPrice] = useState<string | null>(null);
  const [listingImage, setListingImage] = useState<string | null>(null);
  const [requestTitle, setRequestTitle] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [buyerTrustHint, setBuyerTrustHint] = useState("");
  const feedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([messagesService.getThread(threadId, actorId), messagesService.getMessages(threadId)]).then(async ([t, list]) => {
      if (!alive) return;
      setThread(t);
      setMessages(list);
      if (t) {
        const otherId = t.participantIds.find((id) => id !== actorId) ?? t.participantIds[0] ?? DEMO_BUYER_USER_ID;
        setParticipant(await messagesService.getParticipant(otherId));
        if (t.listingId) {
          const listing = await mockListingsService.getById(t.listingId);
          setListingTitle(listing?.title ?? t.listingId);
          setListingPrice(listing?.price ?? null);
          setListingImage(listing?.image ?? null);
        }
        if (t.requestId) {
          const req = await getBuyerRequestById(t.requestId, { incrementView: false });
          setRequestTitle(req?.title ?? t.requestId);
        }
        if (t.storeId) {
          setStoreName(getStorefrontSellerById(t.storeId)?.storefrontName ?? t.storeId);
        }
        await messagesService.markThreadRead(t.id, actorId);
      }
    });
    return () => {
      alive = false;
    };
  }, [actorId, threadId]);

  const trustStoreId = useMemo(() => {
    if (!thread || !participant) return null;
    if (thread.storeId) return thread.storeId;
    if (participant.userId.startsWith("seller-account:")) {
      return participant.userId.slice("seller-account:".length);
    }
    return null;
  }, [participant, thread]);

  useEffect(() => {
    let alive = true;
    if (roleByActorId(actorId) !== "buyer" || !trustStoreId) {
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
  }, [actorId, trustStoreId]);

  const contextNode = useMemo(() => {
    if (!thread) return null;
    if (thread.listingId) return <Link href={`/listings/${encodeURIComponent(thread.listingId)}`} className="text-xs font-semibold text-sky-800 hover:underline">По объявлению: {listingTitle ?? thread.listingId}</Link>;
    if (thread.requestId) return <Link href={`/requests/${encodeURIComponent(thread.requestId)}`} className="text-xs font-semibold text-sky-800 hover:underline">По запросу: {requestTitle ?? thread.requestId}</Link>;
    if (thread.storeId) return <Link href={`/stores/${encodeURIComponent(thread.storeId)}`} className="text-xs font-semibold text-sky-800 hover:underline">По магазину: {storeName ?? thread.storeId}</Link>;
    return null;
  }, [listingTitle, requestTitle, storeName, thread]);

  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (!thread) {
    return (
      <div className="min-h-screen bg-slate-50/60">
        <Navbar />
        <main className="py-6">
          <Container>
            <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">Диалог не найден.</p>
          </Container>
        </main>
      </div>
    );
  }
  const from = searchParams.get("from");
  const actor = searchParams.get("actor");
  const backHref = from === "dashboard" ? "/dashboard?section=messages" : from === "store-dashboard" || actor === "store" ? `/dashboard/store?sellerId=${currentSellerId ?? ""}&section=messages` : "/messages";
  const backLabel = from === "dashboard" ? "Вернуться в кабинет" : from === "store-dashboard" || actor === "store" ? "Вернуться в кабинет магазина" : "К списку диалогов";

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="space-y-4">
          <Link href={backHref} className="inline-flex text-sm font-medium text-slate-600 hover:text-slate-900">
            ← {backLabel}
          </Link>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-100 px-4 py-3">
              <p className="text-base font-semibold text-slate-900">{participant?.name ?? "Собеседник"}</p>
              <p className="text-xs text-slate-500">
                {participant?.isOnline ? "Продавец в сети" : formatPresence(participant ?? {})}
              </p>
              {roleByActorId(actorId) === "buyer" && !participant?.isOnline && buyerTrustHint ? (
                <p className="mt-1 text-xs text-slate-500">{buyerTrustHint} — при задержке можно написать позже.</p>
              ) : null}
              {contextNode ? <div className="mt-2">{contextNode}</div> : null}
              {thread.listingId || thread.requestId || thread.storeId || trustStoreId ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {thread.listingId ? (
                    <Link href={`/listings/${thread.listingId}`} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700">
                      Открыть объявление
                    </Link>
                  ) : null}
                  {thread.requestId ? (
                    <Link href={`/requests/${thread.requestId}`} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700">
                      Открыть запрос
                    </Link>
                  ) : null}
                  {(thread.storeId || trustStoreId) ? (
                    <Link href={`/stores/${thread.storeId ?? trustStoreId}`} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700">
                      Открыть магазин
                    </Link>
                  ) : null}
                  {trustStoreId ? (
                    <Link href={`/stores/${encodeURIComponent(trustStoreId)}#store-reputation`} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700">
                      Отзывы
                    </Link>
                  ) : null}
                  <span className="rounded-lg border border-dashed border-slate-300 px-2 py-1 text-xs text-slate-500">Предложить цену — скоро</span>
                  <span className="rounded-lg border border-dashed border-slate-300 px-2 py-1 text-xs text-slate-500">Создать сделку — скоро</span>
                </div>
              ) : null}
            </header>

            {(thread.listingId || thread.requestId || thread.storeId) ? (
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-600">
                {thread.listingId ? (
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- mock listing URLs, avoid image optimizer config */}
                    {listingImage ? <img src={listingImage} alt={listingTitle ?? ""} className="h-10 w-10 rounded-md object-cover" /> : null}
                    <div>
                      <p className="font-medium text-slate-800">{listingTitle ?? thread.listingId}</p>
                      <p>{listingPrice ?? "Цена по запросу"}</p>
                    </div>
                  </div>
                ) : (
                  <>Контекст диалога: {thread.requestId ? `запрос ${requestTitle ?? thread.requestId}` : `магазин ${storeName ?? thread.storeId}`}</>
                )}
              </div>
            ) : null}

            {roleByActorId(actorId) === "buyer" && trustStoreId ? <MessagingTrustStrip storeId={trustStoreId} /> : null}

            <div ref={feedRef} className="max-h-[58vh] space-y-3 overflow-y-auto bg-slate-50/50 p-4">
              {messages.map((message) => <MessageBubble key={message.id} message={message} mine={message.senderId === actorId} />)}
            </div>
            <MessageComposer
              role={roleByActorId(actorId)}
              suggestMode={roleByActorId(actorId) === "buyer" ? "dropdown" : "chips"}
              suggestedContext={{
                hasListingContext: Boolean(thread.listingId),
                hasRequestContext: Boolean(thread.requestId),
              }}
              onSend={async (input) => {
                const sent = await messagesService.sendMessage({
                  threadId: thread.id,
                  senderId: actorId,
                  senderRole: roleByActorId(actorId),
                  content: input.content,
                  attachments: input.attachments,
                });
                setMessages((prev) => [...prev, sent]);
              }}
            />
          </section>
        </Container>
      </main>
    </div>
  );
}
