import type { DemoRoleId } from "@/lib/demo-role-constants";

/** Внутренняя роль backoffice (mock, не реальная IAM). */
export type AdminPersonaId = "admin" | "moderator" | "support" | "finance";

export type AdminPersona = AdminPersonaId | "none";

const INTERNAL_ACCESS_PARAM_VALUES = ["admin", "moderator", "support", "finance"] as const;

export type InternalAccessParam = (typeof INTERNAL_ACCESS_PARAM_VALUES)[number];

export function parseInternalAccessParam(value: string | null | undefined): InternalAccessParam | null {
  if (!value) {
    return null;
  }
  return INTERNAL_ACCESS_PARAM_VALUES.includes(value as InternalAccessParam) ? (value as InternalAccessParam) : null;
}

/**
 * Базовое сопоставление демо-роли → персона консоли (без query override).
 * `all` в демо = полный админ; seller ≈ модераторские полномочия каталога; buyer ≈ поддержка.
 */
export function defaultAdminPersonaFromDemoRole(role: DemoRoleId): AdminPersona {
  if (role === "all") {
    return "admin";
  }
  if (role === "seller") {
    return "moderator";
  }
  if (role === "buyer") {
    return "support";
  }
  return "none";
}

export function resolveAdminPersona(demoRole: DemoRoleId, internalAccess: string | null | undefined): AdminPersona {
  const override = parseInternalAccessParam(internalAccess);
  if (override) {
    return override;
  }
  return defaultAdminPersonaFromDemoRole(demoRole);
}

export function isAdminPersona(persona: AdminPersona): persona is AdminPersonaId {
  return persona !== "none";
}

/**
 * Матрица: кто видит корневой пункт навигации / страницу.
 * Ключи совпадают с `id` / `accessId` в `src/config/admin-routes.ts`.
 */
export const ADMIN_ROUTE_ACCESS: Record<string, readonly AdminPersonaId[]> = {
  overview: ["admin", "moderator", "support", "finance"],
  users: ["admin", "support"],
  listings: ["admin", "moderator"],
  stores: ["admin", "moderator"],
  requests: ["admin", "moderator", "support"],
  support: ["admin", "support"],
  moderation: ["admin", "moderator"],
  subscriptions: ["admin", "finance"],
  "subscriptions-plans": ["admin", "finance"],
  "subscriptions-invoices": ["admin", "finance"],
  "subscriptions-payouts": ["admin", "finance"],
  "subscriptions-detail": ["admin", "finance"],
  analytics: ["admin", "moderator", "support", "finance"],
  system: ["admin"],
  "system-feature-gates": ["admin"],
  "system-settings": ["admin"],
  /** Сквозной mock-кейс (foundation). */
  cases: ["admin", "moderator", "support", "finance"],
  /** Операционная консоль продвижения: admin/finance — полные действия; moderator/support — в основном просмотр (см. UI). */
  promotions: ["admin", "finance", "moderator", "support"],
  "promotions-listings": ["admin", "finance", "moderator", "support"],
  "promotions-slots": ["admin", "finance", "moderator"],
  "promotions-campaigns": ["admin", "finance", "moderator"],
  /** Внутренние правила цен и entitlements — только admin/finance. */
  "promotions-pricing": ["admin", "finance"],
  "promotions-detail": ["admin", "finance", "moderator", "support"],
};

/** Доступ к разделу по id из `ADMIN_ROUTE_ACCESS`. */
export function personaCanAccessRoute(persona: AdminPersona, routeAccessId: string): boolean {
  if (persona === "none") {
    return false;
  }
  const allowed = ADMIN_ROUTE_ACCESS[routeAccessId];
  if (!allowed) {
    return persona === "admin";
  }
  return allowed.includes(persona);
}

export function canAccessModerationPersona(persona: AdminPersona): boolean {
  return persona === "admin" || persona === "moderator";
}
