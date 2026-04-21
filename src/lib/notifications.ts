export type NotificationType =
  | "message"
  | "favorite"
  | "listing_status"
  | "tip"
  | "similar_listing"
  | "search_alert";

export type NotificationLink = {
  href: string;
  label: string;
};

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAtIso: string;
  isRead: boolean;
  link?: NotificationLink;
  metadata?: {
    listingId?: string;
    conversationId?: string;
    status?: string;
    savedSearchId?: string;
  };
};

export const NOTIFICATIONS_STORAGE_KEY = "classifieds-mvp:notifications";
export const NOTIFICATIONS_CHANGE_EVENT = "classifieds-notifications-change";

export function getDefaultMockNotifications(): Notification[] {
  return [
    {
      id: "n-100",
      type: "message",
      title: "Новое сообщение",
      body: "Марина уточнила детали встречи по объявлению.",
      createdAtIso: "2026-04-21T09:14:00+03:00",
      isRead: false,
      link: { href: "/messages", label: "Открыть сообщения" },
      metadata: { conversationId: "conv-1", listingId: "2" },
    },
    {
      id: "n-101",
      type: "favorite",
      title: "Добавили в избранное",
      body: "Ваше объявление «Toyota Camry 2018» добавили в избранное.",
      createdAtIso: "2026-04-21T08:26:00+03:00",
      isRead: false,
      link: { href: "/dashboard", label: "Перейти в кабинет" },
      metadata: { listingId: "1" },
    },
    {
      id: "n-102",
      type: "listing_status",
      title: "Статус объявления изменён",
      body: "Объявление «PlayStation 5» перешло в статус «На модерации».",
      createdAtIso: "2026-04-20T19:40:00+03:00",
      isRead: true,
      link: { href: "/listings/8", label: "Открыть объявление" },
      metadata: { listingId: "8", status: "На модерации" },
    },
    {
      id: "n-103",
      type: "tip",
      title: "Совет",
      body: "Добавьте 5–7 фото и подробное описание — так объявление смотрят чаще.",
      createdAtIso: "2026-04-20T13:05:00+03:00",
      isRead: false,
      link: { href: "/create-listing", label: "Подать объявление" },
    },
    {
      id: "n-104",
      type: "similar_listing",
      title: "Похожий объект",
      body: "Похоже на ваши интересы: «iPhone 14 Pro 256GB, как новый».",
      createdAtIso: "2026-04-18T11:20:00+03:00",
      isRead: true,
      link: { href: "/listings/2", label: "Посмотреть" },
      metadata: { listingId: "2" },
    },
    {
      id: "n-105",
      type: "favorite",
      title: "Избранное обновилось",
      body: "Вы добавили «Услуги электрика» в избранное — не забудьте написать продавцу.",
      createdAtIso: "2026-04-17T16:02:00+03:00",
      isRead: true,
      link: { href: "/favorites", label: "Открыть избранное" },
      metadata: { listingId: "6" },
    },
  ];
}

export function formatNotificationTimestamp(iso: string) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

type DayBucket = "today" | "yesterday" | "earlier";

export function getDayBucket(iso: string, now = new Date()): DayBucket {
  const date = new Date(iso);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (date >= startOfToday) {
    return "today";
  }

  if (date >= startOfYesterday) {
    return "yesterday";
  }

  return "earlier";
}

