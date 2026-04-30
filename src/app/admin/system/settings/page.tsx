import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";

const MOCK_CONFIG_ROWS = [
  { key: "NEXT_PUBLIC_SITE_URL", value: "(из env при деплое)", sensitive: false },
  { key: "BILLING_MODE", value: "mock", sensitive: false },
  { key: "MODERATION_ESCALATION_EMAIL", value: "ops@example.com", sensitive: false },
] as const;

export default function AdminSystemSettingsPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs("/admin/system/settings")}
        title="Настройки"
        subtitle="Только чтение: ключевые параметры (mock-таблица)."
        actions={
          <AdminInternalLink href="/admin/system" className="text-sm font-semibold text-sky-800 hover:underline">
            ← Система
          </AdminInternalLink>
        }
      />
      <AdminPageSection title="Конфигурация (mock)">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr>
              <th className="pb-2">Ключ</th>
              <th className="pb-2">Значение</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_CONFIG_ROWS.map((row) => (
              <tr key={row.key}>
                <td className="py-2 font-mono text-xs text-slate-800">{row.key}</td>
                <td className="py-2 text-slate-700">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminPageSection>
    </div>
  );
}
