"use client";

import type { ModerationQueueItem } from "@/services/moderation";

export function CaseReviewPanel({ item }: { item: ModerationQueueItem }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-base font-semibold text-slate-900">{item.targetLabel}</h2>
      <p className="mt-1 text-sm text-slate-600">{item.summary}</p>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
        <div>
          <dt className="text-slate-500">Case ID</dt>
          <dd className="font-mono text-slate-800">{item.id}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Queue</dt>
          <dd className="text-slate-800">{item.queueType}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Priority</dt>
          <dd className="text-slate-800">{item.priority}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Status</dt>
          <dd className="text-slate-800">{item.status}</dd>
        </div>
      </dl>
    </section>
  );
}

