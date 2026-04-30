import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminSlotUtilizationBar } from "@/components/admin/AdminSlotUtilizationBar";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import {
  getAdminPromotionStats,
  listAdminPromoCampaigns,
  listAdminPromotions,
  listAdminPromotionSlots,
  listRiskPromotionSummaries,
} from "@/services/promotions";

export default function AdminPromotionsOverviewPage() {
  const stats = getAdminPromotionStats();
  const recentActive = listAdminPromotions({ status: "active" }).slice(0, 6);
  const expiring = listAdminPromotions({ status: "active", expiringSoon: true }).slice(0, 6);
  const slots = listAdminPromotionSlots().slice(0, 5);
  const campaigns = listAdminPromoCampaigns().slice(0, 5);
  const risks = listRiskPromotionSummaries();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs("/admin/promotions")}
        title="Продвижение"
        subtitle="Операционный слой монетизации: бусты, слоты, кампании и риски (mock, in-memory)."
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <AdminStatCard label="Активные продвижения" value={stats.activePromotions} />
        <AdminStatCard label="Запланированные" value={stats.scheduledPromotions} />
        <AdminStatCard label="Истекают ≤7 дней" value={stats.expiringSoon} />
        <AdminStatCard label="Доход от продвижения (mock)" value={`${stats.totalPromoRevenue.toLocaleString("ru-RU")} ₽`} />
        <AdminStatCard label="Средний fill rate слотов" value={`${Math.round(stats.fillRateAvg * 100)}%`} />
        <AdminStatCard label="Подозрительные / flagged" value={stats.flaggedPromotions} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminPageSection title="Последние активированные бусты и размещения">
          <ul className="space-y-2 text-sm">
            {recentActive.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 last:border-0">
                <div className="min-w-0">
                  <AdminInternalLink href={`/admin/promotions/${encodeURIComponent(p.id)}`} className="font-semibold text-slate-900 hover:underline">
                    {p.title}
                  </AdminInternalLink>
                  <p className="truncate text-xs text-slate-500">
                    {p.id} · {p.type} · CTR {(p.ctr * 100).toFixed(2)}%
                  </p>
                </div>
                <AdminStatusBadge tone="success">Активно</AdminStatusBadge>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">Данные синтетические; статусы меняются через список и детальную карточку.</p>
        </AdminPageSection>

        <AdminPageSection title="Скоро истекающие размещения">
          {expiring.length === 0 ? (
            <p className="text-sm text-slate-600">Нет активных с дедлайном в ближайшие 7 дней (mock-срез).</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {expiring.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 last:border-0">
                  <div className="min-w-0">
                    <AdminInternalLink href={`/admin/promotions/${encodeURIComponent(p.id)}`} className="font-semibold text-amber-900 hover:underline">
                      {p.title}
                    </AdminInternalLink>
                    <p className="text-xs text-slate-500">до {p.endsAt ? new Date(p.endsAt).toLocaleString("ru-RU") : "—"}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminPageSection>
      </div>

      <AdminPageSection title="Featured-слоты и заполнение">
        <div className="space-y-3">
          {slots.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{s.title}</p>
                <p className="text-xs text-slate-500">
                  {s.key} · {s.location}
                  {s.scopeLabel ? ` · ${s.scopeLabel}` : ""}
                </p>
              </div>
              <AdminSlotUtilizationBar active={s.activeCount} capacity={s.capacity} />
              <AdminInternalLink href="/admin/promotions/slots" className="text-xs font-semibold text-sky-800 hover:underline">
                Слоты
              </AdminInternalLink>
            </div>
          ))}
        </div>
      </AdminPageSection>

      <AdminPageSection title="Последние изменения по кампаниям">
        <ul className="divide-y divide-slate-100 text-sm">
          {campaigns.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <div>
                <AdminInternalLink href="/admin/promotions/campaigns" className="font-semibold text-slate-900 hover:underline">
                  {c.title}
                </AdminInternalLink>
                <p className="text-xs text-slate-500">
                  {c.linkedPromotionIds.length} промо · бюджет {c.budget.toLocaleString("ru-RU")} ₽
                </p>
              </div>
              <AdminStatusBadge tone={c.status === "active" ? "success" : c.status === "draft" ? "neutral" : "warning"}>{c.status}</AdminStatusBadge>
            </li>
          ))}
        </ul>
      </AdminPageSection>

      <AdminPageSection title="Риск и аномалии">
        <p className="mb-3 text-sm text-slate-600">
          Подозрительный CTR, повторные админские гранты и помеченные размещения — без реального антифрода, только операционная видимость.
        </p>
        <ul className="space-y-2 text-sm">
          {risks.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-900">{r.reason}</span>
              <AdminInternalLink href={`/admin/promotions/${encodeURIComponent(r.hrefSuffix)}`} className="font-medium text-slate-900 hover:underline">
                {r.title}
              </AdminInternalLink>
              <AdminInternalLink href="/admin/moderation/reports" className="text-xs text-sky-800 hover:underline">
                Модерация
              </AdminInternalLink>
            </li>
          ))}
        </ul>
      </AdminPageSection>
    </div>
  );
}
