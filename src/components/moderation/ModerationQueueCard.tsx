"use client";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import type { ModerationQueueItem } from "@/services/moderation";

function priorityClass(priority: ModerationQueueItem["priority"]) {
  if (priority === "urgent") return "border-rose-200 bg-rose-50 text-rose-900";
  if (priority === "high") return "border-amber-200 bg-amber-50 text-amber-900";
  if (priority === "medium") return "border-sky-200 bg-sky-50 text-sky-900";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function ModerationQueueCard({
  item,
  href,
  selectable,
  selected,
  onToggleSelected,
}: {
  item: ModerationQueueItem;
  href: string;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelected?: () => void;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3">
      {selectable ? (
        <label className="mb-2 flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
          <input type="checkbox" checked={!!selected} onChange={onToggleSelected} className="rounded border-slate-300" />
          Выбрать для массовых действий
        </label>
      ) : null}
      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{item.targetLabel}</p>
          <p className="text-xs text-slate-500">
            {item.id} · {item.queueType} · {item.targetType}
          </p>
        </div>
        <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${priorityClass(item.priority)}`}>Приоритет: {item.priority}</span>
        <span className="text-xs text-slate-500">{item.assignedTo ? `Назначено: ${item.assignedTo}` : "Назначено: —"}</span>
      </div>
      <p className="mt-2 text-sm text-slate-600">{item.summary}</p>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>Статус: {item.status}</span>
        <span>Обновлено: {new Date(item.updatedAt).toLocaleDateString("ru-RU")}</span>
      </div>
      <div className="mt-3">
        <AdminInternalLink href={href} className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white">
          Открыть кейс
        </AdminInternalLink>
      </div>
    </article>
  );
}

