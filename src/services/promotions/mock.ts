import type { AdminTimeSeriesPoint } from "@/services/admin/types";
import { unifiedCatalogListings } from "@/lib/listings";
import type { AdminAuditEvent } from "@/services/admin/types";
import { getStorefrontSellerByListingId, storefrontSellers } from "@/services/sellers/seller-data";

import type {
  AdminPromoCampaign,
  AdminPromoCampaignPatch,
  AdminPromotion,
  AdminPromotionBulkAction,
  AdminPromotionListFilters,
  AdminPromotionPricingRule,
  AdminPromotionSlot,
  AdminPromotionSlotPatch,
  AdminPromotionStats,
  PromotionSource,
  PromotionStatus,
  PromotionType,
} from "./types";

const TYPES: PromotionType[] = ["boost", "featured_listing", "homepage_feature", "store_spotlight"];
const SOURCES: PromotionSource[] = ["paid_purchase", "subscription_entitlement", "admin_grant"];

function daysFromNow(days: number): string {
  return new Date(Date.now() + 86400000 * days).toISOString();
}

function daysAgo(days: number): string {
  return new Date(Date.now() - 86400000 * days).toISOString();
}

function pickStatus(i: number): PromotionStatus {
  const pool: PromotionStatus[] = ["active", "active", "scheduled", "paused", "expired", "draft", "active", "rejected"];
  return pool[i % pool.length];
}

function ctrFrom(i: number, suspicious: boolean): number {
  if (suspicious) {
    return 0.28 + (i % 5) * 0.02;
  }
  return 0.012 + (i % 8) * 0.004;
}

function buildInitialPromotions(): AdminPromotion[] {
  const rows: AdminPromotion[] = [];
  const listings = unifiedCatalogListings.slice(0, 18);
  listings.forEach((l, i) => {
    const seller = getStorefrontSellerByListingId(l.id);
    const ownerId = seller ? `seller-account:${seller.id}` : "seller-account:marina-tech";
    const storeId = seller?.id ?? "marina-tech";
    const type = TYPES[i % TYPES.length];
    const status = pickStatus(i);
    const impressions = 800 + i * 137;
    const clicks = Math.round(impressions * ctrFrom(i, i % 11 === 0));
    const suspiciousCtr = i % 11 === 0;
    const source = SOURCES[i % SOURCES.length];
    const flagged = i % 13 === 0 || i % 17 === 0;
    const repeatedAdminGrants = source === "admin_grant" && i % 4 === 0;
    const placementKeys = ["hp_hero", "cat_top", "world_banner", "search_top", null];
    const placementKey = type === "homepage_feature" ? "hp_hero" : placementKeys[i % placementKeys.length];
    const linkedSubscriptionId = i % 3 === 0 ? `sub-${storeId}` : null;
    const linkedInvoiceId = i === 2 ? "inv_2026_04" : null;
    const campaignId = i % 5 === 0 ? "cmp-new-sellers-q2" : i % 7 === 0 ? "cmp-electronics-spring" : null;

    rows.push({
      id: `prm-${String(i + 1).padStart(3, "0")}`,
      type,
      targetType: "listing",
      targetId: l.id,
      title: l.title.slice(0, 80),
      ownerId,
      storeId,
      status,
      price: type === "boost" ? 290 + (i % 4) * 50 : 1200 + i * 80,
      currency: "RUB",
      billingModel: type === "store_spotlight" ? "duration_based" : "one_time",
      startedAt: status === "draft" || status === "scheduled" ? null : daysAgo(20 - (i % 15)),
      endsAt: status === "expired" ? daysAgo(2) : status === "draft" ? null : daysFromNow((i % 9) - 2),
      placementKey,
      impressions,
      clicks,
      ctr: clicks / Math.max(impressions, 1),
      conversions: Math.round(clicks * 0.04),
      source,
      flagged,
      notesCount: i % 4 === 0 ? 2 : i % 3 === 0 ? 1 : 0,
      suspiciousCtr,
      repeatedAdminGrants,
      linkedSubscriptionId,
      linkedInvoiceId,
      campaignId,
    });
  });

  storefrontSellers.forEach((s, j) => {
    const i = 18 + j;
    const status: PromotionStatus = j === 0 ? "active" : j === 1 ? "paused" : "scheduled";
    rows.push({
      id: `prm-${String(i + 1).padStart(3, "0")}`,
      type: "store_spotlight",
      targetType: "store",
      targetId: s.id,
      title: `Витрина · ${s.storefrontName}`,
      ownerId: `seller-account:${s.id}`,
      storeId: s.id,
      status,
      price: 4990 + j * 500,
      currency: "RUB",
      billingModel: "duration_based",
      startedAt: daysAgo(10 - j),
      endsAt: daysFromNow(18 + j),
      placementKey: "store_spotlight_feed",
      impressions: 12000 + j * 900,
      clicks: 340 + j * 40,
      ctr: 0.04 + j * 0.002,
      conversions: 12 + j,
      source: j % 2 === 0 ? "paid_purchase" : "subscription_entitlement",
      flagged: s.id === "alexey-drive",
      notesCount: j === 0 ? 3 : 0,
      suspiciousCtr: false,
      repeatedAdminGrants: false,
      linkedSubscriptionId: `sub-${s.id}`,
      linkedInvoiceId: null,
      campaignId: j === 2 ? "cmp-new-sellers-q2" : null,
    });
  });

  return rows;
}

