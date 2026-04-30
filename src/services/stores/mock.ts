import type { StoreNotification } from "./types";

const sellerNotificationsMock: StoreNotification[] = [
  {
    id: "seller-n-1",
    type: "message",
    title: "Новый диалог по объявлению",
    body: "Покупатель написал по объявлению «Ноутбук Lenovo».",
    createdAtIso: "2026-04-24T09:20:00+03:00",
    isRead: false,
    link: { href: "/dashboard/store?section=messages", label: "Открыть сообщения" },
  },
  {
    id: "seller-n-2",
    type: "listing_status",
    title: "Статус объявления обновлён",
    body: "Объявление «Samsung Galaxy S24» снова активно в выдаче.",
    createdAtIso: "2026-04-24T08:10:00+03:00",
    isRead: false,
    link: { href: "/dashboard/store", label: "Открыть кабинет" },
  },
  {
    id: "seller-n-3",
    type: "tip",
    title: "Напоминание о продвижении",
    body: "Проверьте слот «Герой доски магазина» для увеличения охвата.",
    createdAtIso: "2026-04-23T19:40:00+03:00",
    isRead: true,
    link: { href: "/dashboard/store?marketing=hero_board", label: "Открыть маркетинг" },
  },
];

export async function getStoreNotifications(): Promise<StoreNotification[]> {
  return getStoreNotificationsSync();
}

export function getStoreNotificationsSync(): StoreNotification[] {
  return structuredClone(sellerNotificationsMock);
}
