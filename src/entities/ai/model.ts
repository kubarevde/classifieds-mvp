/** Типы AI Listing Assistant (лимиты и usage — без дублирования billing enums в UI). */

export type AiAssistRequestType =
  | "title"
  | "description"
  | "price"
  | "category"
  | "improve"
  | "detect"
  | "photo_tags"
  | "snap";

export type AiUsageBlockReason = "daily_limit" | "plan_limit";

export type AiDailyUsageSnapshot = {
  /** Ключ календарного дня YYYY-MM-DD (локальная дата). */
  dayKey: string;
  /** Счётчики по типам за сегодня. */
  byType: Partial<Record<AiAssistRequestType, number>>;
  /** Всего за сегодня (сумма типов). */
  totalToday: number;
};

export type AiUsageCheckResult = {
  ok: boolean;
  reason?: AiUsageBlockReason;
  /** Оставшиеся запросы; undefined если безлимит. */
  remaining?: number;
  /** Дневной лимит; undefined если безлимит. */
  limit?: number;
};
