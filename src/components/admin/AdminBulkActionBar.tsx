"use client";

import type { ReactNode } from "react";

export function AdminBulkActionBar({
  selectedCount,
  context,
  onClearSelection,
  children,
}: {
  selectedCount: number;
  context?: string;
  onClearSelection: () => void;
  children: ReactNode;
}) {
  if (selectedCount < 1) {
    return null;
  }

  return (
    <div className="sticky bottom-3 z-30 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-900 bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
      <div className="min-w-0">
        <p className="font-semibold">Выбрано: {selectedCount}</p>
        {context ? <p className="mt-0.5 text-xs text-slate-300">{context}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <button
        type="button"
        onClick={onClearSelection}
        className="shrink-0 rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-800"
      >
        Снять выбор
      </button>
    </div>
  );
}
