"use client";

import { Fragment, useCallback, useMemo, useState } from "react";
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
import { supportActorToAdminUserHref } from "@/lib/admin-support-cross-links";
import { getAdminEntityNoteCount, getAdminSupportTickets, type AdminSupportTicketRow } from "@/services/admin";
import { adminBulkSetTicketStatus } from "@/services/support";

export default function AdminSupportPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const status = params.get("status") ?? "all";
  const priority = params.get("priority") ?? "all";
  const category = params.get("category") ?? "all";
  const assigned = params.get("assigned") ?? "all";
  const search = params.get("q") ?? "";
  const { persona } = useAdminConsole();
  const canBulk = persona === "admin" || persona === "support";
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmInProgress, setConfirmInProgress] = useState(false);
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

  const data = useMemo(() => {
    void tick;
    return getAdminSupportTickets({
      status: status === "all" ? undefined : status,
      priority: priority === "all" ? undefined : priority,
      category: category === "all" ? undefined : category,
      assigned: assigned === "all" ? undefined : assigned,
      search: search || undefined,
    });
  }, [status, priority, category, assigned, search, tick]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filterSummary = [status !== "all" ? `статус: ${status}` : null, priority !== "all" ? `приоритет: ${priority}` : null]
    .filter(Boolean)
    .join(", ");

  const tableRows = useMemo(
    () =>
      data.map((t: AdminSupportTicketRow) => [
        ...(canBulk
          ? [
              <Fragment key={`${t.id}-cb`}>
                <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggle(t.id)} className="rounded border-slate-300" />
              </Fragment>,
            ]
          : []),
        <Fragment key={`${t.id}-s`}>
          <span className="inline-flex items-center gap-1">
            <AdminInternalLink href={`/admin/support/${t.id}`} className="font-medium text-slate-900 hover:underline">
              {t.subject}
            </AdminInternalLink>
            {getAdminEntityNoteCount("support", t.id) > 0 ? (
              <span className="rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-900" title="Есть внутренние заметки">
                {getAdminEntityNoteCount("support", t.id)}
              </span>
            ) : null}
          </span>
        </Fragment>,
        <Fragment key={`${t.id}-u`}>
          <AdminInternalLink href={supportActorToAdminUserHref(t.userId)} className="text-sm text-slate-700 hover:underline">
            {t.userLabel}
          </AdminInternalLink>
        </Fragment>,
        <Fragment key={`${t.id}-c`}>
          <span className="text-xs">{t.category}</span>
        </Fragment>,
        <Fragment key={`${t.id}-st`}>
          <AdminStatusBadge tone="neutral">{t.status}</AdminStatusBadge>
        </Fragment>,
        <Fragment key={`${t.id}-p`}>
          <AdminStatusBadge tone={t.priority === "high" ? "danger" : "neutral"}>{t.priority}</AdminStatusBadge>
        </Fragment>,
        <Fragment key={`${t.id}-d`}>
          <span className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleString("ru-RU")}</span>
        </Fragment>,
        <Fragment key={`${t.id}-a`}>
          <span className="text-xs">{t.assignedTo ?? "—"}</span>
        </Fragment>,
      ]),
    [canBulk, data, selected, toggle],
  );

  const columns = [
    ...(canBulk ? [{ key: "cb", label: "" }] : []),
    { key: "s", label: "Тема" },
    { key: "u", label: "Пользователь" },
    { key: "c", label: "Категория" },
    { key: "st", label: "Статус" },
    { key: "p", label: "Приоритет" },
    { key: "d", label: "Создан" },
    { key: "a", label: "Агент" },
  ];

  return (
    <div className="space-y-4">
      <AdminPageHeader breadcrumbs={buildAdminBreadcrumbs("/admin/support")} title="Поддержка" subtitle="Тикеты и назначения (mock, in-memory)." />
      <AdminFiltersBar>
        <div className="space-y-3">
          <AdminSavedViewsStrip domain="support" pathname="/admin/support" />
          <div className="flex flex-wrap items-end gap-3 border-t border-slate-100 pt-3">
            <label className="text-xs font-medium text-slate-600">
              Статус
              <select className="mt-1 block h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm" value={status} onChange={(e) => setParam("status", e.target.value)}>
                <option value="all">Все</option>
                <option value="open">Открыт</option>
                <option value="in_progress">В работе</option>
                <option value="resolved">Решён</option>
                <option value="closed">Закрыт</option>
              </select>
            </label>
            <label className="text-xs font-medium text-slate-600">
              Приоритет
              <select className="mt-1 block h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm" value={priority} onChange={(e) => setParam("priority", e.target.value)}>
                <option value="all">Все</option>
                <option value="low">Низкий</option>
                <option value="normal">Обычный</option>
                <option value="high">Высокий</option>
              </select>
            </label>
            <label className="text-xs font-medium text-slate-600">
              Категория
              <select className="mt-1 block h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm" value={category} onChange={(e) => setParam("category", e.target.value)}>
                <option value="all">Все</option>
                <option value="account">Аккаунт</option>
                <option value="payment">Оплата</option>
                <option value="store">Магазин</option>
                <option value="safety">Безопасность</option>
              </select>
            </label>
            <label className="text-xs font-medium text-slate-600">
              Назначение
              <select className="mt-1 block h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm" value={assigned} onChange={(e) => setParam("assigned", e.target.value)}>
                <option value="all">Все</option>
                <option value="unassigned">Без назначения</option>
                <option value="Мария · L2">Мария · L2</option>
              </select>
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
      {!data.length ? <AdminEmptyState title="Нет тикетов" /> : null}
      {data.length ? <AdminDataTable columns={columns} rows={tableRows} /> : null}
      {canBulk ? (
        <>
          <AdminBulkActionBar
            selectedCount={selected.size}
            context={filterSummary ? `Фильтр: ${filterSummary}` : undefined}
            onClearSelection={() => setSelected(new Set())}
          >
            <button
              type="button"
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-100"
              onClick={() => setConfirmInProgress(true)}
            >
              В работу (выбранные)
            </button>
          </AdminBulkActionBar>
          <AdminConfirmDialog
            open={confirmInProgress}
            title="Массовый перевод в работу"
            description={`Статус «в работе» будет выставлен для ${selected.size} тикетов (mock).`}
            confirmLabel="Применить"
            tone="neutral"
            onCancel={() => setConfirmInProgress(false)}
            onConfirm={() => {
              const { updated, skipped } = adminBulkSetTicketStatus([...selected], "in_progress");
              setConfirmInProgress(false);
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
