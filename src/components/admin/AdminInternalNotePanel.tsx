"use client";

import { useState } from "react";

import type { AdminInternalNote } from "@/services/admin/types";

export function AdminInternalNotePanel({
  initialNotes,
  onAdd,
}: {
  initialNotes: AdminInternalNote[];
  onAdd?: (text: string) => void;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [draft, setDraft] = useState("");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Внутренние заметки</h3>
      <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto text-sm">
        {notes.map((n) => (
          <li key={n.id} className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500">
              {n.at} · {n.author}
            </p>
            <p className="text-slate-800">{n.text}</p>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Заметка (mock)…"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="button"
          className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
          onClick={() => {
            const text = draft.trim();
            if (!text) {
              return;
            }
            const n: AdminInternalNote = {
              id: `note-${Date.now()}`,
              at: new Date().toISOString(),
              author: "Вы (mock)",
              text,
            };
            setNotes((prev) => [n, ...prev]);
            setDraft("");
            onAdd?.(text);
          }}
        >
          Добавить
        </button>
      </div>
    </div>
  );
}
