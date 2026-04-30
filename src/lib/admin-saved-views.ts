export type AdminSavedViewDomain =
  | "moderation"
  | "support"
  | "subscriptions"
  | "listings"
  | "promotions-listings"
  | "promotions-campaigns";

export type AdminSavedView = {
  id: string;
  domain: AdminSavedViewDomain;
  label: string;
  /** Параметры query (без internalAccess). Пустое значение = ключ не ставим. */
  query: Record<string, string>;
};

export const ADMIN_PRESET_VIEWS: Record<AdminSavedViewDomain, AdminSavedView[]> = {
  moderation: [
    { id: "mod-urgent", domain: "moderation", label: "Urgent / high", query: { priority: "urgent" } },
    { id: "mod-high-new", domain: "moderation", label: "Новые high", query: { priority: "high", status: "new" } },
    { id: "mod-unassigned", domain: "moderation", label: "Без назначения", query: { assignedTo: "unassigned" } },
    { id: "mod-in-review", domain: "moderation", label: "В разборе", query: { status: "in_review" } },
  ],
  support: [
    { id: "sup-open-high", domain: "support", label: "Открытые · high", query: { status: "open", priority: "high" } },
    { id: "sup-inprog", domain: "support", label: "В работе", query: { status: "in_progress" } },
    { id: "sup-unassigned", domain: "support", label: "Без исполнителя", query: { assigned: "unassigned" } },
    { id: "sup-payment", domain: "support", label: "Оплата", query: { category: "payment" } },
  ],
  subscriptions: [
    { id: "sub-past", domain: "subscriptions", label: "Past due", query: { status: "past_due" } },
    { id: "sub-failed-pay", domain: "subscriptions", label: "Платёж не прошёл", query: { pay: "failed" } },
    { id: "sub-active", domain: "subscriptions", label: "Активные", query: { status: "active" } },
    { id: "sub-paused", domain: "subscriptions", label: "На паузе", query: { status: "paused" } },
  ],
  listings: [
    { id: "lst-flagged", domain: "listings", label: "С флагами", query: { flagged: "1" } },
    { id: "lst-promo", domain: "listings", label: "Промо / буст", query: { promoted: "1" } },
    { id: "lst-elec", domain: "listings", label: "Электроника", query: { world: "electronics" } },
    { id: "lst-active", domain: "listings", label: "Только активные", query: { status: "active" } },
  ],
  "promotions-listings": [
    { id: "prm-act", domain: "promotions-listings", label: "Активные", query: { status: "active" } },
    { id: "prm-flag", domain: "promotions-listings", label: "Риск / flagged", query: { flagged: "1" } },
    { id: "prm-soon", domain: "promotions-listings", label: "Истекают скоро", query: { expiring: "1" } },
    { id: "prm-admin", domain: "promotions-listings", label: "Админ-гранты", query: { source: "admin_grant" } },
  ],
  "promotions-campaigns": [
    { id: "cmp-act", domain: "promotions-campaigns", label: "Активные", query: { status: "active" } },
    { id: "cmp-draft", domain: "promotions-campaigns", label: "Черновики", query: { status: "draft" } },
    { id: "cmp-done", domain: "promotions-campaigns", label: "Завершённые", query: { status: "completed" } },
  ],
};

const STORAGE_KEY = "classify-admin-saved-views-v1";

export function loadCustomSavedViews(): AdminSavedView[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AdminSavedView[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomSavedViews(views: AdminSavedView[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
}

/** Собрать href с учётом internalAccess и новых фильтров view. */
export function hrefForSavedView(pathname: string, currentSearch: string, view: AdminSavedView): string {
  const prev = new URLSearchParams(currentSearch);
  const internal = prev.get("internalAccess");
  const next = new URLSearchParams();
  if (internal) {
    next.set("internalAccess", internal);
  }
  for (const [k, v] of Object.entries(view.query)) {
    if (v) {
      next.set(k, v);
    }
  }
  const s = next.toString();
  return s ? `${pathname}?${s}` : pathname;
}

export function isViewActive(view: AdminSavedView, params: URLSearchParams): boolean {
  return Object.entries(view.query).every(([k, v]) => (params.get(k) ?? "") === v);
}
