"use client";

import type { ReactNode } from "react";

export function AdminListPageShell({
  title,
  subtitle,
  filters,
  stats,
  hasItems,
  emptyState,
  children,
}: {
  title: string;
  subtitle?: string;
  filters?: ReactNode;
  stats?: ReactNode;
  hasItems: boolean;
  emptyState?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
      </header>
      {stats}
      {filters}
      {hasItems ? children : emptyState}
    </div>
  );
}

