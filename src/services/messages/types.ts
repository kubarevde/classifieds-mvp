/** Тип переписки в маркетплейсе (контур сделки / поддержка). */
export type ThreadKind = "listing" | "request" | "inquiry" | "support";

/** Сущность, к которой привязан тред (для контекст-карточки и ссылок). */
export type MessageContextEntityType = "listing" | "request" | "store" | "support_ticket";

export type MessageThreadStatus = "open" | "archived";

export type MessageSenderRole = "buyer" | "seller" | "store_owner" | "support";

/** Участник треда (снимок для UI; источник правды — participants + messagesService.getParticipant). */
export interface ThreadParticipant {
  userId: string;
  role: "buyer" | "seller" | "support";
  name: string;
  avatar?: string | null;
}

/** Базовая модель треда (совместима с будущим REST-слоем). */
export interface Thread {
  id: string;
  type: ThreadKind;
  contextEntityId: string;
  contextEntityType: MessageContextEntityType;
  participants: ThreadParticipant[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: MessageThreadStatus;
  archivedAt?: string | null;
}

/**
 * Расширенное представление треда для текущего UI кабинетов:
 * плоские id объявления / запроса / магазина для быстрых ссылок и derived-хелперов.
 */
export interface MessageThread extends Thread {
  participantIds: string[];
  listingId?: string | null;
  requestId?: string | null;
  storeId?: string | null;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: MessageSenderRole;
  body: string;
  attachments?: MessageAttachment[];
  timestamp: string;
  read: boolean;
  readAt?: string | null;
}

export interface MessageParticipant {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  role: MessageSenderRole | "support";
  isOnline?: boolean;
  lastSeenAt?: string | null;
}

export interface MessageAttachment {
  id: string;
  type: "image" | "file";
  url: string;
  name: string;
  mimeType?: string | null;
  sizeLabel?: string | null;
}

/** Контекст для карточки над тредом (загружается из каталога / запросов / витрины). */
export interface MessageContext {
  entityType: MessageContextEntityType;
  entityId: string;
  title: string;
  price?: string | null;
  imageUrl?: string | null;
  status?: string | null;
}
