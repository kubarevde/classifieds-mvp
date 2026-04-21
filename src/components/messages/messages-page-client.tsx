"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ChatHeader } from "@/components/messages/chat-header";
import { ConversationList } from "@/components/messages/conversation-list";
import { MessageBubble } from "@/components/messages/message-bubble";
import { MessageInput } from "@/components/messages/message-input";
import { allListings } from "@/lib/listings";
import { Conversation, mockConversations, getConversationListing } from "@/lib/messages";

type MobileView = "list" | "chat";

function getInitialConversations(searchParams: URLSearchParams) {
  const listingId = searchParams.get("listingId");
  const sellerName = searchParams.get("sellerName");
  const listingTitle = searchParams.get("listingTitle");

  const initialConversations = structuredClone(mockConversations) as Conversation[];

  if (!listingId) {
    return initialConversations;
  }

  const existingConversation = initialConversations.find((conversation) => conversation.listingId === listingId);
  if (existingConversation) {
    return initialConversations;
  }

  const listing = allListings.find((currentListing) => currentListing.id === listingId);
  const participantName = sellerName ?? listing?.sellerName;

  if (!participantName) {
    return initialConversations;
  }

  initialConversations.unshift({
    id: `conv-new-${listingId}`,
    listingId,
    participantName,
    participantRole: "Продавец",
    unreadCount: 0,
    messages: [
      {
        id: `m-system-${listingId}`,
        author: "other",
        text: `Здравствуйте! По объявлению "${listingTitle ?? listing?.title ?? "товар"}" на связи.`,
        sentAtIso: new Date().toISOString(),
      },
    ],
  });

  return initialConversations;
}

function getInitialActiveConversationId(searchParams: URLSearchParams, conversations: Conversation[]) {
  const requestedConversationId = searchParams.get("conversationId");
  if (requestedConversationId && conversations.some((conversation) => conversation.id === requestedConversationId)) {
    return requestedConversationId;
  }

  const requestedListingId = searchParams.get("listingId");
  if (requestedListingId) {
    const byListing = conversations.find((conversation) => conversation.listingId === requestedListingId);
    if (byListing) {
      return byListing.id;
    }
  }

  return conversations[0]?.id ?? null;
}

export function MessagesPageClient() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const initialParams = new URLSearchParams(searchParams.toString());
    return getInitialConversations(initialParams);
  });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    const initialParams = new URLSearchParams(searchParams.toString());
    const initialConversations = getInitialConversations(initialParams);
    return getInitialActiveConversationId(initialParams, initialConversations);
  });
  const [draftMessage, setDraftMessage] = useState("");
  const [mobileView, setMobileView] = useState<MobileView>(() =>
    searchParams.get("conversationId") || searchParams.get("listingId") ? "chat" : "list",
  );

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [activeConversationId, conversations],
  );

  function selectConversation(conversationId: string) {
    setActiveConversationId(conversationId);
    setMobileView("chat");
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
      ),
    );
  }

  function sendMessage() {
    if (!activeConversationId) {
      return;
    }

    const normalizedMessage = draftMessage.trim();
    if (!normalizedMessage) {
      return;
    }

    const sentAtIso = new Date().toISOString();
    const newMessage = {
      id: `m-${Date.now()}`,
      author: "me" as const,
      text: normalizedMessage,
      sentAtIso,
    };

    setConversations((previous) => {
      const updated = previous.map((conversation) =>
        conversation.id === activeConversationId
          ? {
              ...conversation,
              messages: [...conversation.messages, newMessage],
              unreadCount: 0,
            }
          : conversation,
      );

      // Most recent activity appears first in dialog list.
      updated.sort((left, right) => {
        const leftTime = new Date(left.messages[left.messages.length - 1]?.sentAtIso ?? 0).getTime();
        const rightTime = new Date(right.messages[right.messages.length - 1]?.sentAtIso ?? 0).getTime();
        return rightTime - leftTime;
      });

      return updated;
    });

    setDraftMessage("");
  }

  const showConversationList = mobileView === "list";
  const showConversationPanel = mobileView === "chat" || !activeConversation;

  return (
    <section className="grid gap-3 lg:grid-cols-[340px_minmax(0,1fr)]">
      <div className={showConversationList ? "block" : "hidden lg:block"}>
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
