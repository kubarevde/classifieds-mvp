import { Message } from "@/lib/messages";

type MessageBubbleProps = {
  message: Message;
};

function formatTime(isoDate: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMine = message.author === "me";

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 sm:max-w-[70%] ${
          isMine ? "rounded-br-md bg-slate-900 text-white" : "rounded-bl-md bg-slate-100 text-slate-900"
        }`}
      >
        <p className="text-sm leading-6">{message.text}</p>
        <p className={`mt-1 text-right text-[11px] ${isMine ? "text-slate-300" : "text-slate-500"}`}>
          {formatTime(message.sentAtIso)}
        </p>
      </div>
    </div>
  );
}
