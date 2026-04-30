"use client";

import { Fragment, useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AdminBulkActionBar } from "@/components/admin/AdminBulkActionBar";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSavedViewsStrip } from "@/components/admin/AdminSavedViewsStrip";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAdminConsole } from "@/components/admin/admin-console-context";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import {
  adminBulkPauseSubscriptions,
  getAdminEntityNoteCount,
  getAdminSubscriptions,
  type AdminSubscription,
  type AdminSubscriptionListFilters,
} from "@/services/admin";

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const status = (params.get("status") ?? "all") as "all" | AdminSubscription["status"];
  const pay = (params.get("pay") ?? "all") as "all" | AdminSubscription["paymentStatus"];
  const { persona } = useAdminConsole();
  const canBulk = persona === "admin" || persona === "finance";
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmPause, setConfirmPause] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

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

  const filtersArg: AdminSubscriptionListFilters = useMemo(
    () => ({
      status: status === "all" ? undefined : status,
      paymentStatus: pay === "all" ? undefined : pay,
    }),
    [status, pay],
  );

  const rows = useMemo(() => {
    void tick;
    return getAdminSubscriptions(filtersArg);
  }, [filtersArg, tick]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filterSummary = [status !== "all" ? `статус: ${status}` : null, pay !== "all" ? `платёж: ${pay}` : null]
    .filter(Boolean)
    .join(", ");

  const tableRows = rows.map((s: AdminSubscription) => [
    ...(canBulk
      ? [
          <Fragment key={`${s.id}-cb`}>
            <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} className="rounded border-slate-300" />
          </Fragment>,
        ]
      : []),
    <Fragment key={`${s.id}-n`}>
      <span className="inline-flex items-center gap-1">
        <AdminInternalLink href={`/admin/subscriptions/${encodeURIComponent(s.id)}`} className="font-medium text-slate-900 hover:underline">
          {s.accountLabel}
        </AdminInternalLink>
        {getAdminEntityNoteCount("subscription", s.id) > 0 ? (
          <span className="rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-900" title="Есть внутренние заметки">
            {getAdminEntityNoteCount("subscription", s.id)}
          </span>
        ) : null}
      </span>
    </Fragment>,
    <Fragment key={`${s.id}-t`}>
      <span className="text-xs text-slate-600">{s.accountType}</span>
    </Fragment>,
    <Fragment key={`${s.id}-p`}>
      <span className="text-xs">{s.currentPlanLabel}</span>
    </Fragment>,
    <Fragment key={`${s.id}-s`}>
      <AdminStatusBadge tone={s.status === "active" ? "success" : s.status === "past_due" ? "warning" : "neutral"}>{s.status}</AdminStatusBadge>
    </Fragment>,
    <Fragment key={`${s.id}-c`}>
      <span className="text-xs">{s.billingCycle}</span>
    </Fragment>,
    <Fragment key={`${s.id}-n2`}>
      <span className="text-xs text-slate-500">{s.nextBillingAt ? new Date(s.nextBillingAt).toLocaleDateString("ru-RU") : "—"}</span>
    </Fragment>,
    <Fragment key={`${s.id}-$`}>
      <span>{s.amountMonthlyRub.toLocaleString("ru-RU")} ₽</span>
    </Fragment>,
    <Fragment key={`${s.id}-pay`}>
      <AdminStatusBadge tone={s.paymentStatus === "ok" ? "success" : "danger"}>{s.paymentStatus}</AdminStatusBadge>
    </Fragment>,
    <Fragment key={`${s.id}-l`}>
      {s.accountType === "store" ? (
        <AdminInternalLink href={`/admin/stores/${encodeURIComponent(s.accountRefId)}`} className="text-xs font-semibold text-sky-800 hover:underline">
          Магазин
        </AdminInternalLink>
      ) : (
        <AdminInternalLink
          href={`/admin/users/${encodeURIComponent(s.accountRefId === "buyer-dmitriy" ? `buyer-account:${s.accountRefId}` : `seller-account:${s.accountRefId}`)}`}
          className="text-xs font-semibold text-sky-800 hover:underline"
        >
          Профиль
        </AdminInternalLink>
      )}
    </Fragment>,
  ]);

  const columns = [
    ...(canBulk ? [{ key: "cb", label: "" }] : []),
    { key: "a", label: "Аккаунт" },
    { key: "t", label: "Тип" },
    { key: "p", label: "План" },
    { key: "s", label: "Статус" },
    { key: "c", label: "Цикл" },
    { key: "n", label: "След. списание" },
    { key: "$", label: "Сумма" },
    { key: "pay", label: "Платёж" },
    { key: "l", label: "Ссылка" },
  ];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs("/admin/subscriptions")}
        title="Подписки"
        subtitle="Жизненный цикл тарифов, оплаты и привязка к аккаунтам (mock)."
        actions={
          <div className="flex flex-wrap gap-2 text-sm">
            <AdminInternalLink href="/admin/subscriptions/plans" className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800">
              Тарифы
            </AdminInternalLink>
            <AdminInternalLink href="/admin/subscriptions/invoices" className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800">
              Счета
            </AdminInternalLink>
            <AdminInternalLink href="/admin/subscriptions/payouts" className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800">
              Выплаты
            </AdminInternalLink>
          </div>
        }
      />
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
        <AdminSavedViewsStrip domain="subscriptions" pathname="/admin/subscriptions" />
        <div className="flex flex-wrap items-end gap-3 border-t border-slate-100 pt-3">
          <label className="text-xs font-medium text-slate-600">
            Статус
            <select className="mt-1 block h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm" value={status} onChange={(e) => setParam("status", e.target.value)}>
              <option value="all">Все</option>
              <option value="active">Активные</option>
              <option value="past_due">Past due</option>
              <option value="paused">Пауза</option>
              <option value="canceled">Отменены</option>
            </select>
          </label>
          <label className="text-xs font-medium text-slate-600">
            Платёж
            <select className="mt-1 block h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm" value={pay} onChange={(e) => setParam("pay", e.target.value)}>
              <option value="all">Все</option>
              <option value="ok">ok</option>
              <option value="failed">failed</option>
              <option value="pending">pending</option>
            </select>
          </label>
        </div>
      </div>
      {banner ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          {banner}
        </p>
      ) : null}
      <AdminDataTable columns={columns} rows={tableRows} />
      {canBulk ? (
        <>
          <AdminBulkActionBar
            selectedCount={selected.size}
            context={filterSummary ? `Фильтр: ${filterSummary}` : undefined}
            onClearSelection={() => setSelected(new Set())}
          >
            <button
              type="button"
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-amber-400"
              onClick={() => setConfirmPause(true)}
            >
              Приостановить выбранные
            </button>
          </AdminBulkActionBar>
          <AdminConfirmDialog
            open={confirmPause}
            title="Массовая приостановка"
            description={`Будет приостановлено подписок: ${selected.size}. Уже отменённые будут пропущены (mock).`}
            confirmLabel="Приостановить"
            tone="danger"
            onCancel={() => setConfirmPause(false)}
            onConfirm={() => {
              const { updated, skipped } = adminBulkPauseSubscriptions([...selected]);
              setConfirmPause(false);
              setSelected(new Set());
              setTick((x) => x + 1);
              setBanner(`Обновлено: ${updated}${skipped ? `, пропущено: ${skipped}` : ""}.`);
            }}
          />
        </>
      ) : null}
    </div>
  );
}
