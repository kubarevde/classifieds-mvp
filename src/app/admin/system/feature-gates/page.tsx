import { Fragment } from "react";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { getAdminFeatureGateOverview } from "@/services/admin";

export default function AdminFeatureGatesPage() {
  const rows = getAdminFeatureGateOverview().map((r) => [
    <Fragment key={`${r.key}-k`}>
      <span className="font-mono text-xs">{r.key}</span>
    </Fragment>,
    <Fragment key={`${r.key}-l`}>{r.label}</Fragment>,
    <Fragment key={`${r.key}-e`}>
      <AdminStatusBadge tone={r.enabled ? "success" : "neutral"}>{r.enabled ? "вкл" : "выкл"}</AdminStatusBadge>
    </Fragment>,
    <Fragment key={`${r.key}-s`}>
      <span className="text-xs text-slate-600">{r.scope}</span>
    </Fragment>,
  ]);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs("/admin/system/feature-gates")}
        title="Флаги функций"
        subtitle="Ключевые флаги возможностей платформы (mock-снимок, сверяйте с сервисом feature-gate при интеграции)."
        actions={
          <AdminInternalLink href="/admin/system" className="text-sm font-semibold text-sky-800 hover:underline">
            ← Система
          </AdminInternalLink>
        }
      />
      <AdminDataTable
        columns={[
          { key: "k", label: "Ключ" },
          { key: "l", label: "Описание" },
          { key: "e", label: "Состояние" },
          { key: "s", label: "Область" },
        ]}
        rows={rows}
      />
    </div>
  );
}
