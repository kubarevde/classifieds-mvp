import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { ModerationQueueCard } from "@/components/moderation/ModerationQueueCard";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import {
  getAdminListings,
  getAdminMarketplaceStats,
  getAdminRequests,
  getAdminStores,
  getAdminSubscriptions,
  getAdminSupportTickets,
  getAdminUsers,
} from "@/services/admin";
import { getModerationQueue, getModerationStats } from "@/services/moderation";

export default async function AdminOverviewPage() {
  const [stats, users, listings, requests, tickets, subs, modStats, modRecent, stores] = await Promise.all([
    getAdminMarketplaceStats(),
    getAdminUsers(),
    getAdminListings({ flaggedOnly: true }),
    getAdminRequests(),
    Promise.resolve(
      getAdminSupportTickets().filter((t) => t.status === "open" || t.status === "in_progress"),
    ),
    Promise.resolve(getAdminSubscriptions()),
    Promise.resolve(getModerationStats()),
    Promise.resolve(getModerationQueue({ status: "all", priority: "all" }).slice(0, 5)),
    getAdminStores({ status: "pending_review" }),
  ]);

  const expiringSubs = subs.filter((s) => s.status === "past_due").slice(0, 4);
  const newUsers = users.slice(0, 4);
  const riskListings = listings.slice(0, 5);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs("/admin")}
        title="Обзор платформы"
        subtitle="Операционный дашборд: здоровье маркетплейса, очереди T&S, поддержка и монетизация (mock)."
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        <AdminStatCard label="Пользователей" value={stats.totalUsers} />
        <AdminStatCard label="Активных объявлений" value={stats.activeListings} />
        <AdminStatCard label="Новых запросов (7д)" value={stats.newRequests7d} />
        <AdminStatCard label="Открытых тикетов" value={stats.openSupportTickets} />
        <AdminStatCard label="Кейсов на модерации" value={stats.moderationCasesOpen} />
        <AdminStatCard label="MRR (mock)" value={`${stats.revenue.mrrRub.toLocaleString("ru-RU")} ₽`} />
        <AdminStatCard label="Платных подписок" value={stats.revenue.paidSubscriptions} />
        <AdminStatCard label="Ожидают выплаты" value={`${stats.revenue.pendingPayoutsRub.toLocaleString("ru-RU")} ₽`} />
        <AdminStatCard label="Магазинов на подтверждении" value={stats.storesPendingReview} />
        <AdminStatCard label="Платежей с ошибкой (7д)" value={stats.revenue.failedPayments7d} hint="mock-счётчик" />
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminPageSection title="Последние кейсы модерации" actions={<AdminInternalLink href="/admin/moderation" className="text-sm font-semibold text-slate-900 hover:underline">Все очереди</AdminInternalLink>}>
          <div className="grid gap-3">
            {modRecent.map((item) => {
              const base =
                item.queueType === "safety_report"
                  ? "/admin/moderation/reports"
                  : item.queueType === "verification_case"
                    ? "/admin/moderation/verification"
                    : item.queueType === "appeal_case"
                      ? "/admin/moderation/appeals"
                      : "/admin/moderation/reports";
              return <ModerationQueueCard key={item.id} item={item} href={`${base}/${item.id}`} />;
            })}
          </div>
          <p className="mt-2 text-xs text-slate-500">SLA обзор: ср. {modStats.avgResolutionHours} ч · urgent: {modStats.urgentOrHigh}</p>
        </AdminPageSection>

        <AdminPageSection title="Поддержка" actions={<AdminInternalLink href="/admin/support" className="text-sm font-semibold text-slate-900 hover:underline">Все тикеты</AdminInternalLink>}>
          <ul className="space-y-2 text-sm">
            {tickets.slice(0, 5).map((t) => (
              <li key={t.id} className="flex justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
                <AdminInternalLink href={`/admin/support/${t.id}`} className="font-medium text-slate-900 hover:underline">
                  {t.subject}
                </AdminInternalLink>
                <span className="shrink-0 text-xs text-slate-500">{t.status}</span>
              </li>
            ))}
          </ul>
        </AdminPageSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminPageSection title="Новые пользователи / магазины" actions={<AdminInternalLink href="/admin/users" className="text-sm font-semibold text-slate-900 hover:underline">Пользователи</AdminInternalLink>}>
          <ul className="space-y-2 text-sm">
            {newUsers.map((u) => (
              <li key={u.id} className="flex justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2">
                <AdminInternalLink href={`/admin/users/${encodeURIComponent(u.id)}`} className="font-medium text-slate-900 hover:underline">
                  {u.displayName}
                </AdminInternalLink>
                <span className="text-xs text-slate-500">{u.email}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs font-semibold text-slate-600">Магазины на подтверждении</p>
          <ul className="mt-1 space-y-1 text-sm">
            {stores.map((s) => (
              <li key={s.id}>
                <AdminInternalLink href={`/admin/stores/${s.id}`} className="text-slate-800 hover:underline">
                  {s.name}
                </AdminInternalLink>
              </li>
            ))}
          </ul>
        </AdminPageSection>

        <AdminPageSection title="Монетизация" actions={<AdminInternalLink href="/admin/subscriptions" className="text-sm font-semibold text-slate-900 hover:underline">Подписки</AdminInternalLink>}>
          <p className="text-sm text-slate-600">Активных платных: {subs.filter((s) => s.status === "active").length}</p>
          <p className="mt-2 text-xs font-semibold text-slate-700">Проблемные / истекающие</p>
          <ul className="mt-1 space-y-1 text-sm">
            {expiringSubs.map((s) => (
              <li key={s.id}>
                <AdminInternalLink href={`/admin/subscriptions/${encodeURIComponent(s.id)}`} className="text-rose-700 hover:underline">
                  {s.accountLabel} · {s.paymentStatus === "failed" ? "ошибка оплаты" : s.status}
                </AdminInternalLink>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs font-semibold text-slate-700">Последние инвойсы</p>
          <AdminInternalLink href="/admin/subscriptions/invoices" className="text-sm text-sky-800 hover:underline">
            Открыть реестр счетов →
          </AdminInternalLink>
        </AdminPageSection>
      </div>

      <AdminPageSection title="Высокий риск (mock)" actions={<AdminInternalLink href="/admin/listings?flagged=1" className="text-sm font-semibold text-slate-900 hover:underline">Объявления</AdminInternalLink>}>
        <ul className="space-y-2 text-sm">
          {riskListings.map((l) => (
            <li key={l.id} className="flex flex-wrap justify-between gap-2 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2">
              <AdminInternalLink href={`/admin/listings/${l.id}`} className="font-medium text-slate-900 hover:underline">
                {l.title}
              </AdminInternalLink>
              <span className="text-xs text-amber-900">флаги: {l.flagsCount}</span>
            </li>
          ))}
        </ul>
      </AdminPageSection>

      <AdminPageSection title="Здоровье маркетплейса" subtitle="Упрощённые mock-индикаторы для операций.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Конверсия запросов</p>
            <p className="mt-1 font-semibold text-slate-900">{(requests.filter((r) => r.responsesCount > 0).length / Math.max(1, requests.length)).toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Апелляции / споры (mock)</p>
            <p className="mt-1 font-semibold text-slate-900">{modStats.appealsInReview} в работе</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Верификация backlog</p>
            <p className="mt-1 font-semibold text-slate-900">{modStats.verificationInReview}</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Нагрузка поддержки</p>
            <p className="mt-1 font-semibold text-slate-900">{stats.openSupportTickets} открыто</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <AdminInternalLink href="/admin/analytics" className="rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white">
            Аналитика
          </AdminInternalLink>
          <AdminInternalLink href="/admin/system" className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800">
            Система
          </AdminInternalLink>
          <AdminInternalLink href="/admin/requests" className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800">
            Запросы
          </AdminInternalLink>
        </div>
      </AdminPageSection>
    </div>
  );
}
