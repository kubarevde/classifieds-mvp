import { buyerRequestsMock } from "@/mocks/requests";
import { unifiedCatalogListings } from "@/lib/listings";
import { getModerationQueue } from "@/services/moderation";
import { listAllSupportTicketsForAdmin } from "@/services/support";
import { storefrontSellers } from "@/services/sellers/seller-data";

import { listAdminPromotions } from "@/services/promotions";

import { getAdminSubscriptions } from "./mock";

export type AdminSearchEntityType =
  | "user"
  | "store"
  | "listing"
  | "request"
  | "ticket"
  | "subscription"
  | "moderation"
  | "promotion";

export type AdminSearchHit = {
  type: AdminSearchEntityType;
  typeLabel: string;
  title: string;
  subtitle?: string;
  href: string;
  haystack: string;
};

const TYPE_LABELS: Record<AdminSearchEntityType, string> = {
  user: "Пользователь",
  store: "Магазин",
  listing: "Объявление",
  request: "Запрос",
  ticket: "Тикет",
  subscription: "Подписка",
  moderation: "Модерация",
  promotion: "Продвижение",
};

function queuePath(queueType: string, id: string): string {
  if (queueType === "safety_report") return `/admin/moderation/reports/${id}`;
  if (queueType === "verification_case") return `/admin/moderation/verification/${id}`;
  if (queueType === "appeal_case") return `/admin/moderation/appeals/${id}`;
  return `/admin/moderation/reports/${id}`;
}

/** Синхронный компактный индекс для палитры поиска (mock). */
export function getAdminSearchIndex(): AdminSearchHit[] {
  const hits: AdminSearchHit[] = [];

  hits.push({
    type: "user",
    typeLabel: TYPE_LABELS.user,
    title: "Дмитрий П.",
    subtitle: "buyer-account:buyer-dmitriy",
    href: `/admin/users/${encodeURIComponent("buyer-account:buyer-dmitriy")}`,
    haystack: "дмитрий buyer buyer-dmitriy buyer-account",
  });

  for (const s of storefrontSellers) {
    const uid = `seller-account:${s.id}`;
    hits.push({
      type: "user",
      typeLabel: TYPE_LABELS.user,
      title: s.displayName,
      subtitle: uid,
      href: `/admin/users/${encodeURIComponent(uid)}`,
      haystack: `${s.displayName} ${uid} ${s.id} ${s.storefrontName}`.toLowerCase(),
    });
    hits.push({
      type: "store",
      typeLabel: TYPE_LABELS.store,
      title: s.storefrontName,
      subtitle: s.id,
      href: `/admin/stores/${encodeURIComponent(s.id)}`,
      haystack: `${s.storefrontName} ${s.id} магазин`.toLowerCase(),
    });
  }

  for (const l of unifiedCatalogListings) {
    hits.push({
      type: "listing",
      typeLabel: TYPE_LABELS.listing,
      title: l.title,
      subtitle: l.id,
      href: `/admin/listings/${encodeURIComponent(l.id)}`,
      haystack: `${l.title} ${l.id} ${l.sellerName ?? ""} ${l.worldLabel}`.toLowerCase(),
    });
  }

  for (const r of buyerRequestsMock.slice(0, 40)) {
    hits.push({
      type: "request",
      typeLabel: TYPE_LABELS.request,
      title: r.title,
      subtitle: r.id,
      href: `/admin/requests/${encodeURIComponent(r.id)}`,
      haystack: `${r.title} ${r.id} ${r.authorName}`.toLowerCase(),
    });
  }

  for (const t of listAllSupportTicketsForAdmin()) {
    hits.push({
      type: "ticket",
      typeLabel: TYPE_LABELS.ticket,
      title: t.subject,
      subtitle: t.id,
      href: `/admin/support/${encodeURIComponent(t.id)}`,
      haystack: `${t.subject} ${t.id} ${t.category} ${t.userId}`.toLowerCase(),
    });
  }

  for (const sub of getAdminSubscriptions()) {
    hits.push({
      type: "subscription",
      typeLabel: TYPE_LABELS.subscription,
      title: sub.accountLabel,
      subtitle: sub.id,
      href: `/admin/subscriptions/${encodeURIComponent(sub.id)}`,
      haystack: `${sub.accountLabel} ${sub.id} ${sub.currentPlanLabel} ${sub.status}`.toLowerCase(),
    });
  }

  for (const item of getModerationQueue({ status: "all", priority: "all", queueType: "all" })) {
    hits.push({
      type: "moderation",
      typeLabel: TYPE_LABELS.moderation,
      title: item.targetLabel,
      subtitle: `${item.id} · ${item.queueType}`,
      href: queuePath(item.queueType, item.id),
      haystack: `${item.targetLabel} ${item.id} ${item.summary} ${item.queueType} ${item.status}`.toLowerCase(),
    });
  }

  for (const pr of listAdminPromotions().slice(0, 35)) {
    hits.push({
      type: "promotion",
      typeLabel: TYPE_LABELS.promotion,
      title: pr.title,
      subtitle: `${pr.id} · ${pr.type}`,
      href: `/admin/promotions/${encodeURIComponent(pr.id)}`,
      haystack: `${pr.title} ${pr.id} ${pr.targetId} ${pr.ownerId} ${pr.type} ${pr.status}`.toLowerCase(),
    });
  }

  return hits;
}

export function filterAdminSearchHits(hits: AdminSearchHit[], query: string, limit = 40): AdminSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return hits.slice(0, limit);
  }
  return hits.filter((h) => h.haystack.includes(q) || h.title.toLowerCase().includes(q)).slice(0, limit);
}
