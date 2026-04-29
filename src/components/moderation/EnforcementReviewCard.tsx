"use client";

import type { ModerationQueueItem } from "@/services/moderation";

export function EnforcementReviewCard({ item }: { item: ModerationQueueItem }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Enforcement lifecycle</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{item.targetLabel}</p>
      <p className="mt-1 text-sm text-slate-600">{item.summary}</p>
    </section>
  );
}

