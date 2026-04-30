import { Fragment } from "react";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { getAdminInvoices } from "@/services/admin";
import { listPromotionsOnInvoice } from "@/services/promotions";

export default function AdminInvoicesPage() {
  const invoices = getAdminInvoices();
  const rows = invoices.map((inv) => {
    const promoHits = listPromotionsOnInvoice(inv.id);
    return [
    <Fragment key={`${inv.id}-id`}>
      <span className="font-mono text-xs">{inv.id}</span>
    </Fragment>,
    <Fragment key={`${inv.id}-a`}>{inv.accountLabel}</Fragment>,
    <Fragment key={`${inv.id}-$`}>
      <span>{inv.amountRub.toLocaleString("ru-RU")} ₽</span>
    </Fragment>,
    <Fragment key={`${inv.id}-s`}>
      <AdminStatusBadge tone={inv.status === "paid" ? "success" : inv.status === "void" ? "neutral" : "warning"}>{inv.status}</AdminStatusBadge>
    </Fragment>,
    <Fragment key={`${inv.id}-i`}>{new Date(inv.issuedAt).toLocaleString("ru-RU")}</Fragment>,
    <Fragment key={`${inv.id}-p`}>{inv.paidAt ? new Date(inv.paidAt).toLocaleString("ru-RU") : "—"}</Fragment>,
    <Fragment key={`${inv.id}-d`}>
      <span className="text-xs">{inv.downloadable ? "доступен (mock)" : "недоступен"}</span>
    </Fragment>,
    <Fragment key={`${inv.id}-pr`}>
      {promoHits.length ? (
        <AdminInternalLink
          href={`/admin/promotions/${encodeURIComponent(promoHits[0]!.id)}`}
          className="text-xs font-semibold text-violet-800 hover:underline"
          title="Связанные покупки продвижения (mock)"
        >
          {promoHits.length} промо
        </AdminInternalLink>
      ) : (
        <span className="text-xs text-slate-400">—</span>
      )}
    </Fragment>,
  ];
  });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs("/admin/subscriptions/invoices")}
        title="Счета"
        subtitle="Выставленные инвойсы и статусы оплаты (mock)."
        actions={
          <AdminInternalLink href="/admin/subscriptions" className="text-sm font-semibold text-sky-800 hover:underline">
            ← Подписки
          </AdminInternalLink>
        }
      />
      <AdminDataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "a", label: "Аккаунт" },
          { key: "$", label: "Сумма" },
          { key: "s", label: "Статус" },
          { key: "i", label: "Выставлен" },
          { key: "p", label: "Оплачен" },
          { key: "d", label: "Файл" },
          { key: "pr", label: "Продвижение" },
        ]}
        rows={rows}
      />
    </div>
  );
}
