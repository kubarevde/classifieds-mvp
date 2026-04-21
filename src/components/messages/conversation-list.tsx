import { Conversation } from "@/lib/messages";

import { ConversationItem } from "@/components/messages/conversation-item";

type ConversationListProps = {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
};

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
}: ConversationListProps) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 px-1">
        <p className="text-sm font-semibold text-slate-900">Диалоги</p>
        <p className="text-xs text-slate-500">Актуальные чаты по объявлениям</p>
      </div>

      <div className="space-y-2">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={conversation.id === activeConversationId}
            onSelect={onSelectConversation}
          />
        ))}
      </div>
    </aside>
  );
}
