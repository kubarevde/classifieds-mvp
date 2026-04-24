"use client";

import { ReactNode } from "react";

import { useBuyer } from "@/components/buyer/buyer-provider";

export function NotificationsProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useNotifications() {
  const buyer = useBuyer();
  return {
    notifications: [...buyer.notifications].sort(
      (a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime(),
    ),
    unreadCount: buyer.unreadCounts.notifications,
    isHydrated: true,
    markAsRead: buyer.markNotificationRead,
    markAllAsRead: buyer.markAllNotificationsRead,
    addNotification: buyer.addNotification,
  };
}

