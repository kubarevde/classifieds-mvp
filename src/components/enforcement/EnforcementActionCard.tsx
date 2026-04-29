"use client";

import Link from "next/link";

import type { EnforcementAction } from "@/services/enforcement/types";
import { EnforcementStatusBadge } from "./EnforcementStatusBadge";

export function EnforcementActionCard({ action }: { action: EnforcementAction }) {
  return (
    <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{action.targetLabel}</p>
          <p className="mt-1 text-xs text-slate-500">
            {action.targetType} · ID: <span className="font-mono text-[11px] text-slate-600">{action.targetId}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EnforcementStatusBadge actionType={action.actionType} status={action.status} />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Причина</p>
        <p className="text-sm font-semibold text-slate-900">{action.reasonTitle}</p>
        <p className="text-sm text-slate-600">{action.policySummary}</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href={`/enforcement/actions/${action.id}`}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Подробнее о решении
        </Link>
      </div>
    </article>
  );
}

