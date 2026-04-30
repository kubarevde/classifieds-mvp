"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AdminBulkActionBar } from "@/components/admin/AdminBulkActionBar";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminFiltersBar } from "@/components/admin/AdminFiltersBar";
import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSavedViewsStrip } from "@/components/admin/AdminSavedViewsStrip";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAdminConsole } from "@/components/admin/admin-console-context";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { adminApplyBulkListingActions, getAdminEntityNoteCount, getAdminListings, type AdminListing } from "@/services/admin";

export default function AdminListingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const status = (params.get("status") ?? "all") as "all" | AdminListing["status"];
  const world = params.get("world") ?? "all";
  const flagged = params.get("flagged") === "1";
  const promoted = params.get("promoted") === "1";
  const search = params.get("q") ?? "";
  const { persona } = useAdminConsole();
  const canBulk = persona === "admin" || persona === "moderator";
  const [rows, setRows] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

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
      flaggedOnly: flagged || undefined,
      promotedOnly: promoted || undefined,
      search: search || undefined,
    }),
    [status, world, flagged, promoted, search],
  );

  useEffect(() => {
    let c = false;
    void getAdminListings(filtersArg).then((r) => {
      if (!c) {
        setRows(r);
        setLoading(false);
      }
    });
    return () => {
      c = true;
    };
  }, [filtersArg]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filterSummary = [flagged ? "с флагами" : null, promoted ? "промо" : null, world !== "all" ? `мир: ${world}` : null]
    .filter(Boolean)
    .join(", ");

  const tableRows = useMemo(
    () =>
      rows.map((l) => [
        ...(canBulk
          ? [
              <Fragment key={`${l.id}-cb`}>
                <input type="checkbox" checked={selected.has(l.id)} onChange={() => toggle(l.id)} className="rounded border-slate-300" />
              </Fragment>,
            ]
          : []),
        <Fragment key={`${l.id}-t`}>
          <span className="inline-flex items-center gap-1">
            <AdminInternalLink href={`/admin/listings/${l.id}`} className="font-medium text-slate-900 hover:underline">
              {l.title}
            </AdminInternalLink>
            {getAdminEntityNoteCount("listing", l.id) > 0 ? (
              <span className="rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-900" title="Есть внутренние заметки">
                {getAdminEntityNoteCount("listing", l.id)}
              </span>
            ) : null}
          </span>
        </Fragment>,
        <Fragment key={`${l.id}-s`}>
          <span className="text-slate-600">{l.sellerLabel}</span>
        </Fragment>,
        <Fragment key={`${l.id}-st`}>
          <AdminStatusBadge tone="neutral">{l.status}</AdminStatusBadge>
        </Fragment>,
        <Fragment key={`${l.id}-w`}>
          <span className="text-xs">{l.worldLabel}</span>
        </Fragment>,
        <Fragment key={`${l.id}-p`}>
          <span>{l.priceLabel}</span>
        </Fragment>,
        <Fragment key={`${l.id}-d`}>
          <span className="text-xs text-slate-500">{new Date(l.createdAt).toLocaleDateString("ru-RU")}</span>
        </Fragment>,
        <Fragment key={`${l.id}-f`}>
          <span>{l.flagsCount}</span>
        </Fragment>,
        <Fragment key={`${l.id}-b`}>
          <span className="text-xs">{l.isBoosted || l.isPromoted ? "да" : "—"}</span>
        </Fragment>,
        <Fragment key={`${l.id}-tr`}>
          <span className="text-xs text-slate-600">{l.trustHint}</span>
        </Fragment>,
        <Fragment key={`${l.id}-a`}>
          <AdminInternalLink href="/admin/moderation/reports" className="text-xs font-semibold text-slate-900 hover:underline">
            Жалобы
          </AdminInternalLink>
        </Fragment>,
      ]),
    [canBulk, rows, selected, toggle],
  );

  const columns = [
    ...(canBulk ? [{ key: "cb", label: "" }] : []),
    { key: "t", label: "Заголовок" },
    { key: "s", label: "Продавец" },
    { key: "st", label: "Статус" },
    { key: "w", label: "Мир" },
    { key: "p", label: "Цена" },
    { key: "d", label: "Дата" },
    { key: "f", label: "Флаги" },
    { key: "b", label: "Промо" },
    { key: "tr", label: "Trust" },
    { key: "a", label: "Действия" },
  ];

  return (
    <div className="space-y-4">
      <AdminPageHeader breadcrumbs={buildAdminBreadcrumbs("/admin/listings")} title="Объявления" subtitle="Каталог, промо-состояние и сигналы доверия (mock)." />
      <AdminFiltersBar>
        <div className="space-y-3">
          <AdminSavedViewsStrip domain="listings" pathname="/admin/listings" />
          <div className="flex flex-wrap items-end gap-3 border-t border-slate-100 pt-3">
            <label className="text-xs font-medium text-slate-600">
              Статус
              <select className="mt-1 block h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm" value={status} onChange={(e) => setParam("status", e.target.value)}>
                <option value="all">Все</option>
                <option value="active">Активные</option>
              </select>
            </label>
            <label className="text-xs font-medium text-slate-600">
              Мир
              <select className="mt-1 block h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm" value={world} onChange={(e) => setParam("world", e.target.value)}>
                <option value="all">Все</option>
                <option value="electronics">Электроника</option>
                <option value="autos">Авто</option>
                <option value="agriculture">Агро</option>
                <option value="real_estate">Недвижимость</option>
                <option value="services">Услуги</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <input type="checkbox" checked={flagged} onChange={(e) => setParam("flagged", e.target.checked ? "1" : "0")} />
              Только с флагами
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <input type="checkbox" checked={promoted} onChange={(e) => setParam("promoted", e.target.checked ? "1" : "0")} />
              Промо / буст
            </label>
            <div>
              <p className="text-xs font-medium text-slate-600">Поиск</p>
              <AdminSearchInput value={search} onChange={(v) => setParam("q", v)} />
            </div>
          </div>
        </div>
      </AdminFiltersBar>
      {banner ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          {banner}
        </p>
      ) : null}
      {loading ? <p className="text-sm text-slate-500">Загрузка…</p> : null}
      {!loading && !rows.length ? <AdminEmptyState title="Нет объявлений" /> : null}
      {!loading && rows.length ? <AdminDataTable columns={columns} rows={tableRows} /> : null}
      {canBulk ? (
        <>
          <AdminBulkActionBar
            selectedCount={selected.size}
            context={filterSummary ? `Фильтр: ${filterSummary}` : undefined}
            onClearSelection={() => setSelected(new Set())}
          >
            <button type="button" className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-100" onClick={() => setConfirmRemove(true)}>
              Снять с публикации (выбранные)
            </button>
          </AdminBulkActionBar>
          <AdminConfirmDialog
            open={confirmRemove}
            title="Снятие с публикации"
            description={`Будет помечено как «removed» в mock-слое для ${selected.size} объявлений. Действие обратимо только повторным mock-проходом.`}
            confirmLabel="Снять"
            tone="danger"
            onCancel={() => setConfirmRemove(false)}
            onConfirm={() => {
              const { updated, skipped } = adminApplyBulkListingActions([...selected], "remove");
              setConfirmRemove(false);
              setSelected(new Set());
              void getAdminListings(filtersArg).then(setRows);
              setBanner(`Обновлено: ${updated}${skipped ? `, пропущено: ${skipped}` : ""}.`);
            }}
          />
        </>
      ) : null}
    </div>
  );
}
