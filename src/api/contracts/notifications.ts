import type { Notification } from "@/lib/notifications";

/** Как в `lib/notifications` и buyer/store нотификациях. */
export type NotificationResource = Notification;

export interface GetNotificationsRequest {
  page?: number;
  perPage?: number;
  unreadOnly?: boolean;
}

export interface GetNotificationsResponse {
  items: NotificationResource[];
  page: number;
  perPage: number;
  total: number;
  unreadCount: number;
}

export interface MarkNotificationReadRequest {
  id: string;
}

export interface MarkNotificationReadResponse {
  item: NotificationResource;
}

export interface MarkAllNotificationsReadResponse {
  updatedCount: number;
}
