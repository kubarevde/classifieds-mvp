"use client";

import { useSyncExternalStore } from "react";

import { getMockUnreadMessagesCount } from "@/lib/messages";
import { getDefaultMockNotifications } from "@/lib/notifications";

const SELLER_ACTIVITY_STORAGE_KEY = "classifieds-mvp:seller-activity";
const SELLER_ACTIVITY_CHANGE_EVENT = "classifieds-seller-activity-change";

type SellerActivityState = {
  messagesUnreadCount: number;
  notificationsUnreadCount: number;
};

const DEFAULT_STATE: SellerActivityState = {
  messagesUnreadCount: getMockUnreadMessagesCount(),
  notificationsUnreadCount: getDefaultMockNotifications().reduce(
    (sum, item) => sum + (item.isRead ? 0 : 1),
    0,
  ),
};

let cachedRaw: string | null = null;
let cachedSnapshot: SellerActivityState = DEFAULT_STATE;

function sanitizeState(parsed: Partial<SellerActivityState> | null | undefined): SellerActivityState {
  return {
    messagesUnreadCount:
      parsed && Number.isFinite(parsed.messagesUnreadCount)
        ? Math.max(0, Number(parsed.messagesUnreadCount))
        : DEFAULT_STATE.messagesUnreadCount,
    notificationsUnreadCount:
      parsed && Number.isFinite(parsed.notificationsUnreadCount)
        ? Math.max(0, Number(parsed.notificationsUnreadCount))
        : DEFAULT_STATE.notificationsUnreadCount,
  };
}

function toStableSnapshot(next: SellerActivityState, rawKey: string | null) {
  if (
    cachedSnapshot.messagesUnreadCount === next.messagesUnreadCount &&
    cachedSnapshot.notificationsUnreadCount === next.notificationsUnreadCount
  ) {
    cachedRaw = rawKey;
    return cachedSnapshot;
  }

  cachedRaw = rawKey;
  cachedSnapshot = next;
  return cachedSnapshot;
}

function readState(): SellerActivityState {
  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }
  const raw = window.localStorage.getItem(SELLER_ACTIVITY_STORAGE_KEY);
  if (raw === cachedRaw) {
    return cachedSnapshot;
  }

  if (!raw) {
    return toStableSnapshot(DEFAULT_STATE, null);
  }

  try {
    return toStableSnapshot(sanitizeState(JSON.parse(raw) as Partial<SellerActivityState>), raw);
  } catch {
    return toStableSnapshot(DEFAULT_STATE, null);
  }
}

function writeState(next: SellerActivityState) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(SELLER_ACTIVITY_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(SELLER_ACTIVITY_CHANGE_EVENT));
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === SELLER_ACTIVITY_STORAGE_KEY || event.key === null) {
      onStoreChange();
    }
  };
  const onLocalChange = () => onStoreChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener(SELLER_ACTIVITY_CHANGE_EVENT, onLocalChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SELLER_ACTIVITY_CHANGE_EVENT, onLocalChange);
  };
}

export function useSellerActivity() {
  const state = useSyncExternalStore(subscribe, readState, () => DEFAULT_STATE);

  const setMessagesUnreadCount = (next: number) => {
    const current = readState();
    writeState({ ...current, messagesUnreadCount: Math.max(0, next) });
  };

  const setNotificationsUnreadCount = (next: number) => {
    const current = readState();
    writeState({ ...current, notificationsUnreadCount: Math.max(0, next) });
  };

  return {
    messagesUnreadCount: state.messagesUnreadCount,
    notificationsUnreadCount: state.notificationsUnreadCount,
    setMessagesUnreadCount,
    setNotificationsUnreadCount,
    isHydrated: true,
  };
}
