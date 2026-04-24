import type { Conversation } from "@/lib/messages";
import type { Notification } from "@/lib/notifications";

export const sellerConversationsMock: Conversation[] = [
  {
    id: "seller-conv-1",
    participantName: "Ирина К.",
    participantRole: "Покупатель",
    listingId: "2",
    unreadCount: 2,
    messages: [
      {
        id: "seller-m-1",
        author: "other",
        text: "Здравствуйте, ноутбук ещё в наличии?",
        sentAtIso: "2026-04-24T09:10:00+03:00",
      },
      {
        id: "seller-m-2",
        author: "me",
        text: "Да, в наличии. Могу отправить доп. фото.",
        sentAtIso: "2026-04-24T09:13:00+03:00",
      },
      {
        id: "seller-m-3",
        author: "other",
        text: "Отлично, пришлите пожалуйста.",
        sentAtIso: "2026-04-24T09:18:00+03:00",
      },
    ],
  },
  {
    id: "seller-conv-2",
    participantName: "Максим П.",
    participantRole: "Покупатель",
    listingId: "8",
    unreadCount: 1,
    messages: [
      {
        id: "seller-m-4",
        author: "other",
        text: "Добрый день! Можно самовывоз завтра?",
        sentAtIso: "2026-04-24T08:45:00+03:00",
      },
      {
        id: "seller-m-5",
        author: "me",
        text: "Да, после 12:00 удобно.",
        sentAtIso: "2026-04-24T08:51:00+03:00",
      },
    ],
  },
];

export const sellerNotificationsMock: Notification[] = [
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
