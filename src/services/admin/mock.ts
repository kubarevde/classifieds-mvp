import { billingPlansMock } from "@/mocks/billing/plans";
import { invoicesMock } from "@/mocks/billing/payments";
import type { UnifiedCatalogListing } from "@/lib/listings.types";
import { getSellerPlanTierLabel } from "@/entities/seller/mappers";
import { mockListingsService } from "@/services/listings";
import { getBuyerRequests } from "@/services/requests";
import { getModerationStats } from "@/services/moderation";
import { storefrontSellers, getStorefrontSellerById } from "@/services/sellers/seller-data";
import {
  listAllSupportTicketsForAdmin,
  type SupportTicket,
} from "@/services/support";

import type {
  AdminBulkListingAction,
  AdminFeatureGateRow,
  AdminInvoice,
  AdminListing,
  AdminListingFilters,
  AdminMarketplaceStats,
  AdminPayout,
  AdminPlanRow,
  AdminRequest,
  AdminRequestFilters,
  AdminRevenueSummary,
  AdminStore,
  AdminStoreFilters,
  AdminSubscription,
  AdminSubscriptionStatus,
  AdminSupportFilters,
  AdminSupportTicketRow,
  AdminTimeSeriesPoint,
  AdminUser,
  AdminUserFilters,
} from "./types";

const suspendedUserIds = new Set<string>();

/** In-memory правки объявлений после bulk-действий (mock). */
const listingOverrides: Record<string, Partial<Pick<AdminListing, "status" | "flagsCount">>> = {};

function applyListingAdminOverrides(row: AdminListing): AdminListing {
  const o = listingOverrides[row.id];
  return o ? { ...row, ...o } : row;
}

export function adminApplyBulkListingActions(
  ids: string[],
  action: AdminBulkListingAction,
): { updated: number; skipped: number } {
  let updated = 0;
  let skipped = 0;
  for (const id of ids) {
    if (!id) {
      skipped += 1;
      continue;
    }
    if (action === "approve" || action === "mark_reviewed") {
      listingOverrides[id] = { ...listingOverrides[id], status: "active" };
      updated += 1;
    } else if (action === "reject" || action === "remove") {
      listingOverrides[id] = { ...listingOverrides[id], status: "removed" };
      updated += 1;
    } else if (action === "unflag") {
      listingOverrides[id] = { ...listingOverrides[id], flagsCount: 0 };
      updated += 1;
    } else {
      skipped += 1;
    }
  }
  return { updated, skipped };
}

function planLabelForSeller(planId: string | undefined): string {
  const p = billingPlansMock.find((x) => x.id === planId);
  return p?.name ?? planId ?? "—";
}

function storePlanToBillingId(tier: (typeof storefrontSellers)[number]["planTier"]): string {
  if (tier === "business") {
    return "business";
  }
  if (tier === "pro") {
    return "pro";
  }
  return "starter";
}

