"use client";

import { useMemo, useState } from "react";

import type { AdminInternalNote } from "@/services/admin";
import { appendAdminEntityNote, getAdminEntityNotes, type AdminNoteEntityType } from "@/services/admin";

import { useAdminConsole } from "./admin-console-context";

function formatAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ru-RU");
  } catch {
    return iso;
  }
}

const PERSONA_AUTHOR: Record<string, string> = {
  admin: "Админ",
  moderator: "Модератор",
  support: "Поддержка",
  finance: "Финансы",
  none: "Оператор",
};

export function AdminNotesPanel({
  entityType,
  entityId,
  title = "Внутренние заметки",
}: {
  entityType: AdminNoteEntityType;
  entityId: string;
  title?: string;
}) {
  const { persona } = useAdminConsole();
  const authorBase = PERSONA_AUTHOR[persona] ?? "Оператор";
  const [tick, setTick] = useState(0);
  const [draft, setDraft] = useState("");

  const notes = useMemo(() => {
    void tick;
    return getAdminEntityNotes(entityType, entityId);
  }, [entityType, entityId, tick]);

  return (
    <section className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-600">Видно только в консоли (mock, сессия).</p>
        </div>
      </div>
      <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto text-sm">
        {notes.length === 0 ? (
          <li className="rounded-lg border border-dashed border-amber-200 bg-white/60 px-3 py-4 text-center text-slate-500">Заметок пока нет</li>
        ) : (
          notes.map((n: AdminInternalNote) => (
            <li key={n.id} className="rounded-lg border border-amber-100 bg-white px-3 py-2 shadow-sm">
              <p className="text-xs text-slate-500">
                {formatAt(n.at)} · <span className="font-medium text-slate-700">{n.author}</span>
              </p>
              <p className="mt-1 text-slate-800">{n.text}</p>
            </li>
          ))
        )}
      </ul>
      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Добавить заметку…"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
        <button
          type="button"
          className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
          onClick={() => {
            const text = draft.trim();
            if (!text) return;
            appendAdminEntityNote(entityType, entityId, `${authorBase} (mock)`, text);
            setDraft("");
            setTick((x) => x + 1);
          }}
        >
          Добавить
        </button>
      </div>
    </section>
  );
}
