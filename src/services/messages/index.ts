import type {
  Message,
  MessageAttachment,
  MessageParticipant,
  MessageSenderRole,
  MessageThread,
} from "./types";
import {
  createThread as createThreadMock,
  getMessages,
  getMyThreads,
  getThread,
  getUnreadCount,
  getParticipant,
  markThreadRead,
  sendMessage,
} from "./mock";

export type {
  Message,
  MessageAttachment,
  MessageParticipant,
  MessageSenderRole,
  MessageThread,
} from "./types";

export interface MessagesService {
  getMyThreads(userId: string): Promise<MessageThread[]>;
  getThread(threadId: string): Promise<MessageThread | null>;
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
}

// Единый домен сообщений для публичного продукта и кабинетов; любые новые фичи чата должны строиться поверх этого сервиса.
export const messagesService: MessagesService = {
  getMyThreads,
  getThread,
  getMessages,
  getParticipant,
  sendMessage,
  markThreadRead,
  createThread: createThreadMock,
  getUnreadCount,
};
