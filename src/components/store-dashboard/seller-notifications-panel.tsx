"use client";

import { useMemo, useState } from "react";

import { NotificationFilter, NotificationFilterTabs } from "@/components/notifications/notification-filter-tabs";
import { NotificationList } from "@/components/notifications/notification-list";
import { Button, Card } from "@/components/ui";
import { sellerNotificationsMock } from "@/lib/seller-activity-mock";

export function SellerNotificationsPanel({
  onUnreadChange,
}: {
  onUnreadChange: (count: number) => void;
}) {
  const [notifications, setNotifications] = useState(() => structuredClone(sellerNotificationsMock));
  const [filter, setFilter] = useState<NotificationFilter>("all");

  const unreadCount = useMemo(
    () => notifications.reduce((sum, item) => sum + (item.isRead ? 0 : 1), 0),
    [notifications],
  );

  function markAsRead(id: string) {
    setNotifications((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, isRead: true } : item));
      onUnreadChange(next.reduce((sum, item) => sum + (item.isRead ? 0 : 1), 0));
      return next;
    });
  }

  function markAllAsRead() {
    setNotifications((prev) => {
      const next = prev.map((item) => ({ ...item, isRead: true }));
      onUnreadChange(0);
      return next;
    });
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Уведомления магазина</h2>
          <p className="text-sm text-slate-600">События по сообщениям, объявлениям и маркетингу витрины.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
          <NotificationFilterTabs value={filter} onChange={setFilter} unreadCount={unreadCount} />
          <Button className="w-full sm:w-auto" variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            Отметить всё прочитанным
          </Button>
        </div>
      </div>

      <NotificationList
        notifications={notifications}
        showOnlyUnread={filter === "unread"}
        onMarkAsRead={markAsRead}
      />
    </Card>
  );
}
