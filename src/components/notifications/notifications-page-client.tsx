"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useNotifications } from "@/components/notifications/notifications-provider";
import { useSavedSearches } from "@/components/saved-searches/saved-searches-provider";
import { Button, Card } from "@/components/ui";
import { buildSearchHrefFromIntent } from "@/lib/saved-searches";

import { NotificationFilter, NotificationFilterTabs } from "./notification-filter-tabs";
import { NotificationList } from "./notification-list";

export function NotificationsPageClient() {
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const { searches, getNewMatchesCount, getMatchingListings } = useSavedSearches();
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
      <Card className="p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-slate-900">Новые по вашим поискам</h2>
        <div className="mt-3 space-y-2">
          {searches.slice(0, 4).map((search) => {
            const count = getNewMatchesCount(search.id);
            const preview = getMatchingListings(search.id)
              .slice(0, 2)
              .map((item) => item.title)
              .join(", ");
            return (
              <article key={search.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{search.title ?? search.intent.autoTitle}</p>
                  <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800">
                    {search.intent.mode}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-700">Новых совпадений: {count}</p>
                <p className="text-xs text-slate-600">{preview || "Пока без новых совпадений"}</p>
                <Link
                  href={buildSearchHrefFromIntent(search.intent)}
                  className="mt-2 inline-flex text-xs font-semibold text-slate-800 underline underline-offset-2"
                >
                  Посмотреть
                </Link>
              </article>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

