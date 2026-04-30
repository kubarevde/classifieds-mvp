"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { AdminInternalLink } from "./AdminInternalLink";
import { AdminPageSection } from "./AdminPageSection";

type Breadcrumb = { label: string; href?: string };

export function AdminDetailPageShell({
  breadcrumbs,
  title,
  subtitle,
  summaryMeta,
  stickyActions,
  main,
  side,
  timelineAndNotes,
}: {
  breadcrumbs: Breadcrumb[];
  title: string;
  subtitle?: string;
  summaryMeta?: ReactNode;
  stickyActions?: ReactNode;
  main: ReactNode;
  side?: ReactNode;
  timelineAndNotes?: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        {breadcrumbs.map((crumb, index) => (
          <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-2">
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
              <span className="text-slate-900">{crumb.label}</span>
            )}
            {index < breadcrumbs.length - 1 ? <span>/</span> : null}
          </span>
        ))}
      </nav>
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
      </header>
      {summaryMeta ? <AdminPageSection title="Сводка кейса">{summaryMeta}</AdminPageSection> : null}
      {stickyActions}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">{main}</div>
        {side ? <aside>{side}</aside> : null}
      </div>
      {timelineAndNotes}
    </div>
  );
}

