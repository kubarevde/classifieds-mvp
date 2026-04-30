"use client";

import type { ReactNode } from "react";

import { AdminBreadcrumbs } from "./AdminBreadcrumbs";
import type { BreadcrumbItem } from "@/config/admin-routes";

export function AdminPageHeader({
  breadcrumbs,
  title,
  subtitle,
  actions,
}: {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="space-y-3 border-b border-slate-200 pb-4">
      <AdminBreadcrumbs items={breadcrumbs} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {subtitle ? <p className="max-w-3xl text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
    </header>
  );
}