let promotions: AdminPromotion[] = buildInitialPromotions();

const initialSlots: AdminPromotionSlot[] = [
  {
    id: "slot-1",
    key: "hp_hero",
    title: "Главная · герой",
    location: "homepage",
    capacity: 4,
    activeCount: 3,
    pricingModel: "auction_mock",
    basePrice: 8900,
    fillRate: 0.78,
    status: "active",
    scopeLabel: "Глобально",
  },
  {
    id: "slot-2",
    key: "cat_top",
    title: "Топ категории",
    location: "category",
    capacity: 8,
    activeCount: 6,
    pricingModel: "fixed",
    basePrice: 2100,
    fillRate: 0.72,
    status: "active",
    scopeLabel: "Электроника",
  },
  {
    id: "slot-3",
    key: "world_banner",
    title: "Баннер мира",
    location: "world",
    capacity: 3,
    activeCount: 2,
    pricingModel: "fixed",
    basePrice: 4500,
    fillRate: 0.62,
    status: "active",
    scopeLabel: "Авто",
  },
  {
    id: "slot-4",
    key: "search_top",
    title: "Выдача · закреп",
    location: "search",
    capacity: 10,
    activeCount: 4,
    pricingModel: "auction_mock",
    basePrice: 1500,
    fillRate: 0.41,
    status: "paused",
    scopeLabel: "Поиск",
  },
  {
    id: "slot-5",
    key: "store_spotlight_feed",
    title: "Лента · spotlight магазинов",
    location: "homepage",
    capacity: 12,
    activeCount: 9,
    pricingModel: "fixed",
    basePrice: 4990,
    fillRate: 0.75,
    status: "active",
    scopeLabel: "Магазины",
  },
  {
    id: "slot-6",
    key: "agri_featured",
    title: "Агро · избранное",
    location: "world",
    capacity: 5,
    activeCount: 5,
    pricingModel: "fixed",
    basePrice: 3200,
    fillRate: 1,
    status: "active",
    scopeLabel: "Агро",
  },
];

let slots: AdminPromotionSlot[] = initialSlots.map((s) => ({ ...s }));

