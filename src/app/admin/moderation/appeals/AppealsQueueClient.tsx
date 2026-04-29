"use client";

import { useMemo } from "react";

import { AdminListPageShell } from "@/components/admin/AdminListPageShell";
import { useAdminUrlFilters } from "@/components/admin/useAdminUrlFilters";
import { ModerationShell } from "@/components/moderation/ModerationShell";
import { ModerationFilters } from "@/components/moderation/ModerationFilters";
import { ModerationQueueCard } from "@/components/moderation/ModerationQueueCard";
import { QueueEmptyState } from "@/components/moderation/QueueEmptyState";
import { getModerationQueue } from "@/services/moderation";

export default function AppealsQueueClient() {
  const { filters, setFilters } = useAdminUrlFilters();
  const baseItems = useMemo(() => getModerationQueue({ queueType: "appeal_case" }), []);
  const items = useMemo(() => getModerationQueue({ ...filters, queueType: "appeal_case" }), [filters]);
  const hasBaseItems = baseItems.length > 0;
  const hasActiveFilters = Boolean(
    filters.search ||
      (filters.status && filters.status !== "all") ||
      (filters.priority && filters.priority !== "all") ||
      (filters.assignedTo && filters.assignedTo !== "all"),
  );

  return (
    <ModerationShell>
      <AdminListPageShell
        title="Appeals"
        subtitle="Очередь обращений на пересмотр решений."
        filters={<ModerationFilters value={filters} onChange={setFilters} showQueueType={false} />}
        hasItems={items.length > 0}
        emptyState={
          hasBaseItems && hasActiveFilters ? (
            <QueueEmptyState
              title="По текущим фильтрам ничего не найдено"
              description="Попробуйте изменить параметры фильтрации."
              ctaHref="/admin/moderation/appeals"
              ctaLabel="Сбросить фильтры"
            />
          ) : (
            <QueueEmptyState title="Новых кейсов нет" description="Очередь appeals сейчас пуста." />
          )
        }
      >
        <div className="grid gap-3">
          {items.map((item) => (
            <ModerationQueueCard key={item.id} item={item} href={`/admin/moderation/appeals/${item.id}`} />
          ))}
        </div>
      </AdminListPageShell>
    </ModerationShell>
  );
}

