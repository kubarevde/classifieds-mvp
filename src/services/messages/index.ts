import type {
  Message,
  MessageAttachment,
  MessageContext,
  MessageParticipant,
  MessageSenderRole,
  MessageThread,
} from "./types";
import {
  archiveThread,
  createThread as createThreadMock,
  getMessages,
  getMyThreads,
  getParticipant,
  getThread,
  getThreadsByListingId,
  getThreadsForUserId,
  getUnreadCount,
  markThreadRead,
  resolveMessageContext,
  sendMessage,
} from "./mock";

export { DEALS_SYSTEM_USER_ID, REVIEWS_SYSTEM_USER_ID } from "./mock";

export type {
  Message,
  MessageAttachment,
  MessageContext,
  MessageContextEntityType,
  MessageParticipant,
  MessageSenderRole,
  MessageThread,
  MessageThreadStatus,
  Thread,
  ThreadKind,
  ThreadParticipant,
} from "./types";

/**
 * Контракт сервиса сообщений.
 * Реализация по умолчанию — `mock.ts`; для продакшена замените wiring на `http.ts` с тем же интерфейсом.
 */
export interface MessagesService {
  getMyThreads(userId: string): Promise<MessageThread[]>;
  getThread(threadId: string, viewerUserId?: string | null): Promise<MessageThread | null>;
  getMessages(threadId: string): Promise<Message[]>;
  getParticipant(userId: string): Promise<MessageParticipant | null>;
  sendMessage(input: {
    threadId: string;
    senderId: string;
    senderRole: MessageSenderRole;
    content?: string;
    attachments?: MessageAttachment[];
  }): Promise<Message>;
  markThreadRead(threadId: string, userId: string): Promise<void>;
  createThread(input: {
    starterId: string;
    otherUserId: string;
    listingId?: string | null;
    requestId?: string | null;
    storeId?: string | null;
  }): Promise<MessageThread>;
  getUnreadCount(userId: string): Promise<number>;
  archiveThread(threadId: string, archived: boolean): Promise<MessageThread | null>;
  getThreadsByListingId(listingId: string): Promise<MessageThread[]>;
  getThreadsForUserId(userId: string): Promise<MessageThread[]>;
  resolveMessageContext(thread: MessageThread): Promise<MessageContext | null>;
}

export const messagesService: MessagesService = {
  getMyThreads,
  getThread,
  getMessages,
  getParticipant,
  sendMessage,
  markThreadRead,
  createThread: createThreadMock,
  getUnreadCount,
  archiveThread,
  getThreadsByListingId,
  getThreadsForUserId,
  resolveMessageContext,
};
