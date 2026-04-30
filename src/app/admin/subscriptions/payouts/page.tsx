import { Fragment } from "react";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { getAdminPayouts } from "@/services/admin";

export default function AdminPayoutsPage() {
  const payouts = getAdminPayouts();
  const rows = payouts.map((p) => [
    <Fragment key={`${p.id}-s`}>
      <AdminInternalLink href={`/admin/stores/${p.storeId}`} className="font-medium text-slate-900 hover:underline">
        {p.storeLabel}
      </AdminInternalLink>
    </Fragment>,
    <Fragment key={`${p.id}-$`}>
      <span>{p.amountRub.toLocaleString("ru-RU")} ₽</span>
    </Fragment>,
    <Fragment key={`${p.id}-st`}>
      <AdminStatusBadge tone={p.status === "paid" ? "success" : p.status === "on_hold" ? "warning" : "neutral"}>{p.status}</AdminStatusBadge>
    </Fragment>,
    <Fragment key={`${p.id}-pe`}>{p.periodLabel}</Fragment>,
    <Fragment key={`${p.id}-m`}>
      <span className="text-xs">{p.method}</span>
    </Fragment>,
    <Fragment key={`${p.id}-h`}>
      <span className="text-xs text-rose-700">{p.holdReason ?? "—"}</span>
    </Fragment>,
  ]);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs("/admin/subscriptions/payouts")}
        title="Выплаты"
        subtitle="Расчёты с магазинами: периоды, холды и методы (mock)."
        actions={
          <AdminInternalLink href="/admin/subscriptions" className="text-sm font-semibold text-sky-800 hover:underline">
            ← Подписки
          </AdminInternalLink>
        }
      />
      <AdminDataTable
        columns={[
          { key: "s", label: "Магазин" },
          { key: "$", label: "Сумма" },
          { key: "st", label: "Статус" },
          { key: "pe", label: "Период" },
          { key: "m", label: "Метод" },
          { key: "h", label: "Холд" },
        ]}
        rows={rows}
      />
    </div>
  );
}