export async function getAdminUsers(filters?: AdminUserFilters): Promise<AdminUser[]> {
  const rows: AdminUser[] = storefrontSellers.map((s) => ({
    id: `seller-account:${s.id}`,
    displayName: s.storefrontName,
    email: `${s.id}@demo.classify.local`,
    role: "store",
    status: suspendedUserIds.has(`seller-account:${s.id}`) ? "suspended" : "active",
    registeredAt: new Date(Date.now() - 86400000 * 120).toISOString(),
    listingsCount: s.listingRefs.filter((r) => r.status === "active").length,
    storesCount: 1,
    trustScore: Math.round(s.metrics.rating * 20),
    verificationStatus: s.trustBadges.some((b) => b.id === "verified") ? "verified" : "pending",
    flagsCount: s.id === "marina-tech" ? 1 : 0,
    reportsCount: s.id === "alexey-drive" ? 2 : 0,
    currentPlanLabel: `${getSellerPlanTierLabel(s.planTier)} · биллинг`,
    linkedSellerIds: [s.id],
  }));

  rows.unshift({
    id: "buyer-account:buyer-dmitriy",
    displayName: "Дмитрий П.",
    email: "dmitriy.p@demo.classify.local",
    role: "buyer",
    status: suspendedUserIds.has("buyer-account:buyer-dmitriy") ? "suspended" : "active",
    registeredAt: new Date(Date.now() - 86400000 * 400).toISOString(),
    listingsCount: 0,
    storesCount: 0,
    trustScore: 72,
    verificationStatus: "verified",
    flagsCount: 0,
    reportsCount: 0,
    currentPlanLabel: "Про (покупатель)",
    linkedSellerIds: [],
  });

  let out = rows;
  if (filters?.role && filters.role !== "all") {
    out = out.filter((u) => u.role === filters.role || (filters.role === "seller" && u.role === "store"));
  }
  if (filters?.status && filters.status !== "all") {
    out = out.filter((u) => u.status === filters.status);
  }
  if (filters?.verification && filters.verification !== "all") {
    out = out.filter((u) => u.verificationStatus === filters.verification);
  }
  if (filters?.hasStore === "yes") {
    out = out.filter((u) => u.storesCount > 0);
  }
  if (filters?.hasStore === "no") {
    out = out.filter((u) => u.storesCount === 0);
  }
  const q = filters?.search?.trim().toLowerCase();
  if (q) {
    out = out.filter((u) => `${u.displayName} ${u.email} ${u.id}`.toLowerCase().includes(q));
  }
  return out;
}

export async function getAdminUserById(id: string): Promise<AdminUser | null> {
  const all = await getAdminUsers();
  return all.find((u) => u.id === id) ?? null;
}

export function adminSetUserSuspended(userId: string, suspended: boolean): void {
  if (suspended) {
    suspendedUserIds.add(userId);
  } else {
    suspendedUserIds.delete(userId);
  }
}

function mapListing(l: UnifiedCatalogListing): AdminListing {
  const seller = getStorefrontSellerByListingId(l.id);
  const flagsCount = l.id.length % 4 === 0 ? 2 : l.id.length % 5 === 0 ? 1 : 0;
  return {
    id: l.id,
    title: l.title,
    sellerUserId: seller ? `seller-account:${seller.id}` : "unknown",
    sellerLabel: seller?.storefrontName ?? l.sellerName,
    status: "active",
    world: l.world,
    worldLabel: l.worldLabel,
    categoryLabel: l.categoryLabel,
    priceLabel: l.price,
    createdAt: l.postedAtIso,
    flagsCount,
    isBoosted: l.id.charCodeAt(2) % 3 === 0,
    isPromoted: l.id.charCodeAt(3) % 4 === 0,
    trustHint: flagsCount > 0 ? "Есть сигналы жалоб" : "Чистая карточка",
  };
}

function getStorefrontSellerByListingId(listingId: string) {
  return storefrontSellers.find((s) => s.listingRefs.some((r) => r.listingId === listingId)) ?? null;
}

export async function getAdminListings(filters?: AdminListingFilters): Promise<AdminListing[]> {
  const raw = await mockListingsService.getAll();
  let rows = raw.map(mapListing);
  if (filters?.status && filters.status !== "all") {
    rows = rows.filter((r) => r.status === filters.status);
  }
  if (filters?.world && filters.world !== "all") {
    rows = rows.filter((r) => r.world === filters.world);
  }
  if (filters?.flaggedOnly) {
    rows = rows.filter((r) => r.flagsCount > 0);
  }
  if (filters?.promotedOnly) {
    rows = rows.filter((r) => r.isBoosted || r.isPromoted);
  }
  const q = filters?.search?.trim().toLowerCase();
  if (q) {
    rows = rows.filter((r) => `${r.title} ${r.sellerLabel}`.toLowerCase().includes(q));
  }
  return rows.map(applyListingAdminOverrides);
}

export async function getAdminListingById(id: string): Promise<AdminListing | null> {
  const l = await mockListingsService.getById(id);
  return l ? applyListingAdminOverrides(mapListing(l)) : null;
}

