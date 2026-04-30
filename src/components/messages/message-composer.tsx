"use client";

import { useEffect, useRef, useState } from "react";

import { messageTemplatesService, type MessageTemplate } from "@/services/message-templates";
import type { MessageAttachment, MessageSenderRole } from "@/services/messages";

function toSizeLabel(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

export function MessageComposer({
  role,
  placeholder,
  onSend,
  suggestMode = "dropdown",
}: {
  role: MessageSenderRole;
  placeholder?: string;
  onSend: (input: { content: string; attachments: MessageAttachment[] }) => Promise<void> | void;
  suggestMode?: "dropdown" | "chips";
}) {
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [suggested, setSuggested] = useState<MessageTemplate[]>([]);
  const [openQuickReplies, setOpenQuickReplies] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    void messageTemplatesService.getTemplatesForRole(role).then(setTemplates);
    void messageTemplatesService
      .getSuggestedTemplates({ role, hasListingContext: true })
      .then(setSuggested);
  }, [role]);

  const canSend = draft.trim().length > 0 || attachments.length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSend) return;
        const current = attachments;
        void onSend({ content: draft.trim(), attachments: current });
        setDraft("");
        setAttachments([]);
      }}
      className="border-t border-slate-200 p-3"
    >
      {suggestMode === "chips" && suggested.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {suggested.map((item) => (
            <button key={item.id} type="button" onClick={() => setDraft(item.text)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100">
              {item.title}
            </button>
          ))}
        </div>
      ) : null}
      {attachments.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((file) => (
            <div key={file.id} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700">
              <span>{file.name}</span>
              <button type="button" onClick={() => setAttachments((prev) => prev.filter((x) => x.id !== file.id))} className="text-slate-500 hover:text-slate-900">✕</button>
            </div>
          ))}
        </div>
      ) : null}
      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <button type="button" onClick={() => inputRef.current?.click()} className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-700 hover:bg-slate-50">
            📎
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              const mapped: MessageAttachment[] = files.map((file) => ({
                id: `local-attachment-${Date.now()}-${file.name}`,
                type: file.type.startsWith("image/") ? "image" : "file",
                url: URL.createObjectURL(file),
                name: file.name,
                mimeType: file.type,
                sizeLabel: toSizeLabel(file.size),
              }));
              setAttachments((prev) => [...prev, ...mapped]);
              e.currentTarget.value = "";
            }}
          />
          <button type="button" onClick={() => setOpenQuickReplies((prev) => !prev)} className="h-11 rounded-xl border border-slate-200 px-3 text-xs text-slate-700 hover:bg-slate-50">
            Быстрые ответы
          </button>
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          placeholder={placeholder ?? "Введите сообщение..."}
          className="min-h-11 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!canSend) return;
              void onSend({ content: draft.trim(), attachments });
              setDraft("");
              setAttachments([]);
            }
          }}
        />
        <button type="submit" disabled={!canSend} className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-50">
          Отправить
        </button>
      </div>
      {openQuickReplies ? (
        <div className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
          {templates.map((item) => (
            <button key={item.id} type="button" onClick={() => { setDraft(item.text); setOpenQuickReplies(false); }} className="block w-full rounded-lg px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
              <span className="block font-medium text-slate-900">{item.title}</span>
              <span className="line-clamp-1 text-xs">{item.text}</span>
            </button>
          ))}
        </div>
      ) : null}
    </form>
  );
}

