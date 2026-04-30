"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Notification, NotificationType, formatNotificationTimestamp } from "@/lib/notifications";

type NotificationItemProps = {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
};

function getTypeLabel(type: NotificationType) {
  switch (type) {
    case "message":
    case "new_message":
      return "Сообщения";
    case "favorite":
      return "Избранное";
    case "listing_status":
      return "Объявления";
    case "tip":
      return "Совет";
    case "similar_listing":
      return "Похоже на ваши интересы";
    case "search_alert":
      return "Поиск";
    default:
      return "Событие";
  }
}

function getTypeAccent(type: NotificationType) {
  switch (type) {
    case "message":
    case "new_message":
      return { dot: "bg-sky-500", pill: "bg-sky-50 text-sky-700 ring-sky-100" };
    case "favorite":
      return { dot: "bg-rose-500", pill: "bg-rose-50 text-rose-700 ring-rose-100" };
    case "listing_status":
      return { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 ring-emerald-100" };
    case "tip":
      return { dot: "bg-amber-500", pill: "bg-amber-50 text-amber-800 ring-amber-100" };
    case "similar_listing":
      return { dot: "bg-violet-500", pill: "bg-violet-50 text-violet-700 ring-violet-100" };
    case "search_alert":
      return { dot: "bg-cyan-500", pill: "bg-cyan-50 text-cyan-800 ring-cyan-100" };
    default:
      return { dot: "bg-slate-400", pill: "bg-slate-50 text-slate-700 ring-slate-100" };
  }
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const accent = getTypeAccent(notification.type);
  const isUnread = !notification.isRead;

  return (
    <div
      className={`group rounded-2xl border bg-white p-4 shadow-sm transition sm:p-5 ${
        isUnread
          ? "border-sky-100 ring-1 ring-sky-100/70"
          : "border-slate-200 hover:border-slate-300 hover:shadow"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <span className={`h-2.5 w-2.5 rounded-full ${accent.dot}`} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${accent.pill}`}>
              {getTypeLabel(notification.type)}
            </span>
            {isUnread ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-100">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" aria-hidden="true" />
                Новое
              </span>
            ) : null}
            <span className="ml-auto text-xs text-slate-500">{formatNotificationTimestamp(notification.createdAtIso)}</span>
          </div>

          <div className="mt-2 space-y-1">
            <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
            <p className="text-sm text-slate-600">{notification.body}</p>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {notification.link ? (
              <Link
                href={notification.link.href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-500"
              >
                {notification.link.label}
                <ExternalLink className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </Link>
            ) : (
              <span className="text-sm text-slate-500">Без ссылки</span>
            )}

            {isUnread ? (
              <button
                type="button"
                onClick={() => onMarkAsRead(notification.id)}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Отметить как прочитанное
              </button>
            ) : (
              <span className="text-sm text-slate-500">Прочитано</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