const initialCampaigns: AdminPromoCampaign[] = [
  {
    id: "cmp-new-sellers-q2",
    title: "Новые продавцы · Q2 boost pack",
    status: "active",
    targetScope: "new_sellers",
    targetScopeLabel: "Регистрация < 90 дней",
    linkedPromotionIds: promotions.filter((p) => p.campaignId === "cmp-new-sellers-q2").map((p) => p.id),
    budget: 450000,
    spent: 182400,
    startsAt: daysAgo(40),
    endsAt: daysFromNow(50),
  },
  {
    id: "cmp-electronics-spring",
    title: "Электроника · весенний трафик",
    status: "scheduled",
    targetScope: "specific_world",
    targetScopeLabel: "Мир: electronics",
    linkedPromotionIds: promotions.filter((p) => p.campaignId === "cmp-electronics-spring").map((p) => p.id),
    budget: 200000,
    spent: 0,
    startsAt: daysFromNow(3),
    endsAt: daysFromNow(45),
  },
  {
    id: "cmp-all-free-shipping",
    title: "Cross-sell · доставка (mock)",
    status: "draft",
    targetScope: "all",
    targetScopeLabel: "Все магазины",
    linkedPromotionIds: [],
    budget: 120000,
    spent: 0,
    startsAt: daysFromNow(14),
    endsAt: null,
  },
  {
    id: "cmp-stores-pro",
    title: "Магазины на плане Pro+",
    status: "active",
    targetScope: "stores",
    targetScopeLabel: "План Pro и выше",
    linkedPromotionIds: promotions.filter((p) => p.type === "store_spotlight" && p.status === "active").map((p) => p.id),
    budget: 300000,
    spent: 221000,
    startsAt: daysAgo(60),
    endsAt: daysFromNow(120),
  },
  {
    id: "cmp-completed-pilot",
    title: "Пилот избранного (завершён)",
    status: "completed",
    targetScope: "specific_world",
    targetScopeLabel: "real_estate",
    linkedPromotionIds: ["prm-001", "prm-004"],
    budget: 80000,
    spent: 79800,
    startsAt: daysAgo(120),
    endsAt: daysAgo(14),
  },
];

let campaigns: AdminPromoCampaign[] = initialCampaigns.map((c) => ({ ...c, linkedPromotionIds: [...c.linkedPromotionIds] }));

const pricingRulesSeed: AdminPromotionPricingRule[] = [
  {
    id: "rule-1",
    promotionType: "boost",
    targetScope: "default",
    targetValue: "—",
    basePrice: 290,
    durationDays: 7,
    active: true,
    entitlementHint: "План Pro: до 4 бустов/мес включено",
  },
  {
    id: "rule-2",
    promotionType: "boost",
    targetScope: "plan",
    targetValue: "business",
    basePrice: 0,
    durationDays: 7,
    active: true,
    entitlementHint: "Business: бусты без доп. оплаты в лимите",
  },
  {
    id: "rule-3",
    promotionType: "featured_listing",
    targetScope: "category",
    targetValue: "phones",
    basePrice: 1500,
    durationDays: 14,
    active: true,
    entitlementHint: null,
  },
  {
    id: "rule-4",
    promotionType: "homepage_feature",
    targetScope: "world",
    targetValue: "electronics",
    basePrice: 8900,
    durationDays: 7,
    active: true,
    entitlementHint: "Только paid add-on",
  },
  {
    id: "rule-5",
    promotionType: "store_spotlight",
    targetScope: "plan",
    targetValue: "starter",
    basePrice: 4990,
    durationDays: 30,
    active: true,
    entitlementHint: "Starter: только покупка слота",
  },
  {
    id: "rule-6",
    promotionType: "featured_listing",
    targetScope: "plan",
    targetValue: "pro",
    basePrice: 990,
    durationDays: 7,
    active: true,
    entitlementHint: "Pro: скидка 33% к default",
  },
  {
    id: "rule-7",
    promotionType: "boost",
    targetScope: "world",
    targetValue: "agriculture",
    basePrice: 190,
    durationDays: 7,
    active: false,
    entitlementHint: "Выключено для сезонной паузы",
  },
];

let pricingRules: AdminPromotionPricingRule[] = pricingRulesSeed.map((r) => ({ ...r }));

const timelines = new Map<string, AdminAuditEvent[]>();

function seedTimelines() {
  for (const p of promotions) {
    timelines.set(p.id, [
      {
        id: `${p.id}-e1`,
        at: new Date(Date.now() - 86400000 * 8).toLocaleString("ru-RU"),
        actor: "billing_mock",
        action: "Создано размещение",
        detail: `Источник: ${p.source}, сумма ${p.price} ₽`,
      },
      {
        id: `${p.id}-e2`,
        at: new Date(Date.now() - 86400000 * 3).toLocaleString("ru-RU"),
        actor: "ops_console",
        action: p.status === "active" ? "Активировано" : "Статус обновлён",
        detail: `Текущий статус: ${p.status}`,
      },
    ]);
  }
}

