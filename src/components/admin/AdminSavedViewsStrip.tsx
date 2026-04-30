"use client";

import { useSearchParams } from "next/navigation";

import type { AdminSavedView, AdminSavedViewDomain } from "@/lib/admin-saved-views";
import { ADMIN_PRESET_VIEWS, hrefForSavedView, isViewActive } from "@/lib/admin-saved-views";

import { AdminInternalLink } from "./AdminInternalLink";

export function AdminSavedViewsStrip({ domain, pathname }: { domain: AdminSavedViewDomain; pathname: string }) {
  const params = useSearchParams();
  const views = ADMIN_PRESET_VIEWS[domain];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Наборы</span>
      <div className="flex flex-wrap gap-1.5">
        {views.map((v: AdminSavedView) => {
          const active = isViewActive(v, params);
          const href = hrefForSavedView(pathname, params.toString(), v);
          return (
            <AdminInternalLink
              key={v.id}
              href={href}
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {v.label}
            </AdminInternalLink>
          );
        })}
      </div>
    </div>
  );
}
