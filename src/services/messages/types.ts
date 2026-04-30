export type MessageThreadStatus = "open" | "archived";

export type MessageSenderRole = "buyer" | "seller" | "store_owner" | "support";

export interface MessageThread {
  id: string;
  participantIds: string[];
  listingId?: string | null;
  requestId?: string | null;
  storeId?: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: MessageThreadStatus;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: MessageSenderRole;
  content: string;
  createdAt: string;
  readAt?: string | null;
  attachments?: MessageAttachment[];
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
