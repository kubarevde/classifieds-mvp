"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminFiltersBar } from "@/components/admin/AdminFiltersBar";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { getAdminRequests, type AdminRequest } from "@/services/admin";

export default function AdminRequestsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const status = (params.get("status") ?? "all") as "all" | AdminRequest["status"];
  const world = params.get("world") ?? "all";
  const urgent = params.get("urgent") === "1";
  const flagged = params.get("flagged") === "1";
  const search = params.get("q") ?? "";

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (!value || value === "all" || value === "0") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      router.replace(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router],
  );

  const filtersArg = useMemo(
    () => ({
      status: status === "all" ? undefined : status,
      world: world === "all" ? undefined : world,
      urgentOnly: urgent || undefined,
      flaggedOnly: flagged || undefined,
      search: search || undefined,
    }),
    [status, world, urgent, flagged, search],
  );

  const [rows, setRows] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false;
    void getAdminRequests(filtersArg).then((r) => {
      if (!c) {
        setRows(r);
        setLoading(false);
      }
    });
    return () => {
      c = true;
    };
  }, [filtersArg]);

  const tableRows = useMemo(
    () =>
      rows.map((r) => [
        <Fragment key={`${r.id}-t`}>
          <AdminInternalLink href={`/admin/requests/${r.id}`} className="font-medium text-slate-900 hover:underline">
            {r.title}
          </AdminInternalLink>
        </Fragment>,
        <Fragment key={`${r.id}-b`}>
          <AdminInternalLink href={`/admin/users/${encodeURIComponent(r.buyerUserId)}`} className="text-slate-700 hover:underline">
            {r.buyerLabel}
          </AdminInternalLink>
        </Fragment>,
        <Fragment key={`${r.id}-w`}>
          <span className="text-xs">{r.worldLabel}</span>
        </Fragment>,
        <Fragment key={`${r.id}-$`}>
          <span className="text-xs">{r.budgetLabel}</span>
        </Fragment>,
        <Fragment key={`${r.id}-s`}>
          <AdminStatusBadge tone={r.status === "active" ? "info" : "neutral"}>{r.status}</AdminStatusBadge>
        </Fragment>,
        <Fragment key={`${r.id}-u`}>
          <AdminStatusBadge tone={r.urgency === "high" ? "danger" : "neutral"}>{r.urgency}</AdminStatusBadge>
        </Fragment>,
        <Fragment key={`${r.id}-rc`}>
          <span>{r.responsesCount}</span>
        </Fragment>,
        <Fragment key={`${r.id}-f`}>
          <span>{r.flagsCount}</span>
        </Fragment>,
        <Fragment key={`${r.id}-d`}>
          <span className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString("ru-RU")}</span>
        </Fragment>,
      ]),
    [rows],
  );

  return (
    <div className="space-y-4">
      <AdminPageHeader breadcrumbs={buildAdminBreadcrumbs("/admin/requests")} title="Запросы покупателей" subtitle="Reverse demand board — операционный обзор (mock)." />
      <AdminFiltersBar>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-medium text-slate-600">
            Статус
            <select className="mt-1 block h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm" value={status} onChange={(e) => setParam("status", e.target.value)}>
              <option value="all">Все</option>
              <option value="active">Активные</option>
              <option value="closed">Закрытые</option>
              <option value="fulfilled">Закрыты сделкой</option>
            </select>
          </label>
          <label className="text-xs font-medium text-slate-600">
            Мир (slug)
            <input
              className="mt-1 block h-9 w-40 rounded-lg border border-slate-200 bg-white px-2 text-sm"
              value={world === "all" ? "" : world}
              placeholder="все"
              onChange={(e) => setParam("world", e.target.value || "all")}
            />
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <input type="checkbox" checked={urgent} onChange={(e) => setParam("urgent", e.target.checked ? "1" : "0")} />
            Срочные
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <input type="checkbox" checked={flagged} onChange={(e) => setParam("flagged", e.target.checked ? "1" : "0")} />
            С флагами
          </label>
          <div>
            <p className="text-xs font-medium text-slate-600">Поиск</p>
            <AdminSearchInput value={search} onChange={(v) => setParam("q", v)} />
          </div>
        </div>
      </AdminFiltersBar>
      {loading ? <p className="text-sm text-slate-500">Загрузка…</p> : null}
      {!loading && !rows.length ? <AdminEmptyState title="Нет запросов" /> : null}
      {!loading && rows.length ? (
        <AdminDataTable
          columns={[
            { key: "t", label: "Заголовок" },
            { key: "b", label: "Покупатель" },
            { key: "w", label: "Мир" },
            { key: "$", label: "Бюджет" },
            { key: "s", label: "Статус" },
            { key: "u", label: "Срочность" },
            { key: "r", label: "Отклики" },
            { key: "f", label: "Флаги" },
            { key: "d", label: "Создан" },
          ]}
          rows={tableRows}
        />
      ) : null}
    </div>
  );
}
