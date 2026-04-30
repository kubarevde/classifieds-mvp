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

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminTimeline events={seedAudit(user.displayName)} title="Модерация / аудит (mock)" />
        <AdminNotesPanel entityType="user" entityId={user.id} />
      </div>
    </div>
  );
}
