import type { AdminPersona, AdminPersonaId } from "@/lib/admin-access";
import { personaCanAccessRoute } from "@/lib/admin-access";

export type AdminNavIcon =
  | "layoutDashboard"
  | "users"
  | "fileText"
  | "store"
  | "inbox"
  | "lifeBuoy"
  | "shield"
  | "creditCard"
  | "barChart3"
  | "settings"
  | "megaphone";

export type AdminNavNode = {
  id: string;
  label: string;
  href: string;
  icon: AdminNavIcon;
  /** Ключ матрицы доступа; по умолчанию = id */
  accessId?: string;
  children?: AdminNavNode[];
};

export const ADMIN_NAV_TREE: AdminNavNode[] = [
  { id: "overview", label: "Обзор", href: "/admin", icon: "layoutDashboard" },
  { id: "cases", label: "Кейсы", href: "/admin/cases", icon: "fileText", accessId: "cases" },
  { id: "users", label: "Пользователи", href: "/admin/users", icon: "users" },
  { id: "listings", label: "Объявления", href: "/admin/listings", icon: "fileText" },
  { id: "stores", label: "Магазины", href: "/admin/stores", icon: "store" },
  { id: "requests", label: "Запросы", href: "/admin/requests", icon: "inbox" },
  { id: "support", label: "Поддержка", href: "/admin/support", icon: "lifeBuoy" },
  {
    id: "moderation",
    label: "Модерация",
    href: "/admin/moderation",
    icon: "shield",
    accessId: "moderation",
    children: [
      { id: "moderation-home", label: "Обзор T&S", href: "/admin/moderation", icon: "shield", accessId: "moderation" },
      { id: "moderation-reports", label: "Жалобы", href: "/admin/moderation/reports", icon: "shield", accessId: "moderation" },
      { id: "moderation-verification", label: "Верификация", href: "/admin/moderation/verification", icon: "shield", accessId: "moderation" },
      { id: "moderation-appeals", label: "Апелляции", href: "/admin/moderation/appeals", icon: "shield", accessId: "moderation" },
      { id: "moderation-enforcement", label: "Enforcement", href: "/admin/moderation/enforcement", icon: "shield", accessId: "moderation" },
      { id: "moderation-reviews", label: "Отзывы (flags)", href: "/admin/reviews", icon: "shield", accessId: "moderation" },
    ],
  },
  {
    id: "subscriptions",
    label: "Подписки и монетизация",
    href: "/admin/subscriptions",
    icon: "creditCard",
    accessId: "subscriptions",
    children: [
      { id: "subscriptions-root", label: "Подписки", href: "/admin/subscriptions", icon: "creditCard", accessId: "subscriptions" },
      { id: "subscriptions-plans", label: "Тарифы", href: "/admin/subscriptions/plans", icon: "creditCard", accessId: "subscriptions-plans" },
      { id: "subscriptions-invoices", label: "Счета", href: "/admin/subscriptions/invoices", icon: "creditCard", accessId: "subscriptions-invoices" },
      { id: "subscriptions-payouts", label: "Выплаты", href: "/admin/subscriptions/payouts", icon: "creditCard", accessId: "subscriptions-payouts" },
    ],
  },
  {
    id: "promotions",
    label: "Продвижение",
    href: "/admin/promotions",
    icon: "megaphone",
    accessId: "promotions",
    children: [
      { id: "promotions-root", label: "Обзор", href: "/admin/promotions", icon: "megaphone", accessId: "promotions" },
      { id: "promotions-listings", label: "Объявления и бусты", href: "/admin/promotions/listings", icon: "megaphone", accessId: "promotions-listings" },
      { id: "promotions-slots", label: "Слоты и размещения", href: "/admin/promotions/slots", icon: "megaphone", accessId: "promotions-slots" },
      { id: "promotions-campaigns", label: "Кампании", href: "/admin/promotions/campaigns", icon: "megaphone", accessId: "promotions-campaigns" },
      { id: "promotions-pricing", label: "Цены и правила", href: "/admin/promotions/pricing", icon: "megaphone", accessId: "promotions-pricing" },
    ],
  },
  { id: "analytics", label: "Аналитика", href: "/admin/analytics", icon: "barChart3" },
  {
    id: "system",
    label: "Система",
    href: "/admin/system",
    icon: "settings",
    accessId: "system",
    children: [
      { id: "system-root", label: "Платформа", href: "/admin/system", icon: "settings", accessId: "system" },
      { id: "system-feature-gates", label: "Флаги функций", href: "/admin/system/feature-gates", icon: "settings", accessId: "system-feature-gates" },
      { id: "system-settings", label: "Настройки", href: "/admin/system/settings", icon: "settings", accessId: "system-settings" },
    ],
  },
];

function flattenNav(nodes: AdminNavNode[], out: AdminNavNode[] = []): AdminNavNode[] {
  for (const n of nodes) {
    out.push(n);
    if (n.children) {
      flattenNav(n.children, out);
    }
  }
  return out;
}

const FLAT_NAV = flattenNav(ADMIN_NAV_TREE);

export function getNavNodeByHref(pathname: string): AdminNavNode | undefined {
  const normalized = pathname.replace(/\/$/, "") || "/admin";
  const sorted = [...FLAT_NAV].sort((a, b) => b.href.length - a.href.length);
  return sorted.find((n) => normalized === n.href || normalized.startsWith(`${n.href}/`));
}

export type BreadcrumbItem = { label: string; href?: string };

function shortEntityLabel(raw: string): string {
  try {
    const d = decodeURIComponent(raw);
    return d.length > 36 ? `${d.slice(0, 34)}…` : d;
  } catch {
    return raw.length > 36 ? `${raw.slice(0, 34)}…` : raw;
  }
}

