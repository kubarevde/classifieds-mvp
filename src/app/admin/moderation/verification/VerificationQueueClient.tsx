"use client";

import { useMemo } from "react";

import { AdminListPageShell } from "@/components/admin/AdminListPageShell";
import { useAdminUrlFilters } from "@/components/admin/useAdminUrlFilters";
import { ModerationShell } from "@/components/moderation/ModerationShell";
import { ModerationFilters } from "@/components/moderation/ModerationFilters";
import { ModerationQueueCard } from "@/components/moderation/ModerationQueueCard";
import { QueueEmptyState } from "@/components/moderation/QueueEmptyState";
import { getModerationQueue } from "@/services/moderation";

export default function VerificationQueueClient() {
  const { filters, setFilters } = useAdminUrlFilters();
  const baseItems = useMemo(() => getModerationQueue({ queueType: "verification_case" }), []);
  const items = useMemo(() => getModerationQueue({ ...filters, queueType: "verification_case" }), [filters]);
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
        title="Верификация"
        subtitle="Очередь проверок buyer/seller/store."
        filters={<ModerationFilters value={filters} onChange={setFilters} showQueueType={false} />}
        hasItems={items.length > 0}
        emptyState={
          hasBaseItems && hasActiveFilters ? (
            <QueueEmptyState
              title="По текущим фильтрам ничего не найдено"
              description="Уточните фильтры или покажите все кейсы."
              ctaHref="/admin/moderation/verification"
              ctaLabel="Показать все кейсы"
            />
          ) : (
            <QueueEmptyState title="Новых кейсов нет" description="Очередь верификации пуста." />
          )
        }
      >
        <div className="grid gap-3">
          {items.map((item) => (
            <ModerationQueueCard key={item.id} item={item} href={`/admin/moderation/verification/${item.id}`} />
          ))}
        </div>
      </AdminListPageShell>
    </ModerationShell>
  );
}

