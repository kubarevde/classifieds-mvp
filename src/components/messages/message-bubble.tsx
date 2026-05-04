"use client";

import Link from "next/link";
import { Fragment, useState } from "react";

import type { Message } from "@/services/messages";

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
  } catch {
    return iso;
  }
}

function renderBodyWithLinks(text: string) {
  const re = /(\/deals\/[a-z0-9-]+|\/reviews\/new\?[^\s]+)/gi;
  const parts = text.split(re);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("/deals/")) {
      return (
        <Link key={`${i}-${part}`} href={part} className="font-semibold underline underline-offset-2">
          Открыть сделку
        </Link>
      );
    }
    if (part.startsWith("/reviews/new")) {
      return (
        <Link key={`${i}-${part}`} href={part} className="font-semibold underline underline-offset-2">
          Оставить отзыв
        </Link>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function MessageBubble({ message, mine }: { message: Message; mine: boolean }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  return (
    <>
      <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[84%] rounded-2xl px-3 py-2 text-sm ${mine ? "rounded-br-md bg-slate-900 text-white" : "rounded-bl-md bg-slate-100 text-slate-900"}`}>
          <p className="text-[11px] opacity-80">{message.senderRole}</p>
          {message.body ? <p className="leading-6">{renderBodyWithLinks(message.body)}</p> : null}
          {message.attachments?.length ? (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {message.attachments.map((item) =>
                item.type === "image" ? (
                  <button key={item.id} type="button" onClick={() => setPreviewUrl(item.url)} className="overflow-hidden rounded-lg border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
            {formatTime(message.timestamp)}
            {mine && message.read ? " • прочитано" : ""}
          </p>
        </div>
      </div>
      {previewUrl ? (
        <button type="button" onClick={() => setPreviewUrl(null)} className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Превью вложения" className="max-h-[80vh] max-w-[90vw] rounded-xl object-contain" />
        </button>
      ) : null}
    </>
  );
}

