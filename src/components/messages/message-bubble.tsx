"use client";

import { useState } from "react";

import type { Message } from "@/services/messages";

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
  } catch {
    return iso;
  }
}

export function MessageBubble({ message, mine }: { message: Message; mine: boolean }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  return (
    <>
      <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[84%] rounded-2xl px-3 py-2 text-sm ${mine ? "rounded-br-md bg-slate-900 text-white" : "rounded-bl-md bg-slate-100 text-slate-900"}`}>
          <p className="text-[11px] opacity-80">{message.senderRole}</p>
          {message.content ? <p className="leading-6">{message.content}</p> : null}
          {message.attachments?.length ? (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {message.attachments.map((item) =>
                item.type === "image" ? (
                  <button key={item.id} type="button" onClick={() => setPreviewUrl(item.url)} className="overflow-hidden rounded-lg border border-slate-200">
                    <img src={item.url} alt={item.name} className="h-24 w-full object-cover" />
                  </button>
                ) : (
                  <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-300 bg-white/80 px-2 py-1 text-xs text-slate-700">
                    {item.name}
                  </a>
                ),
              )}
            </div>
          ) : null}
          <p className={`mt-1 text-right text-[11px] ${mine ? "text-slate-300" : "text-slate-500"}`}>
            {formatTime(message.createdAt)}{mine && message.readAt ? " • прочитано" : ""}
          </p>
        </div>
      </div>
      {previewUrl ? (
        <button type="button" onClick={() => setPreviewUrl(null)} className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6">
          <img src={previewUrl} alt="Превью вложения" className="max-h-[80vh] max-w-[90vw] rounded-xl object-contain" />
        </button>
      ) : null}
    </>
  );
}

