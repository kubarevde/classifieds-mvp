"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminFiltersBar } from "@/components/admin/AdminFiltersBar";
import { AdminListPageShell } from "@/components/admin/AdminListPageShell";
import { ModerationShell } from "@/components/moderation/ModerationShell";
import { EnforcementStatusBadge } from "@/components/enforcement/EnforcementStatusBadge";
import { getDemoBuyerPersonaSellerId, DEMO_STOREFRONT_SELLER_ID } from "@/lib/demo-role-constants";
import { getUserEnforcementActions, type EnforcementActionType } from "@/services/enforcement";
import { QueueEmptyState } from "@/components/moderation/QueueEmptyState";

const actionTypes: Array<EnforcementActionType | "all"> = [
  "all",
  "warning",
  "content_hidden",
  "content_removed",
  "account_limited",
  "account_suspended",
  "verification_required",
];

export default function EnforcementQueueClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filter = (searchParams.get("actionType") as EnforcementActionType | "all") ?? "all";
  const search = searchParams.get("search") ?? "";

  const allActions = useMemo(
    () => [
      ...getUserEnforcementActions(DEMO_STOREFRONT_SELLER_ID),
      ...getUserEnforcementActions(getDemoBuyerPersonaSellerId()),
    ],
    [],
  );
  const actions = useMemo(() => {
    return allActions.filter((action) => {
      const typeMatch = filter === "all" ? true : action.actionType === filter;
      const searchMatch = search
        ? `${action.id} ${action.targetLabel} ${action.reasonTitle}`.toLowerCase().includes(search.toLowerCase())
        : true;
      return typeMatch && searchMatch;
    });
  }, [allActions, filter, search]);
  const hasActiveFilters = filter !== "all" || Boolean(search);

  return (
    <ModerationShell>
      <AdminListPageShell
        title="Enforcement"
        subtitle="Lifecycle принятых решений и связанных appeals."
        filters={
          <AdminFiltersBar>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <input
                value={search}
                onChange={(e) => {
                  const next = new URLSearchParams(searchParams.toString());
                  if (!e.target.value) next.delete("search");
                  else next.set("search", e.target.value);
                  router.replace(`${pathname}?${next.toString()}`);
                }}
                placeholder="Поиск"
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm lg:col-span-2"
              />
              <select
                value={filter}
                onChange={(e) => {
                  const next = new URLSearchParams(searchParams.toString());
                  const value = e.target.value as EnforcementActionType | "all";
                  if (value === "all") next.delete("actionType");
                  else next.set("actionType", value);
                  router.replace(`${pathname}?${next.toString()}`);
                }}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              >
                {actionTypes.map((type) => (
                  <option key={type} value={type}>
                    Тип решения: {type}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => router.replace(pathname)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
              >
                Сбросить фильтры
              </button>
            </div>
          </AdminFiltersBar>
        }
        hasItems={actions.length > 0}
        emptyState={
          allActions.length > 0 && hasActiveFilters ? (
            <QueueEmptyState
              title="По текущим фильтрам ничего не найдено"
              description="Измените фильтры action type или поиск."
              ctaHref="/admin/moderation/enforcement"
              ctaLabel="Показать все решения"
            />
          ) : (
            <QueueEmptyState title="Новых кейсов нет" description="Очередь enforcement сейчас пуста." />
          )
        }
      >
        <div className="grid gap-3">
          {actions.map((action) => (
            <article key={action.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{action.targetLabel}</p>
                  <p className="text-xs text-slate-500">
                    {action.id} · {action.actionType} · {action.targetType}
                  </p>
                </div>
                <EnforcementStatusBadge actionType={action.actionType} status={action.status} />
                <span className="text-xs text-slate-500">
                  {action.expiresAt ? `до ${new Date(action.expiresAt).toLocaleDateString("ru-RU")}` : "без срока"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{action.reasonTitle}</p>
              <AdminInternalLink
                href={`/admin/moderation/enforcement/${action.id}`}
                className="mt-3 inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white"
              >
                Открыть кейс
              </AdminInternalLink>
            </article>
          ))}
        </div>
      </AdminListPageShell>
    </ModerationShell>
  );
}

