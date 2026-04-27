import { Conversation, getConversationLastMessage } from "@/lib/messages";

type ConversationItemProps = {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (conversationId: string) => void;
};

function formatTime(isoDate: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export function ConversationItem({ conversation, isActive, onSelect }: ConversationItemProps) {
  const lastMessage = getConversationLastMessage(conversation);

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={`w-full rounded-2xl border p-3 text-left transition ${
        isActive
          ? "border-sky-200 bg-sky-50/70 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{conversation.participantName}</p>
          <p className="truncate text-xs text-slate-500">
            {conversation.participantRole}
          </p>
        </div>
        {lastMessage ? (
          <span className="shrink-0 text-xs font-medium text-slate-500">{formatTime(lastMessage.sentAtIso)}</span>
        ) : null}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <p className="line-clamp-1 flex-1 text-sm text-slate-600">{lastMessage?.text ?? "Нет сообщений"}</p>
        {conversation.unreadCount > 0 ? (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-sky-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            {conversation.unreadCount}
          </span>
        ) : null}
      </div>
    </button>
  );
}
