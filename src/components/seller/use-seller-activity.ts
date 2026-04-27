"use client";

import { useCallback, useEffect, useState } from "react";

import {
  SELLER_ACTIVITY_CHANGE_EVENT,
  SELLER_ACTIVITY_STORAGE_KEY,
  createDefaultSellerActivityState,
  parseStoredSellerActivity,
  sellerActivityStatesEqual,
  type SellerActivityState,
} from "@/lib/seller-activity-storage";

/**
 * Счётчики «активности продавца» в шапке (Navbar). Храним в localStorage и синхронизируем между вкладками.
 *
 * Почему не useSyncExternalStore: в React 19 getSnapshot должен возвращать стабильную ссылку при неизменных
 * данных; иначе «The result of getSnapshot should be cached» и каскад ререндеров через Navbar.
 * Здесь проще и надёжнее useState + подписки на storage / кастомное событие.
 */
function readFromWindow(): SellerActivityState {
  if (typeof window === "undefined") {
    return createDefaultSellerActivityState();
  }
  return parseStoredSellerActivity(window.localStorage.getItem(SELLER_ACTIVITY_STORAGE_KEY));
}

function mergeRemoteIntoState(prev: SellerActivityState): SellerActivityState {
  const next = readFromWindow();
  return sellerActivityStatesEqual(prev, next) ? prev : next;
}

export function useSellerActivity() {
  const [state, setState] = useState<SellerActivityState>(() => createDefaultSellerActivityState());

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === SELLER_ACTIVITY_STORAGE_KEY || event.key === null) {
        setState(mergeRemoteIntoState);
      }
    };
    const onLocalChange = () => {
      setState(mergeRemoteIntoState);
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(SELLER_ACTIVITY_CHANGE_EVENT, onLocalChange);
    queueMicrotask(() => {
      setState(mergeRemoteIntoState);
    });
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SELLER_ACTIVITY_CHANGE_EVENT, onLocalChange);
    };
  }, []);

  const setMessagesUnreadCount = useCallback((next: number) => {
    setState((current) => {
      const updated = { ...current, messagesUnreadCount: Math.max(0, next) };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SELLER_ACTIVITY_STORAGE_KEY, JSON.stringify(updated));
        queueMicrotask(() => {
          window.dispatchEvent(new Event(SELLER_ACTIVITY_CHANGE_EVENT));
        });
      }
      return updated;
    });
  }, []);

  const setNotificationsUnreadCount = useCallback((next: number) => {
    setState((current) => {
      const updated = { ...current, notificationsUnreadCount: Math.max(0, next) };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SELLER_ACTIVITY_STORAGE_KEY, JSON.stringify(updated));
        queueMicrotask(() => {
          window.dispatchEvent(new Event(SELLER_ACTIVITY_CHANGE_EVENT));
        });
      }
      return updated;
    });
  }, []);

  return {
    messagesUnreadCount: state.messagesUnreadCount,
    notificationsUnreadCount: state.notificationsUnreadCount,
    setMessagesUnreadCount,
    setNotificationsUnreadCount,
    isHydrated: true,
  };
}
