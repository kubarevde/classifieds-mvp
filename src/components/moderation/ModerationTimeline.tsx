"use client";

import type { ModerationTimelineEvent } from "@/services/moderation";

export function ModerationTimeline({ events }: { events: ModerationTimelineEvent[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Timeline</h3>
      <ol className="mt-3 space-y-3">
        {events.map((event) => (
          <li key={event.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <p className="text-xs font-semibold text-slate-800">{event.body}</p>
            <p className="mt-1 text-xs text-slate-500">
              {event.actor} · {new Date(event.createdAt).toLocaleString("ru-RU")}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