export async function getAdminStores(filters?: AdminStoreFilters): Promise<AdminStore[]> {
  let rows: AdminStore[] = storefrontSellers.map((s) => ({
    id: s.id,
    name: s.storefrontName,
    ownerUserId: `seller-account:${s.id}`,
    ownerLabel: s.displayName,
    status: s.id === "ildar-estate" ? "pending_review" : "active",
    verified: s.trustBadges.some((b) => b.id === "verified"),
    planLabel: planLabelForSeller(storePlanToBillingId(s.planTier)),
    activeListings: s.listingRefs.filter((r) => r.status === "active").length,
    trustScore: Math.round(s.metrics.rating * 20),
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    worldFocus: String(s.worldHint),
  }));
  if (filters?.status && filters.status !== "all") {
    rows = rows.filter((r) => r.status === filters.status);
  }
  if (filters?.verified === "yes") {
    rows = rows.filter((r) => r.verified);
  }
  if (filters?.verified === "no") {
    rows = rows.filter((r) => !r.verified);
  }
  const q = filters?.search?.trim().toLowerCase();
  if (q) {
    rows = rows.filter((r) => `${r.name} ${r.ownerLabel}`.toLowerCase().includes(q));
  }
  return rows;
}

export async function getAdminStoreById(id: string): Promise<AdminStore | null> {
  const rows = await getAdminStores();
  return rows.find((s) => s.id === id) ?? null;
}

export async function getAdminRequests(filters?: AdminRequestFilters): Promise<AdminRequest[]> {
  const raw = await getBuyerRequests();
  let rows: AdminRequest[] = raw.map((r) => {
    const urgency: AdminRequest["urgency"] =
      r.urgency === "today" ? "high" : r.urgency === "this_week" ? "normal" : "low";
    const status: AdminRequest["status"] =
      r.status === "fulfilled"
        ? "fulfilled"
        : r.status === "active"
          ? "active"
          : "closed";
    return {
      id: r.id,
      title: r.title,
      buyerUserId: `buyer-account:${r.authorId}`,
      buyerLabel: r.authorName,
      worldLabel: r.worldId ?? "—",
      budgetLabel: `${r.budget.min ?? "—"}–${r.budget.max ?? "—"} ₽`,
      status,
      urgency,
      responsesCount: r.responseCount,
      flagsCount: r.id.endsWith("1") ? 1 : 0,
      createdAt: r.createdAt,
    };
  });
  if (filters?.status && filters.status !== "all") {
    rows = rows.filter((x) => x.status === filters.status);
  }
  if (filters?.world && filters.world !== "all") {
    rows = rows.filter((x) => x.worldLabel === filters.world);
  }
  if (filters?.urgentOnly) {
    rows = rows.filter((x) => x.urgency === "high");
  }
  if (filters?.flaggedOnly) {
    rows = rows.filter((x) => x.flagsCount > 0);
  }
  const q = filters?.search?.trim().toLowerCase();
  if (q) {
    rows = rows.filter((x) => `${x.title} ${x.buyerLabel}`.toLowerCase().includes(q));
  }
  return rows;
}

export async function getAdminRequestById(id: string): Promise<AdminRequest | null> {
  const rows = await getAdminRequests();
  return rows.find((r) => r.id === id) ?? null;
}

function ticketToRow(t: SupportTicket): AdminSupportTicketRow {
  return {
    id: t.id,
    subject: t.subject,
    userId: t.userId,
    userLabel: t.userId.includes("marina") ? "МаринаТех" : "Дмитрий П.",
    category: t.category,
    status: t.status,
    priority: t.priority ?? "normal",
    createdAt: t.createdAt,
    assignedTo: t.assignedTo ?? null,
  };
}

export function getAdminSupportTickets(filters?: AdminSupportFilters): AdminSupportTicketRow[] {
  let rows = listAllSupportTicketsForAdmin().map(ticketToRow);
  if (filters?.status && filters.status !== "all") {
    rows = rows.filter((r) => r.status === filters.status);
  }
  if (filters?.priority && filters.priority !== "all") {
    rows = rows.filter((r) => r.priority === filters.priority);
  }
  if (filters?.category && filters.category !== "all") {
    rows = rows.filter((r) => r.category === filters.category);
  }
  if (filters?.assigned && filters.assigned !== "all") {
    rows = rows.filter((r) => (filters.assigned === "unassigned" ? !r.assignedTo : r.assignedTo === filters.assigned));
  }
  const q = filters?.search?.trim().toLowerCase();
  if (q) {
    rows = rows.filter((r) => `${r.subject} ${r.userLabel}`.toLowerCase().includes(q));
  }
  return rows;
}

