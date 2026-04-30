"use client";

import Link from "next/link";
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
import { getAdminEntityNoteCount, getAdminStores, type AdminStore } from "@/services/admin";

export default function AdminStoresPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const status = (params.get("status") ?? "all") as "all" | AdminStore["status"];
  const verified = (params.get("verified") ?? "all") as "all" | "yes" | "no";
  const search = params.get("q") ?? "";

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (!value || value === "all") {
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
      verified: verified === "all" ? undefined : verified,
      search: search || undefined,
    }),
    [status, verified, search],
  );

  const [rows, setRows] = useState<AdminStore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false;
    void getAdminStores(filtersArg).then((r) => {
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
      rows.map((s) => [
        <Fragment key={`${s.id}-n`}>
          <span className="inline-flex items-center gap-1">
            <AdminInternalLink href={`/admin/stores/${s.id}`} className="font-medium text-slate-900 hover:underline">
              {s.name}
            </AdminInternalLink>
            {getAdminEntityNoteCount("store", s.id) > 0 ? (
              <span className="rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-900" title="Есть внутренние заметки">
                {getAdminEntityNoteCount("store", s.id)}
              </span>
            ) : null}
          </span>
        </Fragment>,
        <Fragment key={`${s.id}-o`}>
          <AdminInternalLink href={`/admin/users/${encodeURIComponent(s.ownerUserId)}`} className="text-slate-700 hover:underline">
            {s.ownerLabel}
          </AdminInternalLink>
        </Fragment>,
        <Fragment key={`${s.id}-st`}>
          <AdminStatusBadge tone={s.status === "active" ? "success" : s.status === "pending_review" ? "warning" : "danger"}>{s.status}</AdminStatusBadge>
        </Fragment>,
        <Fragment key={`${s.id}-v`}>
          <span className="text-xs">{s.verified ? "да" : "нет"}</span>
        </Fragment>,
        <Fragment key={`${s.id}-p`}>
          <span className="text-xs">{s.planLabel}</span>
        </Fragment>,
        <Fragment key={`${s.id}-a`}>
          <span>{s.activeListings}</span>
        </Fragment>,
        <Fragment key={`${s.id}-t`}>
          <span>{s.trustScore}</span>
        </Fragment>,
        <Fragment key={`${s.id}-d`}>
          <span className="text-xs text-slate-500">{new Date(s.createdAt).toLocaleDateString("ru-RU")}</span>
        </Fragment>,
        <Fragment key={`${s.id}-x`}>
          <div className="flex flex-wrap gap-1">
            <Link href={`/stores/${s.id}`} className="text-xs font-semibold text-sky-800 hover:underline">
              Витрина
            </Link>
            <AdminInternalLink href="/admin/moderation/verification" className="text-xs font-semibold text-slate-900 hover:underline">
              Вериф.
            </AdminInternalLink>
          </div>
        </Fragment>,
      ]),
    [rows],
  );

  return (
    <div className="space-y-4">
      <AdminPageHeader breadcrumbs={buildAdminBreadcrumbs("/admin/stores")} title="Магазины" subtitle="Витрины, тарифы и доверие (mock)." />
      <AdminFiltersBar>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-medium text-slate-600">
            Статус
            <select className="mt-1 block h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm" value={status} onChange={(e) => setParam("status", e.target.value)}>
              <option value="all">Все</option>
              <option value="active">Активные</option>
              <option value="pending_review">На проверке</option>
            </select>
          </label>
          <label className="text-xs font-medium text-slate-600">
            Верификация
            <select className="mt-1 block h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm" value={verified} onChange={(e) => setParam("verified", e.target.value)}>
              <option value="all">Все</option>
              <option value="yes">Проверенные</option>
              <option value="no">Без verified</option>
            </select>
          </label>
          <div>
            <p className="text-xs font-medium text-slate-600">Поиск</p>
            <AdminSearchInput value={search} onChange={(v) => setParam("q", v)} />
          </div>
        </div>
      </AdminFiltersBar>
      {loading ? <p className="text-sm text-slate-500">Загрузка…</p> : null}
      {!loading && !rows.length ? <AdminEmptyState title="Нет магазинов" /> : null}
      {!loading && rows.length ? (
        <AdminDataTable
          columns={[
            { key: "n", label: "Название" },
            { key: "o", label: "Владелец" },
            { key: "s", label: "Статус" },
            { key: "v", label: "Verified" },
            { key: "p", label: "План" },
            { key: "a", label: "Объявл." },
            { key: "t", label: "Trust" },
            { key: "d", label: "Создан" },
            { key: "x", label: "Ссылки" },
          ]}
          rows={tableRows}
        />
      ) : null}
    </div>
  );
}
