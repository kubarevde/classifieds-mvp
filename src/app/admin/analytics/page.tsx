import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminAnalyticsCharts } from "@/components/admin/AdminAnalyticsCharts";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { AdminPromoRevenueSparkline } from "@/components/admin/AdminPromoRevenueSparkline";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { getAdminAnalyticsSeries, getAdminMarketplaceStats } from "@/services/admin";
import { getAdminPromotionSeries, getAdminPromotionStats } from "@/services/promotions";
import { getModerationStats } from "@/services/moderation";

export default async function AdminAnalyticsPage() {
  const stats = await getAdminMarketplaceStats();
  const series = getAdminAnalyticsSeries();
  const m = getModerationStats();
  const promoStats = getAdminPromotionStats();
  const promoSeries = getAdminPromotionSeries();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs("/admin/analytics")}
        title="Аналитика"
        subtitle="Внутренний срез роста и нагрузки (mock, не BI-ядро)."
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Пользователи (series)" value={series.users.at(-1)?.value ?? 0} />
        <AdminStatCard label="Объявления (series)" value={series.listings.at(-1)?.value ?? 0} />
        <AdminStatCard label="Запросы (series)" value={series.requests.at(-1)?.value ?? 0} />
        <AdminStatCard label="Магазины (series)" value={series.stores.at(-1)?.value ?? 0} />
        <AdminStatCard label="MRR" value={`${stats.revenue.mrrRub.toLocaleString("ru-RU")} ₽`} />
        <AdminStatCard label="Подписок" value={stats.revenue.paidSubscriptions} />
        <AdminStatCard label="Модерация backlog" value={m.newReports + m.verificationInReview} />
        <AdminStatCard label="Поддержка открыто" value={stats.openSupportTickets} />
        <AdminStatCard label="Активные промо" value={promoStats.activePromotions} />
        <AdminStatCard label="Доход промо (mock)" value={`${promoStats.totalPromoRevenue.toLocaleString("ru-RU")} ₽`} />
        <AdminStatCard label="Fill rate слотов (ср.)" value={`${Math.round(promoStats.fillRateAvg * 100)}%`} />
      </section>

      <AdminPageSection title="Монетизация: продвижение (mock)">
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminPromoRevenueSparkline series={promoSeries} />
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Операционные метрики</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>Запланировано: {promoStats.scheduledPromotions}</li>
              <li>Истекают скоро: {promoStats.expiringSoon}</li>
              <li>Flagged / подозрительные: {promoStats.flaggedPromotions}</li>
            </ul>
            <AdminInternalLink href="/admin/promotions" className="mt-3 inline-block text-sm font-semibold text-sky-800 hover:underline">
              Консоль продвижения
            </AdminInternalLink>
          </div>
        </div>
      </AdminPageSection>

      <AdminPageSection title="Тренды (7 точек, mock)">
        <AdminAnalyticsCharts series={{ users: series.users, listings: series.listings, revenue: series.revenue }} />
      </AdminPageSection>

      <AdminPageSection title="Связанные разделы">
        <ul className="flex flex-wrap gap-3 text-sm font-semibold text-sky-800">
          <li>
            <AdminInternalLink href="/admin/subscriptions" className="hover:underline">
              Монетизация
            </AdminInternalLink>
          </li>
          <li>
            <AdminInternalLink href="/admin/promotions" className="hover:underline">
              Продвижение
            </AdminInternalLink>
          </li>
          <li>
            <AdminInternalLink href="/admin/moderation" className="hover:underline">
              Модерация
            </AdminInternalLink>
          </li>
          <li>
            <AdminInternalLink href="/admin/support" className="hover:underline">
              Поддержка
            </AdminInternalLink>
          </li>
        </ul>
      </AdminPageSection>
    </div>
  );
}
