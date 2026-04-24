"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useBuyer } from "@/components/buyer/buyer-provider";
import { ChatHeader } from "@/components/messages/chat-header";
import { ConversationList } from "@/components/messages/conversation-list";
import { MessageBubble } from "@/components/messages/message-bubble";
import { MessageInput } from "@/components/messages/message-input";
import { allListings } from "@/lib/listings";
import { getConversationListing } from "@/lib/messages";

type MobileView = "list" | "chat";

function getInitialActiveConversationId(searchParams: URLSearchParams, conversationIds: string[], byListingId: Map<string, string>) {
  const requestedConversationId = searchParams.get("conversationId");
  if (requestedConversationId && conversationIds.includes(requestedConversationId)) {
    return requestedConversationId;
  }

  const requestedListingId = searchParams.get("listingId");
  if (requestedListingId) {
    const matchedId = byListingId.get(requestedListingId);
    if (matchedId) {
      return matchedId;
    }
  }

  return conversationIds[0] ?? null;
}

export function MessagesPageClient() {
  const searchParams = useSearchParams();
  const buyer = useBuyer();
  const conversations = buyer.messages;
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [mobileView, setMobileView] = useState<MobileView>(() =>
    searchParams.get("conversationId") || searchParams.get("listingId") ? "chat" : "list",
  );

  const activeConversationId = useMemo(() => {
    if (selectedConversationId) {
      return selectedConversationId;
    }
    const map = new Map(conversations.map((conversation) => [conversation.listingId, conversation.id]));
    return getInitialActiveConversationId(
      new URLSearchParams(searchParams.toString()),
      conversations.map((conversation) => conversation.id),
      map,
    );
  }, [conversations, searchParams, selectedConversationId]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [activeConversationId, conversations],
  );

  useEffect(() => {
    const listingId = searchParams.get("listingId");
    if (!listingId) {
      return;
    }
    const listing = allListings.find((item) => item.id === listingId);
    buyer.ensureConversation({
      listingId,
      sellerName: searchParams.get("sellerName") ?? listing?.sellerName,
      listingTitle: searchParams.get("listingTitle") ?? listing?.title,
    });
  }, [buyer, searchParams]);

  function selectConversation(conversationId: string) {
    setSelectedConversationId(conversationId);
    setMobileView("chat");
    buyer.markConversationRead(conversationId);
  }

  function sendMessage() {
    if (!activeConversationId) {
      return;
    }

    const normalizedMessage = draftMessage.trim();
    if (!normalizedMessage) {
      return;
    }

    buyer.sendMessage(activeConversationId, normalizedMessage);
    setDraftMessage("");
  }

  const showConversationList = mobileView === "list";
  const showConversationPanel = mobileView === "chat" || !activeConversation;

  return (
    <section className="grid gap-3 lg:grid-cols-[340px_minmax(0,1fr)]">
      <div className={showConversationList ? "block" : "hidden lg:block"}>
        <Link
          href="/dashboard"
          className="mb-2 inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          ← Назад в кабинет
        </Link>
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={selectConversation}
        />
      </div>

      <div className={showConversationPanel ? "block" : "hidden lg:block"}>
        <article className="flex min-h-[580px] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
          {activeConversation ? (
            <>
              <ChatHeader
                conversation={activeConversation}
                listing={getConversationListing(activeConversation.listingId) ?? null}
                onBack={() => setMobileView("list")}
              />

              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-4">
                {activeConversation.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>

              <MessageInput value={draftMessage} onChange={setDraftMessage} onSubmit={sendMessage} />
            </>
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center">
              <div>
                <p className="text-lg font-semibold text-slate-900">Выберите диалог</p>
                <p className="mt-1 text-sm text-slate-500">
                  Откройте чат слева, чтобы продолжить переписку с продавцом или покупателем.
                </p>
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
