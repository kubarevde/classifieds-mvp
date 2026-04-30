import { unifiedCatalogListings } from "@/lib/listings";
import { addMessageNotification } from "@/services/notifications";
import { buyerRequestsMock } from "@/mocks/requests";
import { storefrontSellers } from "@/services/sellers/seller-data";

import type {
  Message,
  MessageAttachment,
  MessageParticipant,
  MessageSenderRole,
  MessageThread,
} from "./types";

type RawThread = Omit<MessageThread, "unreadCount">;

const DEMO_BUYER_ID = "buyer-dmitriy";

function userToSenderRole(userId: string): MessageSenderRole {
  if (userId.startsWith("buyer-")) return "buyer";
  if (userId.startsWith("seller-account:")) return "seller";
  return "support";
}

function makeSellerAccountId(storeId: string): string {
  return `seller-account:${storeId}`;
}

function isoMinusHours(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

function pickListingId(i: number): string {
  const listing = unifiedCatalogListings[i % unifiedCatalogListings.length];
  return listing ? listing.id : "1";
}

const participantsByUserId = new Map<string, MessageParticipant>();
participantsByUserId.set(DEMO_BUYER_ID, {
  userId: DEMO_BUYER_ID,
  name: "Дмитрий П.",
  role: "buyer",
  isOnline: true,
  lastSeenAt: null,
});

for (const req of buyerRequestsMock.slice(0, 8)) {
  participantsByUserId.set(req.authorId, {
    userId: req.authorId,
    name: req.authorName,
    role: "buyer",
    isOnline: false,
    lastSeenAt: isoMinusHours((req.id.length % 5) + 1),
  });
}

for (const seller of storefrontSellers) {
  const uid = makeSellerAccountId(seller.id);
  participantsByUserId.set(uid, {
    userId: uid,
    name: seller.storefrontName,
    role: "store_owner",
    isOnline: seller.id.length % 2 === 0,
    lastSeenAt: seller.id.length % 2 === 0 ? null : isoMinusHours((seller.id.length % 6) + 1),
  });
}

const rawThreads: RawThread[] = [
  {
    id: "thread-1001",
    participantIds: [DEMO_BUYER_ID, makeSellerAccountId("marina-tech")],
    listingId: pickListingId(1),
    requestId: null,
    storeId: "marina-tech",
    lastMessage: "Могу показать завтра после 18:00.",
    lastMessageAt: isoMinusHours(2),
    status: "open",
  },
  {
    id: "thread-1002",
    participantIds: [DEMO_BUYER_ID, makeSellerAccountId("alexey-drive")],
    listingId: pickListingId(2),
    requestId: null,
    storeId: "alexey-drive",
    lastMessage: "Торг небольшой возможен на месте.",
    lastMessageAt: isoMinusHours(6),
    status: "open",
  },
  {
    id: "thread-1003",
    participantIds: [DEMO_BUYER_ID, makeSellerAccountId("ildar-estate")],
    listingId: pickListingId(3),
    requestId: null,
    storeId: "ildar-estate",
    lastMessage: "Документы подготовим к просмотру.",
    lastMessageAt: isoMinusHours(12),
    status: "open",
  },
  {
    id: "thread-1004",
    participantIds: [makeSellerAccountId("marina-tech"), "buyer-maria"],
    listingId: pickListingId(4),
    requestId: null,
    storeId: "marina-tech",
    lastMessage: "Да, чек и гарантия есть.",
    lastMessageAt: isoMinusHours(5),
    status: "open",
  },
  {
    id: "thread-1005",
    participantIds: [makeSellerAccountId("marina-tech"), "buyer-anna"],
    listingId: null,
    requestId: "req-4",
    storeId: "marina-tech",
    lastMessage: "Отправил предложение и примеры работ.",
    lastMessageAt: isoMinusHours(9),
    status: "open",
  },
  {
    id: "thread-1006",
    participantIds: [makeSellerAccountId("alexey-drive"), "buyer-ksenia"],
    listingId: null,
    requestId: "req-7",
    storeId: "alexey-drive",
    lastMessage: "Можем встретиться сегодня вечером.",
    lastMessageAt: isoMinusHours(20),
    status: "open",
  },
  {
    id: "thread-1007",
    participantIds: [DEMO_BUYER_ID, makeSellerAccountId("agro-tech")],
    listingId: null,
    requestId: null,
    storeId: "agro-tech",
    lastMessage: "Есть ещё варианты по вашему бюджету.",
    lastMessageAt: isoMinusHours(30),
    status: "open",
  },
  {
    id: "thread-1008",
    participantIds: [DEMO_BUYER_ID, makeSellerAccountId("marina-tech")],
    listingId: pickListingId(7),
    requestId: null,
    storeId: "marina-tech",
    lastMessage: "Тред закрыт после сделки, спасибо.",
    lastMessageAt: isoMinusHours(48),
    status: "archived",
  },
  {
    id: "thread-1009",
    participantIds: [makeSellerAccountId("agro-tech"), "buyer-vadim"],
    listingId: null,
    requestId: "req-10",
    storeId: "agro-tech",
    lastMessage: "Нужны реквизиты для счёта.",
    lastMessageAt: isoMinusHours(18),
    status: "open",
  },
  {
    id: "thread-1010",
    participantIds: [makeSellerAccountId("ildar-estate"), "buyer-svetlana"],
    listingId: null,
    requestId: "req-9",
    storeId: "ildar-estate",
    lastMessage: "Есть студия рядом с метро, отправил детали.",
    lastMessageAt: isoMinusHours(15),
    status: "open",
  },
  {
    id: "thread-1011",
    participantIds: [DEMO_BUYER_ID, makeSellerAccountId("marina-tech")],
    listingId: pickListingId(8),
    requestId: null,
    storeId: "marina-tech",
    lastMessage: "Сделал дополнительные фото в хорошем свете.",
    lastMessageAt: isoMinusHours(1),
    status: "open",
  },
];

let threadsState: RawThread[] = rawThreads.map((row) => ({ ...row }));

let messagesState: Message[] = [
  {
    id: "msg-1",
    threadId: "thread-1001",
    senderId: DEMO_BUYER_ID,
    senderRole: "buyer",
    content: "Здравствуйте! По объявлению актуально?",
    createdAt: isoMinusHours(4),
    readAt: isoMinusHours(3.8),
  },
  {
    id: "msg-2",
    threadId: "thread-1001",
    senderId: makeSellerAccountId("marina-tech"),
    senderRole: "store_owner",
    content: "Да, актуально. Когда вам удобно посмотреть?",
    createdAt: isoMinusHours(3.6),
    readAt: isoMinusHours(3.3),
  },
  {
    id: "msg-3",
    threadId: "thread-1001",
    senderId: DEMO_BUYER_ID,
    senderRole: "buyer",
    content: "Подойдёт завтра после 18:00.",
    createdAt: isoMinusHours(2.5),
    readAt: null,
  },
  {
    id: "msg-4",
    threadId: "thread-1001",
    senderId: makeSellerAccountId("marina-tech"),
    senderRole: "store_owner",
    content: "Могу показать завтра после 18:00.",
    createdAt: isoMinusHours(2),
    readAt: null,
  },
];

for (const thread of threadsState) {
  if (messagesState.some((m) => m.threadId === thread.id)) continue;
  const baseHours = 8 + thread.id.length;
  messagesState.push(
    {
      id: `seed-${thread.id}-1`,
      threadId: thread.id,
      senderId: thread.participantIds[0] ?? DEMO_BUYER_ID,
      senderRole: userToSenderRole(thread.participantIds[0] ?? DEMO_BUYER_ID),
      content: "Здравствуйте! Пишу по контексту сделки.",
      createdAt: isoMinusHours(baseHours + 2),
      readAt: isoMinusHours(baseHours + 1.5),
    },
    {
      id: `seed-${thread.id}-2`,
      threadId: thread.id,
      senderId: thread.participantIds[1] ?? makeSellerAccountId("marina-tech"),
      senderRole: userToSenderRole(thread.participantIds[1] ?? makeSellerAccountId("marina-tech")),
      content: thread.lastMessage,
      createdAt: thread.lastMessageAt,
      readAt: null,
    },
  );
}

const unreadByThreadByUser = new Map<string, Map<string, number>>();

function seedUnread() {
  for (const thread of threadsState) {
    const unreadMap = new Map<string, number>();
    for (const uid of thread.participantIds) {
      let count = 0;
      if (uid === DEMO_BUYER_ID && (thread.id === "thread-1001" || thread.id === "thread-1011")) {
        count = 2;
      } else if (uid.startsWith("seller-account:") && thread.id.endsWith("5")) {
        count = 1;
      }
      unreadMap.set(uid, count);
    }
    unreadByThreadByUser.set(thread.id, unreadMap);
  }
}

seedUnread();

function uid(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sortThreads(rows: RawThread[]): RawThread[] {
  return [...rows].sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

function hydrateThreadForUser(thread: RawThread, userId: string): MessageThread {
  const unread = unreadByThreadByUser.get(thread.id)?.get(userId) ?? 0;
  return { ...thread, unreadCount: unread };
}

function touchThread(threadId: string, lastMessage: string, lastMessageAt: string) {
  threadsState = threadsState.map((row) => (row.id === threadId ? { ...row, lastMessage, lastMessageAt } : row));
}

export async function getMyThreads(userId: string): Promise<MessageThread[]> {
  const rows = sortThreads(threadsState.filter((thread) => thread.participantIds.includes(userId)));
  return rows.map((row) => hydrateThreadForUser(row, userId));
}

export async function getThread(threadId: string): Promise<MessageThread | null> {
  const row = threadsState.find((thread) => thread.id === threadId);
  return row ? { ...row, unreadCount: 0 } : null;
}

export async function getMessages(threadId: string): Promise<Message[]> {
  return messagesState
    .filter((msg) => msg.threadId === threadId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((msg) => ({ ...msg }));
}

export async function getParticipant(userId: string): Promise<MessageParticipant | null> {
  return participantsByUserId.get(userId) ?? null;
}

export async function sendMessage(input: {
  threadId: string;
  senderId: string;
  senderRole: MessageSenderRole;
  content?: string;
  attachments?: MessageAttachment[];
}): Promise<Message> {
  const text = (input.content ?? "").trim();
  const attachments = input.attachments?.filter((item) => item.url && item.name) ?? [];
  if (!text && attachments.length === 0) {
    throw new Error("Нужно добавить текст или вложение");
  }
  const thread = threadsState.find((row) => row.id === input.threadId);
  if (!thread) {
    throw new Error("Тред не найден");
  }
  const createdAt = new Date().toISOString();
  const message: Message = {
    id: uid("msg"),
    threadId: input.threadId,
    senderId: input.senderId,
    senderRole: input.senderRole,
    content: text,
    createdAt,
    readAt: null,
    attachments: attachments.length > 0 ? attachments : undefined,
  };
  messagesState = [...messagesState, message];
  touchThread(thread.id, text || (attachments.length > 0 ? `Вложение: ${attachments[0]?.name ?? "файл"}` : "Сообщение"), createdAt);

  for (const participantId of thread.participantIds) {
    const current = unreadByThreadByUser.get(thread.id) ?? new Map<string, number>();
    if (participantId === input.senderId) {
      current.set(participantId, 0);
      unreadByThreadByUser.set(thread.id, current);
      continue;
    }
    current.set(participantId, (current.get(participantId) ?? 0) + 1);
    unreadByThreadByUser.set(thread.id, current);

    await addMessageNotification({
      userId: participantId,
      threadId: thread.id,
      fromUserId: input.senderId,
      preview: text || `Вложение: ${attachments[0]?.name ?? "файл"}`,
    });
  }

  return { ...message };
}

export async function markThreadRead(threadId: string, userId: string): Promise<void> {
  const unread = unreadByThreadByUser.get(threadId) ?? new Map<string, number>();
  unread.set(userId, 0);
  unreadByThreadByUser.set(threadId, unread);
  const nowIso = new Date().toISOString();
  messagesState = messagesState.map((msg) => {
    if (msg.threadId !== threadId || msg.senderId === userId) {
      return msg;
    }
    return { ...msg, readAt: msg.readAt ?? nowIso };
  });
}

export async function createThread(input: {
  starterId: string;
  otherUserId: string;
  listingId?: string | null;
  requestId?: string | null;
  storeId?: string | null;
}): Promise<MessageThread> {
  const existing = threadsState.find((thread) => {
    const sameParticipants =
      thread.participantIds.length === 2 &&
      thread.participantIds.includes(input.starterId) &&
      thread.participantIds.includes(input.otherUserId);
    if (!sameParticipants) return false;
    return (
      (thread.listingId ?? null) === (input.listingId ?? null) &&
      (thread.requestId ?? null) === (input.requestId ?? null) &&
      (thread.storeId ?? null) === (input.storeId ?? null)
    );
  });
  if (existing) {
    return { ...existing, unreadCount: unreadByThreadByUser.get(existing.id)?.get(input.starterId) ?? 0 };
  }

  const createdAt = new Date().toISOString();
  const threadId = uid("thread");
  const thread: RawThread = {
    id: threadId,
    participantIds: [input.starterId, input.otherUserId],
    listingId: input.listingId ?? null,
    requestId: input.requestId ?? null,
    storeId: input.storeId ?? null,
    lastMessage: "Диалог создан. Напишите первое сообщение.",
    lastMessageAt: createdAt,
    status: "open",
  };
  threadsState = [thread, ...threadsState];
  unreadByThreadByUser.set(threadId, new Map([[input.starterId, 0], [input.otherUserId, 0]]));
  return { ...thread, unreadCount: 0 };
}

export async function getUnreadCount(userId: string): Promise<number> {
  let total = 0;
  for (const thread of threadsState) {
    if (!thread.participantIds.includes(userId)) continue;
    total += unreadByThreadByUser.get(thread.id)?.get(userId) ?? 0;
  }
  return total;
}
