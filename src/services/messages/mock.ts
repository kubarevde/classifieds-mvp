import { unifiedCatalogListings } from "@/lib/listings";
import { addMessageNotification } from "@/services/notifications";
import { buyerRequestsMock } from "@/mocks/requests";
import { getStorefrontSellerById, storefrontSellers } from "@/services/sellers/seller-data";

import type {
  Message,
  MessageAttachment,
  MessageContext,
  MessageContextEntityType,
  MessageParticipant,
  MessageSenderRole,
  MessageThread,
  MessageThreadStatus,
  ThreadKind,
  ThreadParticipant,
} from "./types";

const DEMO_BUYER_ID = "buyer-dmitriy";
export const SUPPORT_AGENT_USER_ID = "support-agent-classify";
/** Системные уведомления по сделкам/офферам (P32). */
export const DEALS_SYSTEM_USER_ID = "classify-offers-bot";
/** Системные уведомления по отзывам (P33). */
export const REVIEWS_SYSTEM_USER_ID = "classify-reviews-bot";

type RawThread = Omit<MessageThread, "unreadCount">;

function userToSenderRole(userId: string): MessageSenderRole {
  if (userId.startsWith("buyer-")) return "buyer";
  if (userId.startsWith("seller-account:")) return "store_owner";
  if (userId === SUPPORT_AGENT_USER_ID || userId === DEALS_SYSTEM_USER_ID || userId === REVIEWS_SYSTEM_USER_ID) return "support";
  return "support";
}

