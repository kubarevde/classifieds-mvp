"use client";

import { Notification, getDayBucket } from "@/lib/notifications";

import { EmptyNotificationsState } from "./empty-notifications-state";
import { NotificationItem } from "./notification-item";

type NotificationListProps = {
  notifications: Notification[];
  showOnlyUnread: boolean;
  onMarkAsRead: (id: string) => void;
};

type Group = {
  id: "today" | "yesterday" | "earlier";
  title: string;
  items: Notification[];
};

function groupNotifications(notifications: Notification[]) {
  const groups: Record<Group["id"], Group> = {
    today: { id: "today", title: "Сегодня", items: [] },
    yesterday: { id: "yesterday", title: "Вчера", items: [] },
    earlier: { id: "earlier", title: "Ранее", items: [] },
  };

  notifications.forEach((notification) => {
    groups[getDayBucket(notification.createdAtIso)].items.push(notification);
  });

  return [groups.today, groups.yesterday, groups.earlier].filter((group) => group.items.length > 0);
}

export function NotificationList({
  notifications,
  showOnlyUnread,
  onMarkAsRead,
}: NotificationListProps) {
  const filtered = showOnlyUnread ? notifications.filter((item) => !item.isRead) : notifications;

  if (filtered.length === 0) {
    return <EmptyNotificationsState variant={showOnlyUnread ? "all_read" : "empty"} />;
  }

  const grouped = groupNotifications(filtered);

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <section key={group.id} className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {group.title}
            </h2>
            <div className="h-px flex-1 bg-slate-200" aria-hidden="true" />
          </div>
          <div className="space-y-3">
            {group.items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