let subscriptionState: AdminSubscription[] | null = null;

function seedSubscriptions(): AdminSubscription[] {
  return storefrontSellers.map((s, i) => ({
    id: `sub-${s.id}`,
    accountLabel: s.storefrontName,
    accountType: "store" as const,
    accountRefId: s.id,
    currentPlanId: storePlanToBillingId(s.planTier),
    currentPlanLabel: planLabelForSeller(storePlanToBillingId(s.planTier)),
    status: i === 1 ? "past_due" : "active",
    billingCycle: i % 2 === 0 ? "monthly" : "annual",
    nextBillingAt: new Date(Date.now() + 86400000 * 12).toISOString(),
    amountMonthlyRub: s.planTier === "business" ? 5990 : s.planTier === "pro" ? 2490 : 990,
    paymentStatus: i === 1 ? "failed" : "ok",
  }));
}

export type AdminSubscriptionListFilters = {
  status?: AdminSubscriptionStatus | "all";
  paymentStatus?: AdminSubscription["paymentStatus"] | "all";
};

export function getAdminSubscriptions(filters?: AdminSubscriptionListFilters): AdminSubscription[] {
  if (!subscriptionState) {
    subscriptionState = seedSubscriptions();
  }
  let rows = subscriptionState.map((s) => ({ ...s }));
  if (filters?.status && filters.status !== "all") {
    rows = rows.filter((s) => s.status === filters.status);
  }
  if (filters?.paymentStatus && filters.paymentStatus !== "all") {
    rows = rows.filter((s) => s.paymentStatus === filters.paymentStatus);
  }
  return rows;
}

export function adminBulkPauseSubscriptions(ids: string[]): { updated: number; skipped: number } {
  if (!subscriptionState) {
    subscriptionState = seedSubscriptions();
  }
  let updated = 0;
  let skipped = 0;
  const idSet = new Set(ids);
  subscriptionState = subscriptionState.map((s) => {
    if (!idSet.has(s.id)) {
      return s;
    }
    if (s.status === "canceled") {
      skipped += 1;
      return s;
    }
    updated += 1;
    return { ...s, status: "paused" as const };
  });
  return { updated, skipped };
}

export function getAdminSubscriptionById(id: string): AdminSubscription | null {
  return getAdminSubscriptions().find((s) => s.id === id) ?? null;
}

export function adminPatchSubscription(id: string, patch: Partial<AdminSubscription>): AdminSubscription | null {
  const list = getAdminSubscriptions();
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) {
    return null;
  }
  const next = { ...list[idx], ...patch };
  subscriptionState = [...list.slice(0, idx), next, ...list.slice(idx + 1)];
  return { ...next };
}

export function getAdminPlans(): AdminPlanRow[] {
  return billingPlansMock
    .filter((p) => p.id !== "free")
    .map((p) => ({
      id: p.id,
      name: p.name,
      priceMonthlyRub: p.price.monthly,
      priceAnnualRub: p.price.annual,
      status: p.id === "starter" ? "inactive" : "active",
      featureSummary: p.features.slice(0, 4).join(", "),
      limitsSummary: `листинги ≤ ${p.limits.active_listings}, бусты/мес ${p.limits.boosts_per_month}`,
    }));
}

export function getAdminInvoices(): AdminInvoice[] {
  return invoicesMock.map((inv) => ({
    id: inv.id,
    accountLabel: getStorefrontSellerById(inv.storeId)?.storefrontName ?? inv.storeId,
    amountRub: inv.amount,
    status: inv.status === "paid" ? "paid" : inv.status === "void" ? "void" : "open",
    issuedAt: inv.createdAt,
    paidAt: inv.status === "paid" ? inv.createdAt : null,
    downloadable: inv.status === "paid",
  }));
}

