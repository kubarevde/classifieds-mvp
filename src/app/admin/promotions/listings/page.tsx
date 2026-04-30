"use client";

import { Fragment, useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AdminBulkActionBar } from "@/components/admin/AdminBulkActionBar";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminFiltersBar } from "@/components/admin/AdminFiltersBar";
import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPromotionTypeBadge } from "@/components/admin/AdminPromotionTypeBadge";
import { AdminSavedViewsStrip } from "@/components/admin/AdminSavedViewsStrip";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAdminConsole } from "@/components/admin/admin-console-context";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { getAdminEntityNoteCount } from "@/services/admin";
import {
  adminBulkPromotionActions,
  listAdminPromotions,
  type AdminPromotion,
  type AdminPromotionBulkAction,
  type PromotionSource,
  type PromotionStatus,
  type PromotionType,
} from "@/services/promotions";

const SOURCE_RU: Record<PromotionSource, string> = {
  paid_purchase: "Оплата",
  subscription_entitlement: "Подписка",
  admin_grant: "Админ-грант",
};

function statusTone(s: PromotionStatus): "neutral" | "success" | "warning" | "danger" {
  if (s === "active") return "success";
  if (s === "paused" || s === "scheduled") return "warning";
  if (s === "expired" || s === "rejected") return "danger";
  return "neutral";
}

