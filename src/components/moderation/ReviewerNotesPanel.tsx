"use client";

import { useState } from "react";

import type { ModerationCaseNote } from "@/services/moderation";

export function ReviewerNotesPanel({
  notes,
  onAdd,
  reviewer,
  caseId,
}: {
  notes: ModerationCaseNote[];
  onAdd: (caseId: string, input: { author: string; body: string }) => void;
  reviewer: string;
  caseId: string;
}) {
  const [value, setValue] = useState("");
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Reviewer notes</h3>
      <div className="mt-3 space-y-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Добавить note..."
        />
        <button
          type="button"
          onClick={() => {
            const body = value.trim();
            if (!body) return;
            onAdd(caseId, { author: reviewer, body });
            setValue("");
          }}
          className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white"
        >
          Добавить note
        </button>
      </div>
      <ul className="mt-3 space-y-2">
        {notes.map((note) => (
          <li key={note.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <p className="text-sm text-slate-700">{note.body}</p>
            <p className="mt-1 text-xs text-slate-500">
              {note.author} · {new Date(note.createdAt).toLocaleString("ru-RU")}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

