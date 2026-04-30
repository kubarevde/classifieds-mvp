import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { listAdminCaseSummaries } from "@/services/admin";

export default function AdminCasesIndexPage() {
  const rows = listAdminCaseSummaries();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs("/admin/cases")}
        title="Кейсы"
        subtitle="Сквозной просмотр связанных сущностей (mock foundation, без реального case management)."
      />
      <AdminPageSection title="Демо-кейсы">
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium text-slate-900">{r.headline}</p>
                <p className="text-xs text-slate-500">{r.id}</p>
              </div>
              <AdminInternalLink href={`/admin/cases/${encodeURIComponent(r.id)}`} className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
                Открыть
              </AdminInternalLink>
            </li>
          ))}
        </ul>
      </AdminPageSection>
    </div>
  );
}