/** Хлебные крошки; для динамических сегментов добавляет финальный crumb. */
export function buildAdminBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const normalized = pathname.replace(/\/$/, "") || "/admin";
  const node = getNavNodeByHref(pathname);
  const crumbs: BreadcrumbItem[] = [{ label: "Админ-консоль", href: "/admin" }];
  if (!node) {
    return crumbs;
  }
  if (node.href === "/admin") {
    return crumbs;
  }
  if (node.children?.length) {
    const promoDetail = normalized.match(/^\/admin\/promotions\/(prm-[a-zA-Z0-9-]+)$/);
    if (promoDetail?.[1]) {
      crumbs.push({ label: node.label, href: node.href });
      crumbs.push({ label: shortEntityLabel(promoDetail[1]) });
      return crumbs;
    }
    crumbs.push({ label: node.label, href: node.href });
    return crumbs;
  }
  const parent = ADMIN_NAV_TREE.find((p) => p.children?.some((c) => c.id === node.id));
  if (parent && parent.id !== node.id) {
    crumbs.push({ label: parent.label, href: parent.href });
  }
  crumbs.push({ label: node.label, href: node.href });

  const dyn =
    normalized.match(/^\/admin\/reviews\/([^/]+)$/) ??
    normalized.match(/^\/admin\/users\/([^/]+)$/) ??
    normalized.match(/^\/admin\/listings\/([^/]+)$/) ??
    normalized.match(/^\/admin\/stores\/([^/]+)$/) ??
    normalized.match(/^\/admin\/requests\/([^/]+)$/) ??
    normalized.match(/^\/admin\/support\/([^/]+)$/) ??
    normalized.match(/^\/admin\/subscriptions\/(?!plans$|invoices$|payouts$)([^/]+)$/) ??
    normalized.match(/^\/admin\/cases\/([^/]+)$/) ??
    normalized.match(/^\/admin\/promotions\/campaigns\/([^/]+)$/) ??
    normalized.match(/^\/admin\/promotions\/(prm-[^/]+)$/);
  if (dyn?.[1]) {
    crumbs.push({ label: shortEntityLabel(dyn[1]) });
  }

  return crumbs;
}

export function filterNavForPersona(persona: AdminPersona): AdminNavNode[] {
  const filterNode = (n: AdminNavNode): AdminNavNode | null => {
    const accessKey = n.accessId ?? n.id;
    const selfOk = personaCanAccessRoute(persona, accessKey);
    const children = n.children?.map(filterNode).filter(Boolean) as AdminNavNode[] | undefined;
    if (children?.length) {
      return { ...n, children };
    }
    return selfOk ? { ...n, children: undefined } : null;
  };
  return ADMIN_NAV_TREE.map(filterNode).filter(Boolean) as AdminNavNode[];
}

/** Плоский список ссылок для мобильного меню. */
export function flattenNavLinksForPersona(persona: AdminPersona): { label: string; href: string }[] {
  const tree = filterNavForPersona(persona);
  const out: { label: string; href: string }[] = [];
  for (const n of tree) {
    if (n.children?.length) {
      for (const c of n.children) {
        out.push({ label: `${n.label}: ${c.label}`, href: c.href });
      }
    } else {
      out.push({ label: n.label, href: n.href });
    }
  }
  return out;
}

export function getPageTitleForPath(pathname: string): string {
  const node = getNavNodeByHref(pathname);
  return node?.label ?? "Админ-консоль";
}

/** Доступ для произвольного пути (включая динамические сегменты). */
export function getRouteAccessIdForPathname(pathname: string): string {
  const normalized = pathname.replace(/\/$/, "") || "/admin";
  const staticNode = FLAT_NAV.find((n) => normalized === n.href);
  if (staticNode) {
    return staticNode.accessId ?? staticNode.id;
  }
  if (/^\/admin\/users\/[^/]+$/.test(normalized)) {
    return "users";
  }
  if (/^\/admin\/listings\/[^/]+$/.test(normalized)) {
    return "listings";
  }
  if (/^\/admin\/stores\/[^/]+$/.test(normalized)) {
    return "stores";
  }
  if (/^\/admin\/requests\/[^/]+$/.test(normalized)) {
    return "requests";
  }
  if (/^\/admin\/support\/[^/]+$/.test(normalized)) {
    return "support";
  }
  if (/^\/admin\/subscriptions\/(?!plans$|invoices$|payouts$)[^/]+$/.test(normalized)) {
    return "subscriptions-detail";
  }
  if (/^\/admin\/moderation\//.test(normalized)) {
    return "moderation";
  }
  if (/^\/admin\/reviews(\/[^/]+)?$/.test(normalized)) {
    return "moderation";
  }
  if (/^\/admin\/cases(\/[^/]+)?$/.test(normalized)) {
    return "cases";
  }
  if (normalized === "/admin/promotions" || normalized.startsWith("/admin/promotions/")) {
    if (normalized === "/admin/promotions") {
      return "promotions";
    }
    if (normalized.startsWith("/admin/promotions/listings")) {
      return "promotions-listings";
    }
    if (normalized.startsWith("/admin/promotions/slots")) {
      return "promotions-slots";
    }
    if (normalized.startsWith("/admin/promotions/campaigns")) {
      return "promotions-campaigns";
    }
    if (normalized.startsWith("/admin/promotions/pricing")) {
      return "promotions-pricing";
    }
    const seg = normalized.split("/")[3] ?? "";
    if (seg && !["listings", "slots", "campaigns", "pricing"].includes(seg)) {
      return "promotions-detail";
    }
    return "promotions";
  }
  const node = getNavNodeByHref(pathname);
  return node?.accessId ?? node?.id ?? "overview";
}

export type { AdminPersonaId };