function participantRole(userId: string): ThreadParticipant["role"] {
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

function tp(userId: string, name: string): ThreadParticipant {
  return { userId, role: participantRole(userId), name, avatar: null };
}

const participantsByUserId = new Map<string, MessageParticipant>();
participantsByUserId.set(DEMO_BUYER_ID, {
  userId: DEMO_BUYER_ID,
  name: "Дмитрий П.",
  role: "buyer",
  isOnline: true,
  lastSeenAt: null,
});

participantsByUserId.set(SUPPORT_AGENT_USER_ID, {
  userId: SUPPORT_AGENT_USER_ID,
  name: "Поддержка Classify",
  role: "support",
  isOnline: true,
  lastSeenAt: null,
});

participantsByUserId.set(DEALS_SYSTEM_USER_ID, {
  userId: DEALS_SYSTEM_USER_ID,
  name: "Система сделок",
  role: "support",
  isOnline: true,
  lastSeenAt: null,
});

participantsByUserId.set(REVIEWS_SYSTEM_USER_ID, {
  userId: REVIEWS_SYSTEM_USER_ID,
  name: "Система отзывов",
  role: "support",
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

function row(
  id: string,
  type: ThreadKind,
  contextEntityType: MessageContextEntityType,
  contextEntityId: string,
  p1: ThreadParticipant,
  p2: ThreadParticipant,
  lastMessage: string,
  lastMessageAt: string,
  status: MessageThreadStatus,
  opts: { listingId?: string | null; requestId?: string | null; storeId?: string | null; archivedAt?: string | null } = {},
): RawThread {
  const participantIds = [p1.userId, p2.userId];
  return {
    id,
    type,
    contextEntityId,
    contextEntityType,
    participants: [p1, p2],
    participantIds,
    listingId: opts.listingId ?? null,
    requestId: opts.requestId ?? null,
    storeId: opts.storeId ?? null,
    lastMessage,
    lastMessageAt,
    status,
    archivedAt: opts.archivedAt ?? null,
  };
}

const rawThreads: RawThread[] = [
  row(
    "thread-1001",
    "listing",
    "listing",
    pickListingId(1),
    tp(DEMO_BUYER_ID, "Дмитрий П."),
    tp(makeSellerAccountId("marina-tech"), "Marina Tech"),
    "Могу показать завтра после 18:00.",
    isoMinusHours(2),
    "open",
    { listingId: pickListingId(1), storeId: "marina-tech" },
  ),
  row(
    "thread-1002",
    "listing",
    "listing",
    pickListingId(2),
    tp(DEMO_BUYER_ID, "Дмитрий П."),
    tp(makeSellerAccountId("alexey-drive"), "АвтоГрад Алексей"),
    "Торг небольшой возможен на месте.",
    isoMinusHours(6),
    "open",
    { listingId: pickListingId(2), storeId: "alexey-drive" },
  ),
  row(
    "thread-1003",
    "listing",
    "listing",
    pickListingId(3),
    tp(DEMO_BUYER_ID, "Дмитрий П."),
    tp(makeSellerAccountId("ildar-estate"), "Ильдар · Недвижимость"),
    "Документы подготовим к просмотру.",
    isoMinusHours(12),
    "open",
    { listingId: pickListingId(3), storeId: "ildar-estate" },
  ),
  row(
    "thread-1004",
    "listing",
    "listing",
    pickListingId(4),
    tp(makeSellerAccountId("marina-tech"), "Marina Tech"),
    tp("buyer-maria", "Мария К."),
    "Да, чек и гарантия есть.",
    isoMinusHours(5),
    "open",
    { listingId: pickListingId(4), storeId: "marina-tech" },
  ),
  row(
    "thread-1005",
    "request",
    "request",
    "req-4",
    tp(makeSellerAccountId("marina-tech"), "Marina Tech"),
    tp("buyer-anna", "Анна В."),
    "Отправил предложение и примеры работ.",
    isoMinusHours(9),
    "open",
    { requestId: "req-4", storeId: "marina-tech" },
  ),
  row(
    "thread-1006",
    "request",
    "request",
    "req-7",
    tp(makeSellerAccountId("alexey-drive"), "АвтоГрад Алексей"),
    tp("buyer-ksenia", "Ксения Л."),
    "Можем встретиться сегодня вечером.",
    isoMinusHours(20),
    "open",
    { requestId: "req-7", storeId: "alexey-drive" },
  ),
  row(
    "thread-1007",
    "inquiry",
    "store",
    "agro-tech",
    tp(DEMO_BUYER_ID, "Дмитрий П."),
    tp(makeSellerAccountId("agro-tech"), "АгроТех"),
    "Есть ещё варианты по вашему бюджету.",
    isoMinusHours(30),
    "open",
    { storeId: "agro-tech" },
  ),
  row(
    "thread-1008",
    "listing",
    "listing",
    pickListingId(7),
    tp(DEMO_BUYER_ID, "Дмитрий П."),
    tp(makeSellerAccountId("marina-tech"), "Marina Tech"),
    "Тред закрыт после сделки, спасибо.",
    isoMinusHours(48),
    "archived",
    { listingId: pickListingId(7), storeId: "marina-tech", archivedAt: isoMinusHours(47) },
  ),
  row(
    "thread-1009",
    "request",
    "request",
    "req-10",
    tp(makeSellerAccountId("agro-tech"), "АгроТех"),
    tp("buyer-vadim", "Вадим С."),
    "Нужны реквизиты для счёта.",
    isoMinusHours(18),
    "open",
    { requestId: "req-10", storeId: "agro-tech" },
  ),
  row(
    "thread-1010",
    "request",
    "request",
    "req-9",
    tp(makeSellerAccountId("ildar-estate"), "Ильдар · Недвижимость"),
    tp("buyer-svetlana", "Светлана Н."),
    "Есть студия рядом с метро, отправил детали.",
    isoMinusHours(15),
    "open",
    { requestId: "req-9", storeId: "ildar-estate" },
  ),
  row(
    "thread-1011",
    "listing",
    "listing",
    pickListingId(8),
    tp(DEMO_BUYER_ID, "Дмитрий П."),
    tp(makeSellerAccountId("marina-tech"), "Marina Tech"),
    "Сделал дополнительные фото в хорошем свете.",
    isoMinusHours(1),
    "open",
    { listingId: pickListingId(8), storeId: "marina-tech" },
  ),
  row(
    "thread-1012",
    "listing",
    "listing",
    pickListingId(5),
    tp(DEMO_BUYER_ID, "Дмитрий П."),
    tp(makeSellerAccountId("alexey-drive"), "АвтоГрад Алексей"),
    "Пробег подтверждён сервисной книжкой.",
    isoMinusHours(3),
    "open",
    { listingId: pickListingId(5), storeId: "alexey-drive" },
  ),
  row(
    "thread-1013",
    "inquiry",
    "store",
    "marina-tech",
    tp("buyer-maria", "Мария К."),
    tp(makeSellerAccountId("marina-tech"), "Marina Tech"),
    "Интересует оптовая поставка для офиса.",
    isoMinusHours(7),
    "open",
    { storeId: "marina-tech" },
  ),
  row(
    "thread-support-ticket-1",
    "support",
    "support_ticket",
    "ticket-1",
    tp(DEMO_BUYER_ID, "Дмитрий П."),
    tp(SUPPORT_AGENT_USER_ID, "Поддержка Classify"),
    "Проверьте папку «Промоакции» в Gmail.",
    isoMinusHours(24),
    "open",
    {},
  ),
];

let threadsState: RawThread[] = rawThreads.map((row) => ({ ...row }));

function msg(
  id: string,
  threadId: string,
  senderId: string,
  body: string,
  timestamp: string,
  read: boolean,
  readAt?: string | null,
): Message {
  return {
    id,
    threadId,
    senderId,
    senderRole: userToSenderRole(senderId),
    body,
    timestamp,
    read,
    readAt: readAt ?? null,
  };
}

let messagesState: Message[] = [
  msg("msg-1", "thread-1001", DEMO_BUYER_ID, "Здравствуйте! По объявлению актуально?", isoMinusHours(4), true, isoMinusHours(3.8)),
  msg("msg-2", "thread-1001", makeSellerAccountId("marina-tech"), "Да, актуально. Когда вам удобно посмотреть?", isoMinusHours(3.6), true, isoMinusHours(3.3)),
  msg("msg-3", "thread-1001", DEMO_BUYER_ID, "Подойдёт завтра после 18:00.", isoMinusHours(2.5), false, null),
  msg("msg-4", "thread-1001", makeSellerAccountId("marina-tech"), "Могу показать завтра после 18:00.", isoMinusHours(2), false, null),
  msg("msg-s1", "thread-support-ticket-1", DEMO_BUYER_ID, "Пробовал три раза, почта на Gmail.", isoMinusHours(26), true, isoMinusHours(25)),
  msg("msg-s2", "thread-support-ticket-1", SUPPORT_AGENT_USER_ID, "Здравствуйте! Проверьте папку «Промоакции» и фильтры Gmail.", isoMinusHours(24), false, null),
];

for (const thread of threadsState) {
  if (messagesState.some((m) => m.threadId === thread.id)) continue;
  const baseHours = 8 + thread.id.length;
  const a = thread.participantIds[0] ?? DEMO_BUYER_ID;
  const b = thread.participantIds[1] ?? makeSellerAccountId("marina-tech");
  messagesState.push(
    msg(`seed-${thread.id}-1`, thread.id, a, "Здравствуйте! Пишу по контексту сделки.", isoMinusHours(baseHours + 2), true, isoMinusHours(baseHours + 1.5)),
    msg(`seed-${thread.id}-2`, thread.id, b, thread.lastMessage, thread.lastMessageAt, false, null),
  );
}

const unreadByThreadByUser = new Map<string, Map<string, number>>();

function seedUnread() {
  for (const thread of threadsState) {
    const unreadMap = new Map<string, number>();
    for (const uid of thread.participantIds) {
      let count = 0;
      if (uid === DEMO_BUYER_ID && (thread.id === "thread-1001" || thread.id === "thread-1011" || thread.id === "thread-support-ticket-1")) {
        count = thread.id === "thread-support-ticket-1" ? 1 : 2;
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

export async function getThread(threadId: string, viewerUserId?: string | null): Promise<MessageThread | null> {
  const row = threadsState.find((thread) => thread.id === threadId);
  if (!row) return null;
  if (viewerUserId) {
    return hydrateThreadForUser(row, viewerUserId);
  }
  return { ...row, unreadCount: unreadByThreadByUser.get(row.id)?.get(row.participantIds[0] ?? "") ?? 0 };
}

export async function getMessages(threadId: string): Promise<Message[]> {
  return messagesState
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((m) => ({ ...m }));
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
  const timestamp = new Date().toISOString();
  const message: Message = {
    id: uid("msg"),
    threadId: input.threadId,
    senderId: input.senderId,
    senderRole: input.senderRole,
    body: text,
    timestamp,
    read: false,
    readAt: null,
    attachments: attachments.length > 0 ? attachments : undefined,
  };
  messagesState = [...messagesState, message];
  touchThread(thread.id, text || (attachments.length > 0 ? `Вложение: ${attachments[0]?.name ?? "файл"}` : "Сообщение"), timestamp);

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
  messagesState = messagesState.map((m) => {
    if (m.threadId !== threadId || m.senderId === userId) {
      return m;
    }
    return { ...m, read: true, readAt: m.readAt ?? nowIso };
  });
}

function inferThreadShape(input: {
  listingId?: string | null;
  requestId?: string | null;
  storeId?: string | null;
}): Pick<RawThread, "type" | "contextEntityId" | "contextEntityType" | "listingId" | "requestId" | "storeId"> {
  if (input.listingId) {
    return {
      type: "listing",
      contextEntityId: input.listingId,
      contextEntityType: "listing",
      listingId: input.listingId,
      requestId: null,
      storeId: input.storeId ?? null,
    };
  }
  if (input.requestId) {
    return {
      type: "request",
      contextEntityId: input.requestId,
      contextEntityType: "request",
      listingId: null,
      requestId: input.requestId,
      storeId: input.storeId ?? null,
    };
  }
  if (input.storeId) {
    return {
      type: "inquiry",
      contextEntityId: input.storeId,
      contextEntityType: "store",
      listingId: null,
      requestId: null,
      storeId: input.storeId,
    };
  }
  throw new Error("Укажите объявление, запрос или магазин для диалога");
}

export async function createThread(input: {
  starterId: string;
  otherUserId: string;
  listingId?: string | null;
  requestId?: string | null;
  storeId?: string | null;
}): Promise<MessageThread> {
  if (!input.listingId && !input.requestId && !input.storeId) {
    throw new Error("Укажите объявление, запрос или магазин для диалога");
  }
  const shape = inferThreadShape(input);
  const existing = threadsState.find((thread) => {
    const sameParticipants =
      thread.participantIds.length === 2 &&
      thread.participantIds.includes(input.starterId) &&
      thread.participantIds.includes(input.otherUserId);
    if (!sameParticipants) return false;
    return (
      thread.type === shape.type &&
      thread.contextEntityId === shape.contextEntityId &&
      (thread.storeId ?? null) === (shape.storeId ?? null)
    );
  });
  if (existing) {
    return hydrateThreadForUser(existing, input.starterId);
  }

  const createdAt = new Date().toISOString();
  const threadId = uid("thread");
  const pA = participantsByUserId.get(input.starterId);
  const pB = participantsByUserId.get(input.otherUserId);
  const participants: ThreadParticipant[] = [
    tp(input.starterId, pA?.name ?? input.starterId),
    tp(input.otherUserId, pB?.name ?? input.otherUserId),
  ];
  const thread: RawThread = {
    id: threadId,
    type: shape.type,
    contextEntityId: shape.contextEntityId,
    contextEntityType: shape.contextEntityType,
    participants,
    participantIds: [input.starterId, input.otherUserId],
    listingId: shape.listingId,
    requestId: shape.requestId,
    storeId: shape.storeId,
    lastMessage: "Диалог создан. Напишите первое сообщение.",
    lastMessageAt: createdAt,
    status: "open",
    archivedAt: null,
  };
  threadsState = [thread, ...threadsState];
  unreadByThreadByUser.set(threadId, new Map([[input.starterId, 0], [input.otherUserId, 0]]));
  return hydrateThreadForUser(thread, input.starterId);
}

export async function getUnreadCount(userId: string): Promise<number> {
  let total = 0;
  for (const thread of threadsState) {
    if (!thread.participantIds.includes(userId)) continue;
    total += unreadByThreadByUser.get(thread.id)?.get(userId) ?? 0;
  }
  return total;
}

export async function archiveThread(threadId: string, archived: boolean): Promise<MessageThread | null> {
  const row = threadsState.find((t) => t.id === threadId);
  if (!row) return null;
  const now = new Date().toISOString();
  const next: RawThread = {
    ...row,
    status: archived ? "archived" : "open",
    archivedAt: archived ? now : null,
  };
  threadsState = threadsState.map((t) => (t.id === threadId ? next : t));
  return hydrateThreadForUser(next, row.participantIds[0] ?? DEMO_BUYER_ID);
}

export async function getThreadsByListingId(listingId: string): Promise<MessageThread[]> {
  return sortThreads(
    threadsState.filter((t) => t.listingId === listingId || (t.type === "listing" && t.contextEntityId === listingId)),
  ).map((row) => hydrateThreadForUser(row, row.participantIds[0] ?? DEMO_BUYER_ID));
}

export async function getThreadsForUserId(userId: string): Promise<MessageThread[]> {
  return sortThreads(threadsState.filter((t) => t.participantIds.includes(userId))).map((row) => hydrateThreadForUser(row, userId));
}

export async function resolveMessageContext(thread: MessageThread): Promise<MessageContext | null> {
  if (thread.type === "listing" && thread.listingId) {
    const { mockListingsService } = await import("@/services/listings");
    const listing = await mockListingsService.getById(thread.listingId);
    if (!listing) return null;
    return {
      entityType: "listing",
      entityId: listing.id,
      title: listing.title,
      price: listing.price ?? null,
      imageUrl: listing.image ?? null,
      status: listing.listingSaleMode ?? "active",
    };
  }
  if (thread.type === "request" && thread.requestId) {
    const { getBuyerRequestById } = await import("@/services/requests");
    const req = await getBuyerRequestById(thread.requestId, { incrementView: false });
    if (!req) return null;
    const { min, max } = req.budget;
    const price =
      min != null || max != null
        ? `${min != null ? min.toLocaleString("ru-RU") : "—"}–${max != null ? max.toLocaleString("ru-RU") : "—"} ₽`
        : null;
    return {
      entityType: "request",
      entityId: req.id,
      title: req.title,
      price,
      imageUrl: null,
      status: req.status,
    };
  }
  if ((thread.type === "inquiry" || thread.storeId) && thread.storeId) {
    const seller = getStorefrontSellerById(thread.storeId);
    return {
      entityType: "store",
      entityId: thread.storeId,
      title: seller?.storefrontName ?? thread.storeId,
      price: null,
      imageUrl: null,
      status: seller ? "active" : null,
    };
  }
  if (thread.type === "support" && thread.contextEntityType === "support_ticket") {
    return {
      entityType: "support_ticket",
      entityId: thread.contextEntityId,
      title: `Обращение ${thread.contextEntityId}`,
      price: null,
      imageUrl: null,
      status: "open",
    };
  }
  return null;
}
