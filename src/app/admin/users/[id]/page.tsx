import { notFound } from "next/navigation";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminEntitySummaryCard } from "@/components/admin/AdminEntitySummaryCard";
import { AdminNotesPanel } from "@/components/admin/AdminNotesPanel";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTimeline } from "@/components/admin/AdminTimeline";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { getAdminListings, getAdminRequests, getAdminStores, getAdminUserById } from "@/services/admin";
import { dealsService } from "@/services/deals";
import { messagesService } from "@/services/messages";
import { reviewsService } from "@/services/reviews";
import type { AdminAuditEvent } from "@/services/admin/types";

type Props = { params: Promise<{ id: string }> };

const seedAudit = (name: string): AdminAuditEvent[] => [
  { id: "a1", at: new Date(Date.now() - 86400000 * 5).toISOString(), actor: "system", action: "login_geo", detail: "Вход из ожидаемого региона" },
  { id: "a2", at: new Date(Date.now() - 86400000).toISOString(), actor: "moderator", action: "review_queue", detail: `Проверка сигналов по ${name}` },
];

export default async function AdminUserDetailPage({ params }: Props) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const user = await getAdminUserById(id);
  if (!user) {
    notFound();
  }

  const listings =
    user.linkedSellerIds.length > 0
      ? (await getAdminListings()).filter((l) => user.linkedSellerIds.some((sid) => l.sellerUserId.includes(sid)))
      : [];
  const stores = (await getAdminStores()).filter((s) => user.linkedSellerIds.includes(s.id));
  const requests = (await getAdminRequests()).filter((r) => r.buyerUserId === user.id);
  const relatedThreads = await messagesService.getThreadsForUserId(user.id);
  const userDeals = dealsService.getDealsForUser(user.id);
  const dealsAsBuyer = userDeals.filter((d) =>
    user.id.startsWith("buyer-account:") ? d.buyerId === user.id.slice("buyer-account:".length) : d.buyerId === user.id,
  );
  const dealsAsSeller = userDeals.filter((d) => user.id.startsWith("seller-account:") && d.sellerId === user.id);
  const buyerKey = user.id.startsWith("buyer-account:") ? user.id.slice("buyer-account:".length) : user.id;
  const reviewsAboutBuyer = reviewsService.getReviewsForTarget(buyerKey, "buyer").slice(0, 8);
  const reviewsByUser = reviewsService.getReviewsAuthoredByUser(user.id).slice(0, 8);
  const storeReviewBlocks = stores.map((s) => ({
    id: s.id,
    name: s.name,
    summary: reviewsService.getReviewSummary(s.id, "store"),
    recent: reviewsService.getReviewsForTarget(s.id, "store").slice(0, 4),
  }));
  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs(`/admin/users/${encodeURIComponent(id)}`)}
        title={user.displayName}
        subtitle={user.email}
        actions={
          <div className="flex flex-wrap gap-2">
            <AdminInternalLink href="/admin/moderation/reports" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
              Контекст модерации
            </AdminInternalLink>
            <AdminInternalLink href={`/admin/support?q=${encodeURIComponent(user.email)}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800">
              Поддержка
            </AdminInternalLink>
            <AdminInternalLink href="/admin/cases/case-buyer-safety" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
              Сквозной кейс (mock)
            </AdminInternalLink>
          </div>
        }
      />

      <AdminEntitySummaryCard
        title="Сводка"
        subtitle={`ID: ${user.id}`}
        meta={
          <div className="flex flex-wrap gap-2">
            <AdminStatusBadge tone={user.status === "active" ? "success" : "danger"}>{user.status}</AdminStatusBadge>
            <AdminStatusBadge tone="neutral">{user.role}</AdminStatusBadge>
            <AdminStatusBadge tone="info">{user.verificationStatus}</AdminStatusBadge>
          </div>
        }
      >
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Trust score (внутр.)</dt>
            <dd className="font-medium">{user.trustScore}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">План</dt>
            <dd className="font-medium">{user.currentPlanLabel}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Флаги / жалобы</dt>
            <dd className="font-medium">
              {user.flagsCount} / {user.reportsCount}
            </dd>
          </div>
        </dl>
      </AdminEntitySummaryCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminPageSection title="Объявления пользователя">
          {listings.length ? (
            <ul className="space-y-1 text-sm">
              {listings.slice(0, 8).map((l) => (
                <li key={l.id}>
                  <AdminInternalLink href={`/admin/listings/${l.id}`} className="text-slate-900 hover:underline">
                    {l.title}
                  </AdminInternalLink>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Нет привязанных объявлений.</p>
          )}
        </AdminPageSection>
        <AdminPageSection title="Магазины">
          {stores.length ? (
            <ul className="space-y-1 text-sm">
              {stores.map((s) => (
                <li key={s.id}>
                  <AdminInternalLink href={`/admin/stores/${s.id}`} className="text-slate-900 hover:underline">
                    {s.name}
                  </AdminInternalLink>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Нет магазинов.</p>
          )}
        </AdminPageSection>
      </div>

      <AdminPageSection title="Запросы покупателя">
        {requests.length ? (
          <ul className="text-sm">
            {requests.map((r) => (
              <li key={r.id}>
                <AdminInternalLink href={`/admin/requests/${r.id}`} className="hover:underline">
                  {r.title}
                </AdminInternalLink>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Нет запросов.</p>
        )}
      </AdminPageSection>

      <AdminPageSection title="Сделки как покупатель">
        {dealsAsBuyer.length ? (
          <ul className="space-y-2 text-sm">
            {dealsAsBuyer.slice(0, 12).map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-2">
                <AdminInternalLink href={`/deals/${encodeURIComponent(d.id)}`} className="font-semibold hover:underline">
                  {d.listingId}
                </AdminInternalLink>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-700">{d.status}</span>
                <span className="text-xs text-slate-600">{d.amount.toLocaleString("ru-RU")} ₽</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Нет сделок в роли покупателя.</p>
        )}
      </AdminPageSection>

      <AdminPageSection title="Сделки как продавец">
        {dealsAsSeller.length ? (
          <ul className="space-y-2 text-sm">
            {dealsAsSeller.slice(0, 12).map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-2">
                <AdminInternalLink href={`/deals/${encodeURIComponent(d.id)}`} className="font-semibold hover:underline">
                  {d.listingId}
                </AdminInternalLink>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-700">{d.status}</span>
                <span className="text-xs text-slate-600">{d.amount.toLocaleString("ru-RU")} ₽</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Нет сделок в роли продавца.</p>
        )}
      </AdminPageSection>

      <AdminPageSection title="Отзывы о пользователе как о покупателе">
        {reviewsAboutBuyer.length ? (
          <ul className="space-y-2 text-sm">
            {reviewsAboutBuyer.map((r) => (
              <li key={r.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <AdminInternalLink href={`/admin/reviews/${encodeURIComponent(r.id)}`} className="font-semibold text-sky-900 hover:underline">
                  {r.id}
                </AdminInternalLink>{" "}
                <span className="text-xs text-amber-700">{r.rating}★</span> · {r.status}
                <span className="mt-1 block text-slate-700 line-clamp-2">{r.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Нет отзывов с targetType buyer для этого идентификатора.</p>
        )}
      </AdminPageSection>

      <AdminPageSection title="Отзывы, оставленные пользователем">
        {reviewsByUser.length ? (
          <ul className="space-y-2 text-sm">
            {reviewsByUser.map((r) => (
              <li key={r.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <AdminInternalLink href={`/admin/reviews/${encodeURIComponent(r.id)}`} className="font-semibold text-sky-900 hover:underline">
                  {r.id}
                </AdminInternalLink>{" "}
                → {r.targetType} {r.targetId}
                <span className="mt-1 block text-slate-700 line-clamp-2">{r.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Пользователь не оставлял отзывов под этим ID (или другой формат аккаунта).</p>
        )}
      </AdminPageSection>

      {storeReviewBlocks.length ? (
        <AdminPageSection title="Отзывы о магазинах пользователя">
          <div className="space-y-4">
            {storeReviewBlocks.map((b) => (
              <div key={b.id}>
                <p className="text-sm font-semibold text-slate-900">
                  <AdminInternalLink href={`/admin/stores/${encodeURIComponent(b.id)}`} className="hover:underline">
                    {b.name}
                  </AdminInternalLink>{" "}
                  — {b.summary.avgRating.toFixed(1)}★, {b.summary.totalCount} шт.
                </p>
                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                  {b.recent.map((r) => (
                    <li key={r.id}>
                      <AdminInternalLink href={`/admin/reviews/${encodeURIComponent(r.id)}`} className="font-semibold text-sky-800 hover:underline">
                        {r.rating}★
                      </AdminInternalLink>{" "}
                      {r.text.slice(0, 80)}
                      {r.text.length > 80 ? "…" : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </AdminPageSection>
      ) : null}

      <AdminPageSection title="Связанные диалоги (mock)">
        {relatedThreads.length ? (
          <ul className="space-y-1 text-sm">
            {relatedThreads.slice(0, 12).map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-2">
                <AdminInternalLink href={`/messages/${encodeURIComponent(t.id)}`} className="font-semibold hover:underline">
                  {t.id}
                </AdminInternalLink>
                <span className="text-xs text-slate-600">{t.type}</span>
                <span className="text-xs text-slate-500 line-clamp-1">{t.lastMessage}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Нет тредов с участием пользователя.</p>
        )}
      </AdminPageSection>

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminTimeline events={seedAudit(user.displayName)} title="Модерация / аудит (mock)" />
        <AdminNotesPanel entityType="user" entityId={user.id} />
      </div>
    </div>
  );
}
