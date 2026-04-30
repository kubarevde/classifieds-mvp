"use client";

import { Fragment, useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminSavedViewsStrip } from "@/components/admin/AdminSavedViewsStrip";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { listAdminPromoCampaigns, type AdminPromoCampaign, type AdminPromoCampaignStatus } from "@/services/promotions";

function tone(s: AdminPromoCampaignStatus): "neutral" | "success" | "warning" | "danger" {
  if (s === "active") return "success";
  if (s === "scheduled") return "warning";
  if (s === "paused") return "warning";
  if (s === "cancelled") return "danger";
  if (s === "completed") return "neutral";
  return "neutral";
}

export default function AdminPromoCampaignsListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const status = (params.get("status") ?? "all") as AdminPromoCampaignStatus | "all";

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (!value || value === "all") next.delete(key);
      else next.set(key, value);
      router.replace(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router],
  );

  const rows = useMemo(() => {
    let c = listAdminPromoCampaigns();
    if (status !== "all") {
      c = c.filter((x) => x.status === status);
    }
    return c.map((camp: AdminPromoCampaign) => [
      <Fragment key={`${camp.id}-t`}>
        <AdminInternalLink href={`/admin/promotions/campaigns/${encodeURIComponent(camp.id)}`} className="font-semibold text-slate-900 hover:underline">
          {camp.title}
        </AdminInternalLink>
      </Fragment>,
      <Fragment key={`${camp.id}-s`}>
        <AdminStatusBadge tone={tone(camp.status)}>{camp.status}</AdminStatusBadge>
      </Fragment>,
      <Fragment key={`${camp.id}-sc`}>
        <span className="text-xs">{camp.targetScope}</span>
        {camp.targetScopeLabel ? <p className="text-xs text-slate-500">{camp.targetScopeLabel}</p> : null}
      </Fragment>,
      <Fragment key={`${camp.id}-n`}>
        <span className="text-sm font-medium">{camp.linkedPromotionIds.length}</span>
      </Fragment>,
      <Fragment key={`${camp.id}-b`}>
        <span className="text-sm">{camp.budget.toLocaleString("ru-RU")} ₽</span>
      </Fragment>,
      <Fragment key={`${camp.id}-sp`}>
        <span className="text-sm">{camp.spent.toLocaleString("ru-RU")} ₽</span>
      </Fragment>,
      <Fragment key={`${camp.id}-p`}>
        <span className="text-xs text-slate-600">
          {new Date(camp.startsAt).toLocaleDateString("ru-RU")}
          {camp.endsAt ? ` — ${new Date(camp.endsAt).toLocaleDateString("ru-RU")}` : ""}
        </span>
      </Fragment>,
    ]);
  }, [status]);

  return (
    <div className="space-y-4">
      <AdminPageHeader breadcrumbs={buildAdminBreadcrumbs("/admin/promotions/campaigns")} title="Кампании" subtitle="Бюджеты, охват и связанные промо (mock)." />
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <AdminSavedViewsStrip domain="promotions-campaigns" pathname={pathname} />
        <label className="mt-3 block text-xs font-medium text-slate-600">
          Статус
          <select className="mt-1 block rounded-lg border border-slate-200 px-2 py-1.5 text-sm" value={status} onChange={(e) => setParam("status", e.target.value)}>
            <option value="all">Все</option>
            <option value="draft">Черновик</option>
            <option value="scheduled">Запланировано</option>
            <option value="active">Активна</option>
            <option value="completed">Завершена</option>
            <option value="cancelled">Отменена</option>
            <option value="paused">Пауза</option>
          </select>
        </label>
      </div>
      <AdminDataTable
        columns={[
          { key: "t", label: "Кампания" },
          { key: "s", label: "Статус" },
          { key: "sc", label: "Охват" },
          { key: "n", label: "Промо" },
          { key: "b", label: "Бюджет" },
          { key: "sp", label: "Потрачено" },
          { key: "p", label: "Период" },
        ]}
        rows={rows}
      />
    </div>
  );
}
