"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  getDefaultMockNotifications,
  Notification,
  NOTIFICATIONS_CHANGE_EVENT,
  NOTIFICATIONS_STORAGE_KEY,
} from "@/lib/notifications";

type NotificationsState = {
  notifications: Notification[];
};

type NotificationsContextValue = {
  notifications: Notification[];
  unreadCount: number;
  isHydrated: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, "id">) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const EMPTY: Notification[] = [];

function parseStoredState(value: string | null): NotificationsState {
  if (!value) {
    return { notifications: [] };
  }

  try {
    const parsed = JSON.parse(value) as NotificationsState;
    if (!parsed || !Array.isArray(parsed.notifications)) {
      return { notifications: [] };
    }

    return {
      notifications: parsed.notifications.filter(
        (item): item is Notification =>
          typeof item?.id === "string" &&
          typeof item?.type === "string" &&
          typeof item?.title === "string" &&
          typeof item?.body === "string" &&
          typeof item?.createdAtIso === "string" &&
          typeof item?.isRead === "boolean",
      ),
    };
  } catch {
    return { notifications: [] };
  }
}

let cachedSerialized: string | null = null;
let cachedNotifications: Notification[] = EMPTY;

function invalidateCache() {
  cachedSerialized = null;
}

function ensureSeeded() {
  if (typeof window === "undefined") {
    return;
  }

  const existing = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  if (existing) {
    return;
  }

  const payload: NotificationsState = { notifications: getDefaultMockNotifications() };
  window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(payload));
}

function readNotificationsFromStorage(): Notification[] {
  if (typeof window === "undefined") {
    return EMPTY;
  }

  ensureSeeded();

  const raw = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  if (raw === cachedSerialized) {
    return cachedNotifications;
  }

  const { notifications } = parseStoredState(raw);
  cachedSerialized = raw;
  cachedNotifications = notifications;
  return cachedNotifications;
}

function writeNotificationsToStorage(nextNotifications: Notification[]) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: NotificationsState = { notifications: nextNotifications };
  const serialized = JSON.stringify(payload);
  window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, serialized);
  cachedSerialized = serialized;
  cachedNotifications = nextNotifications;
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGE_EVENT));
}

function subscribeNotifications(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === NOTIFICATIONS_STORAGE_KEY || event.key === null) {
      invalidateCache();
      onStoreChange();
    }
  };

  const onLocalChange = () => {
    invalidateCache();
    onStoreChange();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(NOTIFICATIONS_CHANGE_EVENT, onLocalChange);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(NOTIFICATIONS_CHANGE_EVENT, onLocalChange);
  };
}

function getServerSnapshot(): Notification[] {
  return EMPTY;
}

function getClientSnapshot(): Notification[] {
  return readNotificationsFromStorage();
}

function subscribeNoop() {
  return () => {};
}

function getClientMountedSnapshot() {
  return true;
}

function getServerMountedSnapshot() {
  return false;
}

type NotificationsProviderProps = {
  children: ReactNode;
};

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const notifications = useSyncExternalStore(
    subscribeNotifications,
    getClientSnapshot,
    getServerSnapshot,
  );
  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    getClientMountedSnapshot,
    getServerMountedSnapshot,
  );

  const markAsRead = useCallback(
    (id: string) => {
      const current = readNotificationsFromStorage();
      const next = current.map((item) => (item.id === id ? { ...item, isRead: true } : item));
      writeNotificationsToStorage(next);
    },
    [/* stable */],
  );

  const markAllAsRead = useCallback(() => {
    const current = readNotificationsFromStorage();
    if (current.every((item) => item.isRead)) {
      return;
    }

    writeNotificationsToStorage(current.map((item) => ({ ...item, isRead: true })));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const current = readNotificationsFromStorage();
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    writeNotificationsToStorage([{ ...notification, id }, ...current]);
  }, []);

  const value = useMemo<NotificationsContextValue>(() => {
    const unreadCount = notifications.reduce((total, item) => total + (item.isRead ? 0 : 1), 0);

    return {
      notifications: [...notifications].sort(
        (a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime(),
      ),
      unreadCount,
      isHydrated,
      markAsRead,
      markAllAsRead,
      addNotification,
    };
  }, [addNotification, isHydrated, markAllAsRead, markAsRead, notifications]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }

  return context;
}

