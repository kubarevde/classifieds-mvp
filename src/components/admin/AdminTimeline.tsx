import type { AdminAuditEvent } from "@/services/admin/types";

export function AdminTimeline({ events, title = "События" }: { events: AdminAuditEvent[]; title?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <ul className="mt-3 space-y-3">
        {events.map((e) => (
          <li key={e.id} className="relative border-l-2 border-slate-200 pl-4 text-sm">
            <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-slate-400" />
            <p className="font-medium text-slate-900">{e.action}</p>
            <p className="text-xs text-slate-500">
              {e.at} · {e.actor}
            </p>
            <p className="text-slate-700">{e.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
