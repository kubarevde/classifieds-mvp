"use client";

import { useMemo, useState } from "react";

import { useNotifications } from "@/components/notifications/notifications-provider";

import { NotificationFilter, NotificationFilterTabs } from "./notification-filter-tabs";
import { NotificationList } from "./notification-list";

export function NotificationsPageClient() {
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const [filter, setFilter] = useState<NotificationFilter>("all");

  const showOnlyUnread = filter === "unread";

  const primaryActionLabel = useMemo(() => {
    if (notifications.length === 0) {
      return "Нет уведомлений";
    }
    if (unreadCount === 0) {
      return "Все прочитано";
    }

    return `Отметить всё (${unreadCount})`;
  }, [notifications.length, unreadCount]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Уведомления
          </h1>
          <p className="text-sm text-slate-600 sm:text-base">
            Важные события по сообщениям, объявлениям и избранному — в одном месте.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <NotificationFilterTabs value={filter} onChange={setFilter} unreadCount={unreadCount} />
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {primaryActionLabel}
          </button>
        </div>
      </div>

      <NotificationList
        notifications={notifications}
        showOnlyUnread={showOnlyUnread}
        onMarkAsRead={markAsRead}
      />
    </div>
  );
}

