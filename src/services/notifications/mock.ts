import { getDefaultMockNotifications } from "@/lib/notifications";

import type { Notification } from "./types";

export async function getBuyerNotifications(): Promise<Notification[]> {
  return getBuyerNotificationsSync();
}

export function getBuyerNotificationsSync(): Notification[] {
  return getDefaultMockNotifications();
}