seedTimelines();

function recomputeSlotActiveCounts() {
  const byKey = new Map<string, number>();
  for (const p of promotions) {
    if (p.status !== "active" || !p.placementKey) continue;
    byKey.set(p.placementKey, (byKey.get(p.placementKey) ?? 0) + 1);
  }
  slots = slots.map((s) => {
    const ac = byKey.get(s.key) ?? 0;
    const fillRate = s.capacity > 0 ? Math.min(1, ac / s.capacity) : 0;
    return { ...s, activeCount: ac, fillRate: Math.round(fillRate * 100) / 100 };
  });
}

recomputeSlotActiveCounts();

function syncCampaignLinks() {
  campaigns = campaigns.map((c) => {
    if (c.status === "completed") {
      return { ...c, linkedPromotionIds: [...c.linkedPromotionIds] };
    }
    return {
      ...c,
      linkedPromotionIds: promotions.filter((p) => p.campaignId === c.id).map((p) => p.id),
    };
  });
}

syncCampaignLinks();

export function getAdminPromotionStats(): AdminPromotionStats {
  const now = Date.now();
  const week = 86400000 * 7;
  const activePromotions = promotions.filter((p) => p.status === "active").length;
  const scheduledPromotions = promotions.filter((p) => p.status === "scheduled").length;
  const expiringSoon = promotions.filter((p) => {
    if (!p.endsAt || p.status !== "active") return false;
    const t = new Date(p.endsAt).getTime();
    return t > now && t < now + week;
  }).length;
  const totalPromoRevenue = promotions
    .filter((p) => p.source === "paid_purchase" && (p.status === "active" || p.status === "expired"))
    .reduce((a, p) => a + p.price, 0);
  const fillRateAvg =
    slots.length === 0 ? 0 : slots.reduce((a, s) => a + s.fillRate, 0) / slots.length;
  const flaggedPromotions = promotions.filter((p) => p.flagged || p.suspiciousCtr).length;
  return {
    activePromotions,
    scheduledPromotions,
    expiringSoon,
    totalPromoRevenue,
    fillRateAvg: Math.round(fillRateAvg * 100) / 100,
    flaggedPromotions,
  };
}

export function listAdminPromotions(filters?: AdminPromotionListFilters): AdminPromotion[] {
  let rows = promotions.map((p) => ({ ...p }));
  const f = filters ?? {};
  if (f.type && f.type !== "all") {
    rows = rows.filter((p) => p.type === f.type);
  }
  if (f.status && f.status !== "all") {
    rows = rows.filter((p) => p.status === f.status);
  }
  if (f.source && f.source !== "all") {
    rows = rows.filter((p) => p.source === f.source);
  }
  if (f.flagged === "1") {
    rows = rows.filter((p) => p.flagged || p.suspiciousCtr);
  }
  if (f.expiringSoon) {
    const now = Date.now();
    const week = 86400000 * 7;
    rows = rows.filter((p) => {
      if (!p.endsAt || p.status !== "active") return false;
      const t = new Date(p.endsAt).getTime();
      return t > now && t < now + week;
    });
  }
  if (f.ownerId?.trim()) {
    const q = f.ownerId.trim().toLowerCase();
    rows = rows.filter((p) => p.ownerId.toLowerCase().includes(q));
  }
  if (f.storeId?.trim()) {
    const q = f.storeId.trim().toLowerCase();
    rows = rows.filter((p) => (p.storeId ?? "").toLowerCase().includes(q));
  }
  if (f.placementKey?.trim()) {
    const pk = f.placementKey.trim();
    rows = rows.filter((p) => p.placementKey === pk);
  }
  const sq = f.search?.trim().toLowerCase();
  if (sq) {
    rows = rows.filter((p) => `${p.title} ${p.id} ${p.targetId}`.toLowerCase().includes(sq));
  }
  return rows;
}

