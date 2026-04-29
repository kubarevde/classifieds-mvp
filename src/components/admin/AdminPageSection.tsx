"use client";

import type { ReactNode } from "react";

export function AdminPageSection({
  title,
  subtitle,
  actions,
  children,
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      {title || subtitle || actions ? (
        <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            {title ? <h2 className="text-base font-semibold text-slate-900">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
          </div>
          {actions}
        </header>
      ) : null}
      {children}
    </section>
  );
}

