import { allListings } from "@/lib/listings";

export type MessageAuthor = "me" | "other";

export type Message = {
  id: string;
  author: MessageAuthor;
  text: string;
  sentAtIso: string;
};

export type Conversation = {
  id: string;
  participantName: string;
  participantRole: "Продавец" | "Покупатель";
  listingId: string;
  messages: Message[];
  unreadCount: number;
};

export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    participantName: "Марина",
    participantRole: "Продавец",
    listingId: "2",
    unreadCount: 2,
    messages: [
      {
        id: "m-1",
        author: "me",
        text: "Здравствуйте! Телефон еще в наличии?",
        sentAtIso: "2026-04-20T14:05:00+03:00",
      },
      {
        id: "m-2",
        author: "other",
        text: "Добрый день, да, в наличии.",
        sentAtIso: "2026-04-20T14:08:00+03:00",
      },
      {
        id: "m-3",
        author: "other",
        text: "Могу встретиться сегодня после 19:00 у метро Петроградская.",
        sentAtIso: "2026-04-20T14:09:00+03:00",
      },
    ],
  },
  {
    id: "conv-2",
    participantName: "Роман",
    participantRole: "Продавец",
    listingId: "8",
    unreadCount: 0,
    messages: [
      {
        id: "m-4",
        author: "other",
        text: "Добрый день! Консоль без ремонта, чек есть.",
        sentAtIso: "2026-04-20T12:30:00+03:00",
      },
      {
        id: "m-5",
        author: "me",
        text: "Супер, а торг возможен?",
        sentAtIso: "2026-04-20T12:33:00+03:00",
      },
      {
        id: "m-6",
        author: "other",
        text: "Можем обсудить при встрече, небольшая скидка возможна.",
        sentAtIso: "2026-04-20T12:36:00+03:00",
      },
    ],
  },
  {
    id: "conv-3",
    participantName: "Денис",
    participantRole: "Покупатель",
    listingId: "1",
    unreadCount: 1,
    messages: [
      {
        id: "m-7",
        author: "other",
        text: "Здравствуйте, интересует Camry. Есть сервисная книга?",
        sentAtIso: "2026-04-20T11:10:00+03:00",
      },
      {
        id: "m-8",
        author: "me",
        text: "Да, все отметки есть. Могу отправить фото.",
        sentAtIso: "2026-04-20T11:15:00+03:00",
      },
      {
        id: "m-9",
        author: "other",
        text: "Отлично, пришлите пожалуйста в чат.",
        sentAtIso: "2026-04-20T11:17:00+03:00",
      },
    ],
  },
];

export function getConversationListing(listingId: string) {
  return allListings.find((listing) => listing.id === listingId);
}

export function getConversationLastMessage(conversation: Conversation) {
  return conversation.messages[conversation.messages.length - 1] ?? null;
}

export function getMockUnreadMessagesCount() {
  return mockConversations.reduce((total, conversation) => total + conversation.unreadCount, 0);
}
