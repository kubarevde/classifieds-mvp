import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { getAdminSystemHealthMock } from "@/services/admin";

export default function AdminSystemPage() {
  const health = getAdminSystemHealthMock();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs("/admin/system")}
        title="Система"
        subtitle="Операционный обзор конфигурации, интеграций и очередей (mock, read-only)."
        actions={
          <div className="flex flex-wrap gap-2 text-sm">
            <AdminInternalLink href="/admin/system/feature-gates" className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800">
              Флаги функций
            </AdminInternalLink>
            <AdminInternalLink href="/admin/system/settings" className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800">
              Настройки
            </AdminInternalLink>
          </div>
        }
      />

      <AdminPageSection title="Среда и сборка">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Окружение</dt>
            <dd className="font-mono text-slate-900">{health.env}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Версия приложения</dt>
            <dd className="font-mono text-slate-900">{health.build}</dd>
          </div>
        </dl>
      </AdminPageSection>

      <AdminPageSection title="Интеграции">
        <ul className="space-y-2 text-sm">
          {health.integrations.map((i) => (
            <li key={i.name} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              <span className="font-medium text-slate-900">{i.name}</span>
              <AdminStatusBadge tone={i.status === "ok" ? "success" : "warning"}>{i.status}</AdminStatusBadge>
              <span className="w-full text-xs text-slate-600">{i.detail}</span>
            </li>
          ))}
        </ul>
      </AdminPageSection>

      <AdminPageSection title="Очереди / jobs (mock)">
        <ul className="space-y-2 text-sm">
          {health.queues.map((q) => (
            <li key={q.name} className="flex justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2">
              <span className="font-mono text-xs text-slate-800">{q.name}</span>
              <span>
                depth {q.depth} · {q.sla}
              </span>
            </li>
          ))}
        </ul>
      </AdminPageSection>

      <AdminPageSection title="Уведомления">
        <ul className="list-disc space-y-1 pl-5 text-sm text-amber-900">
          {health.notices.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </AdminPageSection>
    </div>
  );
}
