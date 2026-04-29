"use client";

import type { ModerationQueueItem } from "@/services/moderation";

export function VerificationReviewCard({ item }: { item: ModerationQueueItem }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Verification review</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{item.targetLabel}</p>
      <p className="mt-1 text-sm text-slate-600">{item.summary}</p>
    </section>
  );
}

