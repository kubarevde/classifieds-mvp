import { getDefaultMockNotifications } from "@/lib/notifications";

import type { Notification } from "./types";

const notificationsByUserId = new Map<string, Notification[]>();

function getStore(userId: string): Notification[] {
  if (!notificationsByUserId.has(userId)) {
    const base = userId === "buyer-dmitriy" ? getDefaultMockNotifications() : [];
    notificationsByUserId.set(userId, base);
  }
  return notificationsByUserId.get(userId) ?? [];
}

function uid(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getBuyerNotifications(): Promise<Notification[]> {
  return getNotificationsForUser("buyer-dmitriy");
}

export function getBuyerNotificationsSync(): Notification[] {
  return getNotificationsForUserSync("buyer-dmitriy");
}

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  return getNotificationsForUserSync(userId);
}

export function getNotificationsForUserSync(userId: string): Notification[] {
  return getStore(userId).map((row) => ({ ...row }));
}

export async function addMessageNotification(input: {
  userId: string;
  threadId: string;
  fromUserId: string;
  preview: string;
}) {
  const notification: Notification = {
    id: uid("n-msg"),
    type: "new_message",
    title: "Новое сообщение",
    body: `От ${input.fromUserId}: ${input.preview.slice(0, 80)}`,
    createdAtIso: new Date().toISOString(),
    isRead: false,
    link: { href: `/messages/${encodeURIComponent(input.threadId)}`, label: "Открыть чат" },
    metadata: { conversationId: input.threadId },
  };
  notificationsByUserId.set(input.userId, [notification, ...getStore(input.userId)]);
  return notification;
}