export default function AdminPromotionsListingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { persona } = useAdminConsole();
  const canWrite = persona === "admin" || persona === "finance";

  const type = (params.get("type") ?? "all") as PromotionType | "all";
  const status = (params.get("status") ?? "all") as PromotionStatus | "all";
  const source = (params.get("source") ?? "all") as PromotionSource | "all";
  const flagged = (params.get("flagged") ?? "all") as "all" | "1";
  const expiring = params.get("expiring") === "1";
  const placement = params.get("placement") ?? "";
  const q = params.get("q") ?? "";

  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [banner, setBanner] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<AdminPromotionBulkAction | null>(null);

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

  const data = useMemo(() => {
    void tick;
    return listAdminPromotions({
      type: type === "all" ? undefined : type,
      status: status === "all" ? undefined : status,
      source: source === "all" ? undefined : source,
      flagged: flagged === "1" ? "1" : "all",
      expiringSoon: expiring || undefined,
      placementKey: placement || undefined,
      search: q || undefined,
    });
  }, [type, status, source, flagged, expiring, placement, q, tick]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filterSummary = [
    type !== "all" ? `тип: ${type}` : null,
    status !== "all" ? `статус: ${status}` : null,
    source !== "all" ? `источник: ${source}` : null,
    flagged === "1" ? "только риск/flagged" : null,
    expiring ? "истекают скоро" : null,
    placement ? `слот: ${placement}` : null,
    q ? `поиск: ${q}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const runBulk = (action: AdminPromotionBulkAction) => {
    const ids = [...selected];
    const { updated, skipped } = adminBulkPromotionActions(ids, action);
    setSelected(new Set());
    setTick((x) => x + 1);
    setBanner(`Готово: обновлено ${updated}, пропущено ${skipped} (mock).`);
    setConfirmAction(null);
    window.setTimeout(() => setBanner(null), 5000);
  };

  const tableRows = data.map((p: AdminPromotion) => [
    ...(canWrite
      ? [
          <Fragment key={`${p.id}-cb`}>
            <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="rounded border-slate-300" />
          </Fragment>,
        ]
      : []),
    <Fragment key={`${p.id}-ty`}>
      <AdminPromotionTypeBadge type={p.type} />
    </Fragment>,
    <Fragment key={`${p.id}-tg`}>
      {p.targetType === "listing" ? (
        <AdminInternalLink href={`/admin/listings/${encodeURIComponent(p.targetId)}`} className="text-sm font-medium text-slate-900 hover:underline">
          Объявление
        </AdminInternalLink>
      ) : (
        <AdminInternalLink href={`/admin/stores/${encodeURIComponent(p.targetId)}`} className="text-sm font-medium text-slate-900 hover:underline">
          Магазин
        </AdminInternalLink>
      )}
      <p className="truncate text-xs text-slate-500">{p.targetId}</p>
    </Fragment>,
    <Fragment key={`${p.id}-o`}>
      <AdminInternalLink href={`/admin/users/${encodeURIComponent(p.ownerId)}`} className="text-xs text-sky-800 hover:underline">
        {p.ownerId.replace(/^seller-account:/, "")}
      </AdminInternalLink>
    </Fragment>,
    <Fragment key={`${p.id}-st`}>
      <AdminStatusBadge tone={statusTone(p.status)}>{p.status}</AdminStatusBadge>
    </Fragment>,
    <Fragment key={`${p.id}-so`}>
      <span className="text-xs">{SOURCE_RU[p.source]}</span>
    </Fragment>,
    <Fragment key={`${p.id}-$`}>
      <span className="text-sm">{p.price.toLocaleString("ru-RU")} ₽</span>
    </Fragment>,
    <Fragment key={`${p.id}-d`}>
      <span className="text-xs text-slate-600">{p.startedAt ? new Date(p.startedAt).toLocaleDateString("ru-RU") : "—"}</span>
    </Fragment>,
    <Fragment key={`${p.id}-e`}>
      <span className="text-xs text-slate-600">{p.endsAt ? new Date(p.endsAt).toLocaleDateString("ru-RU") : "—"}</span>
    </Fragment>,
    <Fragment key={`${p.id}-im`}>
      <span className="text-xs">{p.impressions.toLocaleString("ru-RU")}</span>
    </Fragment>,
    <Fragment key={`${p.id}-cl`}>
      <span className="text-xs">{p.clicks}</span>
    </Fragment>,
    <Fragment key={`${p.id}-ctr`}>
      <span className="text-xs">{(p.ctr * 100).toFixed(2)}%</span>
    </Fragment>,
    <Fragment key={`${p.id}-fl`}>
      {p.flagged || p.suspiciousCtr ? (
        <span className="rounded bg-rose-100 px-1.5 text-[10px] font-bold text-rose-900">Да</span>
      ) : (
        <span className="text-xs text-slate-400">—</span>
      )}
    </Fragment>,
    <Fragment key={`${p.id}-n`}>
      <span className="inline-flex items-center gap-1">
        <AdminInternalLink href={`/admin/promotions/${encodeURIComponent(p.id)}`} className="text-xs font-semibold text-sky-800 hover:underline">
          Карточка
        </AdminInternalLink>
        {getAdminEntityNoteCount("promotion", p.id) > 0 ? (
          <span className="rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-900" title="Заметки">
            {getAdminEntityNoteCount("promotion", p.id)}
          </span>
        ) : null}
      </span>
    </Fragment>,
  ]);

  const columns = [
    ...(canWrite ? [{ key: "cb", label: "" }] : []),
    { key: "ty", label: "Тип" },
    { key: "tg", label: "Цель" },
    { key: "o", label: "Владелец" },
    { key: "st", label: "Статус" },
    { key: "so", label: "Источник" },
    { key: "$", label: "Цена" },
    { key: "d", label: "Старт" },
    { key: "e", label: "Окончание" },
    { key: "im", label: "Показы" },
    { key: "cl", label: "Клики" },
    { key: "ctr", label: "CTR" },
    { key: "fl", label: "Риск" },
    { key: "n", label: "Действия" },
  ];

  const confirmLabels: Record<AdminPromotionBulkAction, { title: string; body: string }> = {
    pause: { title: "Пауза", body: "Выбранные активные размещения будут приостановлены." },
    resume: { title: "Возобновить", body: "Возобновление только для статуса «paused»." },
    expire: { title: "Принудительно истечь", body: "Статус станет «expired», дата окончания — сейчас (mock)." },
    flag: { title: "Пометить риском", body: "Добавится флаг для модерации и финансов." },
    unflag: { title: "Снять флаг", body: "Снимется только флаг flagged." },
    revoke_admin_grant: {
      title: "Отозвать админ-грант",
      body: "Для строк с источником «Админ-грант» источник сменится на оплату (mock). Остальные будут пропущены.",
    },
  };

  return (
    <div className="space-y-4">
      {banner ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          {banner}
        </p>
      ) : null}

      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs("/admin/promotions/listings")}
        title="Объявления и бусты"
        subtitle="Платные и entitlement-размещения, метрики и риски (mock)."
      />

      <AdminFiltersBar>
        <div className="space-y-3">
          <AdminSavedViewsStrip domain="promotions-listings" pathname={pathname} />
          <div className="flex flex-wrap items-end gap-3 border-t border-slate-100 pt-3">
            <label className="text-xs font-medium text-slate-600">
              Тип
              <select
                className="mt-1 block rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                value={type}
                onChange={(e) => setParam("type", e.target.value)}
              >
                <option value="all">Все</option>
                <option value="boost">Буст</option>
                <option value="featured_listing">Избранное</option>
                <option value="homepage_feature">Главная</option>
                <option value="store_spotlight">Витрина</option>
              </select>
            </label>
            <label className="text-xs font-medium text-slate-600">
              Статус
              <select
                className="mt-1 block rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                value={status}
                onChange={(e) => setParam("status", e.target.value)}
              >
                <option value="all">Все</option>
                <option value="active">Активно</option>
                <option value="scheduled">Запланировано</option>
                <option value="paused">Пауза</option>
                <option value="expired">Истекло</option>
                <option value="draft">Черновик</option>
                <option value="rejected">Отклонено</option>
              </select>
            </label>
            <label className="text-xs font-medium text-slate-600">
              Источник
              <select
                className="mt-1 block rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                value={source}
                onChange={(e) => setParam("source", e.target.value)}
              >
                <option value="all">Все</option>
                <option value="paid_purchase">Оплата</option>
                <option value="subscription_entitlement">Подписка</option>
                <option value="admin_grant">Админ-грант</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <input type="checkbox" checked={flagged === "1"} onChange={(e) => setParam("flagged", e.target.checked ? "1" : "all")} />
              Только flagged / подозр.
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <input type="checkbox" checked={expiring} onChange={(e) => setParam("expiring", e.target.checked ? "1" : "all")} />
              Истекают ≤7д
            </label>
            <label className="text-xs font-medium text-slate-600">
              Поиск
              <input
                className="mt-1 block w-48 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                value={q}
                onChange={(e) => setParam("q", e.target.value)}
                placeholder="Заголовок, id…"
              />
            </label>
          </div>
        </div>
      </AdminFiltersBar>

      {canWrite ? (
        <AdminBulkActionBar
          selectedCount={selected.size}
          context={filterSummary ? `Фильтр: ${filterSummary}` : undefined}
          onClearSelection={() => setSelected(new Set())}
        >
          <button type="button" className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-white" onClick={() => setConfirmAction("pause")}>
            Пауза
          </button>
          <button type="button" className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-white" onClick={() => setConfirmAction("resume")}>
            Возобновить
          </button>
          <button type="button" className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-amber-400" onClick={() => setConfirmAction("expire")}>
            Истечь
          </button>
          <button type="button" className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-400" onClick={() => setConfirmAction("flag")}>
            Флаг
          </button>
          <button type="button" className="rounded-lg border border-slate-500 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-800" onClick={() => setConfirmAction("unflag")}>
            Снять флаг
          </button>
          <button type="button" className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500" onClick={() => setConfirmAction("revoke_admin_grant")}>
            Отозвать грант
          </button>
        </AdminBulkActionBar>
      ) : null}

      <AdminDataTable columns={columns} rows={tableRows} />

      {confirmAction && canWrite ? (
        <AdminConfirmDialog
          open
          title={confirmLabels[confirmAction].title}
          description={`${confirmLabels[confirmAction].body} Затронуто строк: ${selected.size}.`}
          confirmLabel="Выполнить"
          tone="danger"
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => runBulk(confirmAction)}
        />
      ) : null}
    </div>
  );
}
