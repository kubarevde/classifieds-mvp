import { Fragment } from "react";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { getAdminPlans } from "@/services/admin";

export default function AdminSubscriptionPlansPage() {
  const plans = getAdminPlans();
  const rows = plans.map((p) => [
    <Fragment key={`${p.id}-n`}>
      <span className="font-medium text-slate-900">{p.name}</span>
    </Fragment>,
    <Fragment key={`${p.id}-i`}>
      <span className="text-xs">{p.id}</span>
    </Fragment>,
    <Fragment key={`${p.id}-p`}>
      <span>
        {p.priceMonthlyRub.toLocaleString("ru-RU")} ₽ / мес · {p.priceAnnualRub.toLocaleString("ru-RU")} ₽ / год
      </span>
    </Fragment>,
    <Fragment key={`${p.id}-s`}>
      <AdminStatusBadge tone={p.status === "active" ? "success" : "neutral"}>{p.status}</AdminStatusBadge>
    </Fragment>,
    <Fragment key={`${p.id}-f`}>
      <span className="max-w-md text-xs text-slate-600">{p.featureSummary}</span>
    </Fragment>,
    <Fragment key={`${p.id}-l`}>
      <span className="text-xs text-slate-500">{p.limitsSummary}</span>
    </Fragment>,
  ]);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs("/admin/subscriptions/plans")}
        title="Тарифы"
        subtitle="Карта планов для внутренних операций (mock, без персистентного редактирования)."
        actions={
          <AdminInternalLink href="/admin/subscriptions" className="text-sm font-semibold text-sky-800 hover:underline">
            ← Подписки
          </AdminInternalLink>
        }
      />
      <AdminDataTable
        columns={[
          { key: "n", label: "Название" },
          { key: "i", label: "ID" },
          { key: "p", label: "Цена" },
          { key: "s", label: "Статус" },
          { key: "f", label: "Фичи" },
          { key: "l", label: "Лимиты" },
        ]}
        rows={rows}
      />
    </div>
  );
}
