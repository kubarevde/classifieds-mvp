"use client";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { ModerationShell } from "@/components/moderation/ModerationShell";
import { OpsStatCard } from "@/components/moderation/OpsStatCard";
import { ModerationQueueCard } from "@/components/moderation/ModerationQueueCard";
import { getModerationQueue, getModerationStats } from "@/services/moderation";

export default function AdminModerationOverviewPage() {
  const stats = getModerationStats();
  const recent = getModerationQueue({ status: "all", priority: "all" }).slice(0, 6);
  const highRisk = recent.filter((r) => r.queueType === "risk_case" || r.priority === "urgent");

  return (
    <ModerationShell>
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Модерация и безопасность</h1>
        <p className="text-sm text-slate-600">Внутренняя очередь trust & safety: жалобы, верификации, апелляции и проактивный разбор рисков.</p>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <OpsStatCard label="Новые жалобы" value={stats.newReports} />
        <OpsStatCard label="Верификации на проверке" value={stats.verificationInReview} />
        <OpsStatCard label="Апелляции на рассмотрении" value={stats.appealsInReview} />
        <OpsStatCard label="Очередь high / urgent" value={stats.urgentOrHigh} />
        <OpsStatCard label="Среднее время решения" value={`${stats.avgResolutionHours} ч`} />
        <OpsStatCard label="Доля кейсов в review" value={`${stats.reviewSharePercent}%`} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Быстрые ссылки</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <AdminInternalLink href="/admin/moderation/reports" className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white">
            Жалобы
          </AdminInternalLink>
          <AdminInternalLink href="/admin/moderation/verification" className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white">
            Верификация
          </AdminInternalLink>
          <AdminInternalLink href="/admin/moderation/appeals" className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white">
            Апелляции
          </AdminInternalLink>
          <AdminInternalLink href="/admin/moderation/enforcement" className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white">
            Enforcement
          </AdminInternalLink>
        </div>
        <p className="mt-2 text-xs text-slate-500">Сначала разбирайте urgent и high priority.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">Последние кейсы</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {recent.map((item) => {
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
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-slate-900">Высокий риск</h2>
        <p className="mt-1 text-sm text-slate-600">Проактивный разбор сигналов risk-слоя (mock).</p>
        <ul className="mt-2 space-y-2">
          {highRisk.map((item) => (
            <li key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm text-slate-700">
              {item.targetLabel} · {item.priority} · рекомендуется: разбор сейчас
            </li>
          ))}
        </ul>
      </section>
    </ModerationShell>
  );
}

