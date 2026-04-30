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
import { adminSetUserSuspended, getAdminEntityNoteCount, getAdminUsers, type AdminUser } from "@/services/admin";

export default function AdminUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const role = (params.get("role") ?? "all") as "all" | AdminUser["role"];
  const status = (params.get("status") ?? "all") as "all" | AdminUser["status"];
  const verification = (params.get("verification") ?? "all") as "all" | AdminUser["verificationStatus"];
  const hasStore = (params.get("hasStore") ?? "all") as "all" | "yes" | "no";
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

  const [rows, setRows] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const filtersArg = useMemo(
    () => ({
      role: role === "all" ? undefined : role,
      status: status === "all" ? undefined : status,
      verification: verification === "all" ? undefined : verification,
      hasStore: hasStore === "all" ? undefined : hasStore,
      search: search || undefined,
    }),
    [role, status, verification, hasStore, search],
  );

  useEffect(() => {
    let cancelled = false;
    void getAdminUsers(filtersArg).then((r) => {
      if (!cancelled) {
        setRows(r);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [filtersArg]);

  const reload = useCallback(() => {
    void getAdminUsers(filtersArg).then(setRows);
  }, [filtersArg]);

  const tableRows = useMemo(
    () =>
      rows.map((u) => [
        <Fragment key={`${u.id}-n`}>
          <span className="inline-flex items-center gap-1">
            <AdminInternalLink href={`/admin/users/${encodeURIComponent(u.id)}`} className="font-medium text-slate-900 hover:underline">
              {u.displayName}
            </AdminInternalLink>
            {getAdminEntityNoteCount("user", u.id) > 0 ? (
              <span className="rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-900" title="Есть внутренние заметки">
                {getAdminEntityNoteCount("user", u.id)}
              </span>
            ) : null}
          </span>
        </Fragment>,
        <Fragment key={`${u.id}-e`}>
          <span className="text-slate-600">{u.email}</span>
        </Fragment>,
        <Fragment key={`${u.id}-r`}>
          <AdminStatusBadge tone="neutral">{u.role}</AdminStatusBadge>
        </Fragment>,
        <Fragment key={`${u.id}-s`}>
          <AdminStatusBadge tone={u.status === "active" ? "success" : "danger"}>{u.status}</AdminStatusBadge>
        </Fragment>,
        <Fragment key={`${u.id}-d`}>
          <span className="text-xs text-slate-500">{new Date(u.registeredAt).toLocaleDateString("ru-RU")}</span>
        </Fragment>,
        <Fragment key={`${u.id}-lc`}>
          <span>{u.listingsCount}</span>
        </Fragment>,
        <Fragment key={`${u.id}-sc`}>
          <span>{u.storesCount}</span>
        </Fragment>,
        <Fragment key={`${u.id}-t`}>
          <span>{u.trustScore}</span>
        </Fragment>,
        <Fragment key={`${u.id}-v`}>
          <span>{u.verificationStatus}</span>
        </Fragment>,
        <Fragment key={`${u.id}-f`}>
          <span>{u.flagsCount}</span>
        </Fragment>,
        <Fragment key={`${u.id}-p`}>
          <span className="text-xs">{u.currentPlanLabel}</span>
        </Fragment>,
        <Fragment key={`${u.id}-a`}>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              onClick={() => {
                adminSetUserSuspended(u.id, u.status === "active");
                reload();
              }}
            >
              {u.status === "active" ? "Заблокировать" : "Восстановить"}
            </button>
            <AdminInternalLink href="/admin/moderation/reports" className="rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
              Модерация
            </AdminInternalLink>
          </div>
        </Fragment>,
      ]),
    [rows, reload],
  );

  return (
    <div className="space-y-4">
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs("/admin/users")}
        title="Пользователи"
        subtitle="Учётные записи, доверие, планы и сигналы риска (mock)."
      />
      <AdminFiltersBar>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-medium text-slate-600">
            Роль
            <select
              className="mt-1 block h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
              value={role}
              onChange={(e) => setParam("role", e.target.value)}
            >
              <option value="all">Все</option>
              <option value="buyer">Покупатель</option>
              <option value="store">Магазин</option>
            </select>
          </label>
          <label className="text-xs font-medium text-slate-600">
            Статус
            <select
              className="mt-1 block h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
              value={status}
              onChange={(e) => setParam("status", e.target.value)}
            >
              <option value="all">Все</option>
              <option value="active">Активен</option>
              <option value="suspended">Заблокирован</option>
            </select>
          </label>
          <label className="text-xs font-medium text-slate-600">
            Верификация
            <select
              className="mt-1 block h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
              value={verification}
              onChange={(e) => setParam("verification", e.target.value)}
            >
              <option value="all">Все</option>
              <option value="none">Нет</option>
              <option value="pending">В процессе</option>
              <option value="verified">Подтверждён</option>
            </select>
          </label>
          <label className="text-xs font-medium text-slate-600">
            Магазин
            <select
              className="mt-1 block h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
              value={hasStore}
              onChange={(e) => setParam("hasStore", e.target.value)}
            >
              <option value="all">Все</option>
              <option value="yes">Есть</option>
              <option value="no">Нет</option>
            </select>
          </label>
          <div>
            <p className="text-xs font-medium text-slate-600">Поиск</p>
            <AdminSearchInput value={search} onChange={(v) => setParam("q", v)} placeholder="Имя или email" />
          </div>
        </div>
      </AdminFiltersBar>
      {loading ? <p className="text-sm text-slate-500">Загрузка…</p> : null}
      {!loading && !rows.length ? (
        <AdminEmptyState title="Нет пользователей" description="Измените фильтры или поиск." />
      ) : null}
      {!loading && rows.length ? (
        <AdminDataTable
          columns={[
            { key: "n", label: "Имя" },
            { key: "e", label: "Email" },
            { key: "r", label: "Роль" },
            { key: "s", label: "Статус" },
            { key: "d", label: "Регистрация" },
            { key: "lc", label: "Объявл." },
            { key: "sc", label: "Магаз." },
            { key: "t", label: "Trust" },
            { key: "v", label: "Вериф." },
            { key: "f", label: "Флаги" },
            { key: "p", label: "План" },
            { key: "a", label: "Действия" },
          ]}
          rows={tableRows}
        />
      ) : null}
    </div>
  );
}
