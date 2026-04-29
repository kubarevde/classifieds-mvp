"use client";

import { useState } from "react";

import { AdminStickyActionBar } from "@/components/admin/AdminStickyActionBar";
import type { ModerationDecision } from "@/services/moderation";

export function ModerationDecisionBar({
  onDecision,
  actions,
}: {
  onDecision: (decision: ModerationDecision, note?: string) => void;
  actions: { decision: ModerationDecision; label: string; destructive?: boolean }[];
}) {
  const [note, setNote] = useState("");
  return (
    <AdminStickyActionBar>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Decision bar</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.decision}
            type="button"
            onClick={() => {
              if (action.destructive && !window.confirm("Подтвердить действие?")) return;
              onDecision(action.decision, note);
            }}
            className={`inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold ${
              action.destructive ? "bg-rose-600 text-white" : "bg-slate-900 text-white"
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        placeholder="Комментарий к решению (опционально)"
      />
    </AdminStickyActionBar>
  );
}