export function getAdminPayouts(): AdminPayout[] {
  return storefrontSellers.slice(0, 3).map((s, i) => ({
    id: `payout-${s.id}`,
    storeLabel: s.storefrontName,
    storeId: s.id,
    amountRub: 12000 + i * 3400,
    status: i === 0 ? "pending" : i === 1 ? "on_hold" : "paid",
    periodLabel: "2026-03",
    method: "СБП / расчётный счёт",
    holdReason: i === 1 ? "Ручная проверка риска" : null,
  }));
}

export function getAdminRevenueSummary(): AdminRevenueSummary {
  const subs = getAdminSubscriptions();
  const mrr = subs.filter((s) => s.status === "active").reduce((a, s) => a + s.amountMonthlyRub, 0);
  return {
    mrrRub: mrr,
    arrRub: mrr * 12 * 0.92,
    paidSubscriptions: subs.filter((s) => s.status === "active").length,
    failedPayments7d: 2,
    pendingPayoutsRub: getAdminPayouts().filter((p) => p.status === "pending" || p.status === "on_hold").reduce((a, p) => a + p.amountRub, 0),
  };
}

export async function getAdminMarketplaceStats(): Promise<AdminMarketplaceStats> {
  const listings = await mockListingsService.getAll();
  const requests = await getBuyerRequests();
  const tickets = listAllSupportTicketsForAdmin();
  const mod = getModerationStats();
  const stores = await getAdminStores();
  const users = await getAdminUsers();

  return {
    totalUsers: users.length,
    activeListings: listings.filter(() => true).length,
    newRequests7d: requests.filter((r) => new Date(r.createdAt).getTime() > Date.now() - 86400000 * 7).length,
    openSupportTickets: tickets.filter((t) => t.status === "open" || t.status === "in_progress").length,
    moderationCasesOpen: mod.newReports + mod.verificationInReview + mod.appealsInReview,
    storesPendingReview: stores.filter((s) => s.status === "pending_review").length,
    revenue: getAdminRevenueSummary(),
  };
}

export function getAdminAnalyticsSeries(): Record<string, AdminTimeSeriesPoint[]> {
  const mk = (base: number): AdminTimeSeriesPoint[] =>
    ["−6н", "−5н", "−4н", "−3н", "−2н", "−1н", "сейчас"].map((label, i) => ({
      label,
      value: Math.round(base * (0.85 + i * 0.03) + i * 2),
    }));
  return {
    users: mk(120),
    listings: mk(420),
    requests: mk(48),
    stores: mk(18),
    revenue: mk(240),
  };
}

export function getAdminFeatureGateOverview(): AdminFeatureGateRow[] {
  return [
    { key: "listing_boost", label: "Буст объявлений", enabled: true, scope: "store ≥ Про" },
    { key: "auction_create", label: "Аукционы", enabled: true, scope: "политика entitlements" },
    { key: "saved_searches_alerts", label: "Алерты поиска", enabled: true, scope: "покупатель Pro+" },
    { key: "store_verified_badge", label: "Verified магазин", enabled: false, scope: "Business only" },
    { key: "risk_auto_hold", label: "Авто-холд выплат", enabled: true, scope: "risk layer" },
  ];
}

export function getAdminSystemHealthMock() {
  return {
    env: "demo / staging-ready",
    build: process.env.npm_package_version ?? "0.1.0",
    integrations: [
      { name: "Billing provider", status: "ok" as const, detail: "mock" },
      { name: "KYC vendor", status: "degraded" as const, detail: "очередь 12 кейсов" },
      { name: "Email", status: "ok" as const, detail: "mock" },
    ],
    queues: [
      { name: "moderation_inbound", depth: 14, sla: "в норме" },
      { name: "payouts_review", depth: 3, sla: "внимание" },
      { name: "search_index", depth: 0, sla: "ok" },
    ],
    notices: ["Плановое окно: индексация каталога 02:00–03:00 (mock)."],
  };
}
