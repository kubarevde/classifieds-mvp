"use client";

import { useMemo, useState } from "react";

import { useNotifications } from "@/components/notifications/notifications-provider";
import { Button, Card } from "@/components/ui";

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
      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
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
          <Button type="button" variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            {primaryActionLabel}
          </Button>
        </div>
      </Card>

      <NotificationList
        notifications={notifications}
        showOnlyUnread={showOnlyUnread}
        onMarkAsRead={markAsRead}
      />
    </div>
  );
}

