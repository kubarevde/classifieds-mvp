import { getMockUnreadMessagesCount } from "@/lib/messages";
import { getDefaultMockNotifications } from "@/lib/notifications";

export const SELLER_ACTIVITY_STORAGE_KEY = "classifieds-mvp:seller-activity";

/** Событие для синхронизации вкладок одного origin (storage event не срабатывает на той же вкладке). */
export const SELLER_ACTIVITY_CHANGE_EVENT = "classifieds-seller-activity-change";

export type SellerActivityState = {
  messagesUnreadCount: number;
  notificationsUnreadCount: number;
};

const DEFAULT_NUMBERS: SellerActivityState = {
  messagesUnreadCount: getMockUnreadMessagesCount(),
  notificationsUnreadCount: getDefaultMockNotifications().reduce(
    (sum, item) => sum + (item.isRead ? 0 : 1),
    0,
  ),
};

function sanitizeParsed(parsed: Partial<SellerActivityState> | null | undefined): SellerActivityState {
  return {
    messagesUnreadCount:
      parsed && Number.isFinite(parsed.messagesUnreadCount)
        ? Math.max(0, Number(parsed.messagesUnreadCount))
        : DEFAULT_NUMBERS.messagesUnreadCount,
    notificationsUnreadCount:
      parsed && Number.isFinite(parsed.notificationsUnreadCount)
        ? Math.max(0, Number(parsed.notificationsUnreadCount))
        : DEFAULT_NUMBERS.notificationsUnreadCount,
  };
}

/** Дефолтные счётчики (детерминированно от mock-данных). */
export function createDefaultSellerActivityState(): SellerActivityState {
  return { ...DEFAULT_NUMBERS };
}

/**
 * Разбор значения из localStorage. Без доступа к window — удобно для unit-тестов.
 */
export function parseStoredSellerActivity(raw: string | null): SellerActivityState {
  if (raw === null || raw === "") {
    return createDefaultSellerActivityState();
  }
  try {
    return sanitizeParsed(JSON.parse(raw) as Partial<SellerActivityState>);
  } catch {
    return createDefaultSellerActivityState();
  }
}

export function sellerActivityStatesEqual(a: SellerActivityState, b: SellerActivityState): boolean {
  return (
    a.messagesUnreadCount === b.messagesUnreadCount &&
    a.notificationsUnreadCount === b.notificationsUnreadCount
  );
}
