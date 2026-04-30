"use client";

import Link from "next/link";

import type { BreadcrumbItem } from "@/config/admin-routes";

import { AdminInternalLink } from "./AdminInternalLink";

export function AdminBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
      {items.map((crumb, index) => (
        <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1.5">
          {index > 0 ? <span className="text-slate-300">/</span> : null}
          {crumb.href ? (
            crumb.href.startsWith("/admin") ? (
              <AdminInternalLink href={crumb.href} className="text-slate-600 hover:text-slate-900">
                {crumb.label}
              </AdminInternalLink>
            ) : (
              <Link href={crumb.href} className="text-slate-600 hover:text-slate-900">
                {crumb.label}
              </Link>
            )
          ) : (
            <span className="font-medium text-slate-800">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
