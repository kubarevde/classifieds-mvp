"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { MessageCircle, X } from "lucide-react";

import { addWorldChatMessage, getWorldChatMessages, type WorldChatMessage, type WorldId } from "@/lib/worlds.community";
import { getWorldLabel } from "@/lib/listings";

type WorldChatProps = {
  worldId: WorldId;
};

function formatRelativeTime(iso: string) {
  const timestamp = new Date(iso).getTime();
  const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 60) return `${minutes} мин. назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  return `${days} дн. назад`;
}

export function WorldChat({ worldId }: WorldChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<WorldChatMessage[]>(() => getWorldChatMessages(worldId));
  const [authorName, setAuthorName] = useState("Вы");
  const [text, setText] = useState("");
  const canSend = text.trim().length >= 2;

  const todayCount = useMemo(() => Math.max(1, Math.min(14, messages.length)), [messages.length]);
  const visibleMessages = useMemo(() => messages.slice(0, 40), [messages]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) return;
    const next = addWorldChatMessage(worldId, { authorName, text });
    setMessages((current) => [next, ...current]);
    setText("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:bg-slate-50"
      >
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <MessageCircle className="h-4 w-4" />
          Пообщаться с участниками мира
        </span>
        <span className="text-xs text-slate-500">{todayCount} сообщений за сегодня</span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/45 p-0 sm:items-center sm:justify-center sm:p-6">
          <button type="button" onClick={() => setIsOpen(false)} className="absolute inset-0" aria-label="Закрыть чат" />
          <section className="relative z-10 flex h-[92vh] w-full flex-col rounded-t-3xl border border-slate-200 bg-white p-4 sm:h-auto sm:max-h-[85vh] sm:max-w-2xl sm:rounded-3xl sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Чат мира «{getWorldLabel(worldId)}»</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                aria-label="Закрыть"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[52vh] flex-1 space-y-2 overflow-y-auto pr-1 sm:max-h-[50vh]">
              {visibleMessages.map((message) => (
                <article key={message.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">
                      {message.avatarInitials ?? message.authorName.slice(0, 2).toUpperCase()}
                    </span>
                    <p className="text-xs font-semibold text-slate-900">{message.authorName}</p>
                    <span className="text-[11px] text-slate-500">{formatRelativeTime(message.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{message.text}</p>
                </article>
              ))}
            </div>

            <form onSubmit={submit} className="mt-3 space-y-2 border-t border-slate-100 pt-3">
              <input
                value={authorName}
                onChange={(event) => setAuthorName(event.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none"
                placeholder="Ваше имя"
              />
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={2}
                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                placeholder="Задайте вопрос по миру или поделитесь опытом..."
              />
              <button
                type="submit"
                disabled={!canSend}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Отправить
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
