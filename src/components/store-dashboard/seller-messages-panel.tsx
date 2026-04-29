"use client";

import { useMemo, useState } from "react";

import { ChatHeader } from "@/components/messages/chat-header";
import { ConversationList } from "@/components/messages/conversation-list";
import { MessageBubble } from "@/components/messages/message-bubble";
import { MessageInput } from "@/components/messages/message-input";
import { Card } from "@/components/ui";
import { getStoreConversationsSync } from "@/services/stores";

type MobileView = "list" | "chat";

export function SellerMessagesPanel({
  onUnreadChange,
}: {
  onUnreadChange: (count: number) => void;
}) {
  const [conversations, setConversations] = useState(() => getStoreConversationsSync());
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    getStoreConversationsSync()[0]?.id ?? null,
  );
  const [draftMessage, setDraftMessage] = useState("");
  const [mobileView, setMobileView] = useState<MobileView>("list");

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId) ?? null,
    [activeConversationId, conversations],
  );

  function syncUnread(next: typeof conversations) {
    onUnreadChange(next.reduce((sum, item) => sum + item.unreadCount, 0));
  }

  function selectConversation(conversationId: string) {
    setActiveConversationId(conversationId);
    setMobileView("chat");
    setConversations((prev) => {
      const next = prev.map((item) =>
        item.id === conversationId ? { ...item, unreadCount: 0 } : item,
      );
      syncUnread(next);
      return next;
    });
  }

  function sendMessage() {
    const text = draftMessage.trim();
    if (!text || !activeConversationId) {
      return;
    }
    setConversations((prev) => {
      const next = prev.map((item) =>
        item.id === activeConversationId
          ? {
              ...item,
              messages: [
                ...item.messages,
                { id: `seller-local-${Date.now()}`, author: "me" as const, text, sentAtIso: new Date().toISOString() },
              ],
            }
          : item,
      );
      syncUnread(next);
      return next;
    });
    setDraftMessage("");
  }

  const showConversationList = mobileView === "list";
  const showConversationPanel = mobileView === "chat" || !activeConversation;

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-3">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Сообщения магазина</h2>
        <p className="text-sm text-slate-600">
          Переписка с покупателями по карточкам магазина.
        </p>
      </div>
      <section className="grid gap-3 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className={showConversationList ? "block" : "hidden lg:block"}>
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={selectConversation}
          />
        </div>
        <article
          className={`min-h-[560px] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm ${
            showConversationPanel ? "flex" : "hidden lg:flex"
          }`}
        >
          {activeConversation ? (
            <>
              <ChatHeader
                conversation={activeConversation}
                listing={null}
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
            <div className="grid flex-1 place-items-center p-8 text-center text-sm text-slate-500">
              Нет выбранного диалога
            </div>
          )}
        </article>
      </section>
    </Card>
  );
}