export function getAdminPromotionById(id: string): AdminPromotion | undefined {
  return promotions.find((p) => p.id === id);
}

export function listAdminPromotionSlots(): AdminPromotionSlot[] {
  return slots.map((s) => ({ ...s }));
}

export function getAdminPromotionSlotById(id: string): AdminPromotionSlot | undefined {
  return slots.find((s) => s.id === id);
}

export function listAdminPromoCampaigns(): AdminPromoCampaign[] {
  return campaigns.map((c) => ({ ...c, linkedPromotionIds: [...c.linkedPromotionIds] }));
}

export function getAdminPromoCampaignById(id: string): AdminPromoCampaign | undefined {
  const c = campaigns.find((x) => x.id === id);
  return c ? { ...c, linkedPromotionIds: [...c.linkedPromotionIds] } : undefined;
}

export function listAdminPromotionPricingRules(): AdminPromotionPricingRule[] {
  return pricingRules.map((r) => ({ ...r }));
}

export function getAdminPromotionTimeline(promotionId: string): AdminAuditEvent[] {
  return [...(timelines.get(promotionId) ?? [])];
}

function pushTimeline(promotionId: string, action: string, detail: string, actor = "ops_console") {
  const list = timelines.get(promotionId) ?? [];
  const ev: AdminAuditEvent = {
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toLocaleString("ru-RU"),
    actor,
    action,
    detail,
  };
  timelines.set(promotionId, [ev, ...list]);
}

export function listPromotionsForSlotKey(slotKey: string): AdminPromotion[] {
  return promotions.filter((p) => p.placementKey === slotKey && p.status === "active");
}

export function listPromotionsForListing(listingId: string): AdminPromotion[] {
  return promotions.filter((p) => p.targetType === "listing" && p.targetId === listingId);
}

export function listPromotionsForStore(storeId: string): AdminPromotion[] {
  return promotions.filter((p) => (p.targetType === "store" && p.targetId === storeId) || p.storeId === storeId);
}

export function listPromotionsForSubscription(subscriptionId: string): AdminPromotion[] {
  return promotions.filter((p) => p.linkedSubscriptionId === subscriptionId);
}

export function listPromotionsOnInvoice(invoiceId: string): AdminPromotion[] {
  return promotions.filter((p) => p.linkedInvoiceId === invoiceId);
}

export function getAdminPromotionSeries(): AdminTimeSeriesPoint[] {
  const base = 42;
  return ["−6н", "−5н", "−4н", "−3н", "−2н", "−1н", "сейчас"].map((label, i) => ({
    label,
    value: Math.round(base * (0.88 + i * 0.04) + i * 5),
  }));
}

export function adminPatchPromotionSlot(slotId: string, patch: AdminPromotionSlotPatch): AdminPromotionSlot | null {
  const idx = slots.findIndex((s) => s.id === slotId);
  if (idx === -1) return null;
  const next = { ...slots[idx], ...patch };
  if (patch.capacity != null && next.activeCount > next.capacity) {
    next.activeCount = next.capacity;
  }
  next.fillRate = next.capacity > 0 ? Math.round((next.activeCount / next.capacity) * 100) / 100 : 0;
  slots = [...slots.slice(0, idx), next, ...slots.slice(idx + 1)];
  return next;
}

export function adminPatchPromoCampaign(campaignId: string, patch: AdminPromoCampaignPatch): AdminPromoCampaign | null {
  const idx = campaigns.findIndex((c) => c.id === campaignId);
  if (idx === -1) return null;
  const next = { ...campaigns[idx], ...patch, linkedPromotionIds: patch.linkedPromotionIds ?? campaigns[idx].linkedPromotionIds };
  campaigns = [...campaigns.slice(0, idx), next, ...campaigns.slice(idx + 1)];
  return { ...next, linkedPromotionIds: [...next.linkedPromotionIds] };
}

