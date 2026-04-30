"use client";

import { useMemo, useState } from "react";

import { AdminBulkActionBar } from "@/components/admin/AdminBulkActionBar";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminListPageShell } from "@/components/admin/AdminListPageShell";
import { AdminSavedViewsStrip } from "@/components/admin/AdminSavedViewsStrip";
import { useAdminUrlFilters } from "@/components/admin/useAdminUrlFilters";
import { useAdminConsole } from "@/components/admin/admin-console-context";
import { ModerationShell } from "@/components/moderation/ModerationShell";
import { ModerationFilters } from "@/components/moderation/ModerationFilters";
import { ModerationQueueCard } from "@/components/moderation/ModerationQueueCard";
import { QueueEmptyState } from "@/components/moderation/QueueEmptyState";
import { assignModerationCasesBulk, getModerationQueue } from "@/services/moderation";

const BULK_REVIEWER = "moderator.bulk";

export default function ReportsQueueClient() {
  const { filters, setFilters } = useAdminUrlFilters();
  const { persona } = useAdminConsole();
  const canBulk = persona === "admin" || persona === "moderator";
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmBulk, setConfirmBulk] = useState<"assign" | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const baseItems = useMemo(() => getModerationQueue({ queueType: "safety_report" }), []);
  const items = useMemo(() => {
    void tick;
    return getModerationQueue({
      ...filters,
      queueType: "safety_report",
    });
  }, [filters, tick]);

  const hasBaseItems = baseItems.length > 0;
  const hasActiveFilters = Boolean(
    filters.search ||
      (filters.status && filters.status !== "all") ||
      (filters.priority && filters.priority !== "all") ||
      (filters.assignedTo && filters.assignedTo !== "all"),
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filterSummary = [
    filters.status && filters.status !== "all" ? `статус: ${filters.status}` : null,
    filters.priority && filters.priority !== "all" ? `приоритет: ${filters.priority}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <ModerationShell>
      <AdminListPageShell
        title="Жалобы"
        subtitle="Очередь пользовательских жалоб с фильтрами и назначением."
        filters={
          <div className="space-y-3">
            <AdminSavedViewsStrip domain="moderation" pathname="/admin/moderation/reports" />
            <ModerationFilters value={filters} onChange={setFilters} showQueueType={false} />
          </div>
        }
        hasItems={items.length > 0}
        emptyState={
          hasBaseItems && hasActiveFilters ? (
            <QueueEmptyState
              title="По текущим фильтрам ничего не найдено"
              description="Измените условия поиска или сбросьте фильтры."
              ctaLabel="Сбросить фильтры"
              ctaHref="/admin/moderation/reports"
            />
          ) : (
            <QueueEmptyState title="Новых кейсов нет" description="Очередь жалоб сейчас пуста." />
          )
        }
      >
        {banner ? (
          <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
            {banner}
          </p>
        ) : null}
        {canBulk && items.length ? (
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-800 hover:bg-slate-50"
              onClick={() => {
                if (selected.size === items.length) {
                  setSelected(new Set());
                } else {
                  setSelected(new Set(items.map((i) => i.id)));
                }
              }}
            >
              {selected.size === items.length ? "Снять все" : "Выбрать все на экране"}
            </button>
          </div>
        ) : null}
        <div className="grid gap-3">
          {items.map((item) => (
            <ModerationQueueCard
              key={item.id}
              item={item}
              href={`/admin/moderation/reports/${item.id}`}
              selectable={canBulk}
              selected={selected.has(item.id)}
              onToggleSelected={() => toggle(item.id)}
            />
          ))}
        </div>
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
                onClick={() => setConfirmBulk("assign")}
              >
                Назначить на bulk-ревьюера
              </button>
            </AdminBulkActionBar>
            <AdminConfirmDialog
              open={confirmBulk === "assign"}
              title="Массовое назначение"
              description={`Будет назначено выбранным кейсам ревьюер «${BULK_REVIEWER}» и статус «в разборе» (mock).`}
              confirmLabel="Назначить"
              tone="neutral"
              onCancel={() => setConfirmBulk(null)}
              onConfirm={() => {
                const ids = [...selected];
                const { updated, skipped } = assignModerationCasesBulk(ids, BULK_REVIEWER);
                setConfirmBulk(null);
                setSelected(new Set());
                setTick((x) => x + 1);
                setBanner(`Назначено: ${updated}${skipped ? `, пропущено: ${skipped}` : ""}.`);
              }}
            />
          </>
        ) : null}
      </AdminListPageShell>
    </ModerationShell>
  );
}
