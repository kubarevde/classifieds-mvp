"use client";

import { useMemo, useState } from "react";

import type { SupportTicket } from "@/services/support";
import { addTicketReply } from "@/services/support";
import { Button } from "@/components/ui";

type TicketThreadProps = {
  ticket: SupportTicket;
  onUpdated: (ticket: SupportTicket) => void;
};

export function TicketThread({ ticket, onUpdated }: TicketThreadProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const ordered = useMemo(
    () => [...ticket.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [ticket.messages],
  );

  async function send() {
    const trimmed = text.trim();
    if (!trimmed || sending) {
      return;
    }
    setSending(true);
    const next = addTicketReply(ticket.id, trimmed);
    setSending(false);
    if (next) {
      setText("");
      onUpdated(next);
    }
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {ordered.map((msg) => (
          <li
            key={msg.id}
            className={`flex ${msg.authorRole === "support" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[min(100%,36rem)] rounded-2xl border px-3 py-2 text-sm sm:px-4 sm:py-3 ${
                msg.authorRole === "support"
                  ? "border-slate-200 bg-white text-slate-800"
                  : "border-blue-200 bg-blue-50 text-slate-900"
              }`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {msg.authorRole === "support" ? "Поддержка Classify" : "Вы"}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{msg.text}</p>
              <p className="mt-2 text-[11px] text-slate-500">
                {new Date(msg.createdAt).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {ticket.status === "closed" ? (
        <p className="text-sm text-slate-500">Обращение закрыто. Новое сообщение создайте в новом тикете.</p>
      ) : (
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4">
          <label htmlFor="ticket-reply" className="text-xs font-medium text-slate-600">
            Ваше сообщение
          </label>
          <textarea
            id="ticket-reply"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            placeholder="Опишите уточнение или ответьте на вопрос поддержки…"
          />
          <Button type="button" onClick={() => void send()} disabled={sending || !text.trim()}>
            {sending ? "Отправка…" : "Отправить"}
          </Button>
        </div>
      )}
    </div>
  );
}