function applyBulkAction(id: string, action: AdminPromotionBulkAction): { ok: boolean } {
  const idx = promotions.findIndex((p) => p.id === id);
  if (idx === -1) return { ok: false };
  const p = promotions[idx];
  const next: AdminPromotion = { ...p };

  if (action === "pause") {
    if (next.status !== "active") return { ok: false };
    next.status = "paused";
    pushTimeline(id, "Пауза", "Размещение приостановлено оператором");
  } else if (action === "resume") {
    if (next.status !== "paused") return { ok: false };
    next.status = "active";
    pushTimeline(id, "Возобновлено", "Статус: активно");
  } else if (action === "expire") {
    next.status = "expired";
    next.endsAt = new Date().toISOString();
    pushTimeline(id, "Истекло", "Принудительное завершение");
  } else if (action === "flag") {
    next.flagged = true;
    pushTimeline(id, "Флаг риска", "Помечено для модерации / финансов");
  } else if (action === "unflag") {
    next.flagged = false;
    pushTimeline(id, "Снят флаг", "Проверка завершена (mock)");
  } else if (action === "revoke_admin_grant") {
    if (next.source !== "admin_grant") return { ok: false };
    next.source = "paid_purchase";
    next.price = Math.max(290, Math.round(next.price * 0.5));
    pushTimeline(id, "Отзыв админ-гранта", "Источник сменён на paid_purchase (mock)");
  } else {
    return { ok: false };
  }

  promotions = [...promotions.slice(0, idx), next, ...promotions.slice(idx + 1)];
  recomputeSlotActiveCounts();
  syncCampaignLinks();
  return { ok: true };
}

export function adminBulkPromotionActions(ids: string[], action: AdminPromotionBulkAction): { updated: number; skipped: number } {
  let updated = 0;
  let skipped = 0;
  for (const id of ids) {
    const r = applyBulkAction(id, action);
    if (r.ok) {
      updated += 1;
    } else {
      skipped += 1;
    }
  }
  return { updated, skipped };
}

export function adminPatchPromotion(id: string, patch: Partial<AdminPromotion>): AdminPromotion | null {
  const idx = promotions.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const prev = promotions[idx];
  const next = { ...prev, ...patch };
  promotions = [...promotions.slice(0, idx), next, ...promotions.slice(idx + 1)];
  if (patch.status && patch.status !== prev.status) {
    pushTimeline(id, "Статус", `${prev.status} → ${patch.status}`);
  }
  recomputeSlotActiveCounts();
  syncCampaignLinks();
  return next;
}

export function adminTogglePricingRule(ruleId: string, active: boolean): AdminPromotionPricingRule | null {
  const idx = pricingRules.findIndex((r) => r.id === ruleId);
  if (idx === -1) return null;
  const next = { ...pricingRules[idx], active };
  pricingRules = [...pricingRules.slice(0, idx), next, ...pricingRules.slice(idx + 1)];
  return next;
}

export function adminDuplicateCampaign(campaignId: string): AdminPromoCampaign | null {
  const c = getAdminPromoCampaignById(campaignId);
  if (!c) return null;
  const newId = `cmp-copy-${Date.now().toString(36)}`;
  const copy: AdminPromoCampaign = {
    ...c,
    id: newId,
    title: `${c.title} (копия)`,
    status: "draft",
    spent: 0,
    linkedPromotionIds: [],
    startsAt: daysFromNow(1),
    endsAt: null,
  };
  campaigns = [...campaigns, copy];
  return { ...copy, linkedPromotionIds: [...copy.linkedPromotionIds] };
}

export function listRiskPromotionSummaries(): {
  id: string;
  title: string;
  reason: string;
  hrefSuffix: string;
}[] {
  return promotions
    .filter((p) => p.flagged || p.suspiciousCtr || p.repeatedAdminGrants)
    .slice(0, 12)
    .map((p) => ({
      id: p.id,
      title: p.title,
      hrefSuffix: p.id,
      reason: p.suspiciousCtr
        ? "Подозрительный CTR"
        : p.repeatedAdminGrants
          ? "Повторные админские гранты"
          : p.flagged
            ? "Помечено модерацией / риском"
            : "Аномалия",
    }));
}
