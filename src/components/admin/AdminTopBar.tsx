"use client";

import { Menu, Search } from "lucide-react";

import { flattenNavLinksForPersona } from "@/config/admin-routes";

import { AdminInternalLink } from "./AdminInternalLink";
import { useAdminConsole } from "./admin-console-context";

const PERSONA_BADGE: Record<string, string> = {
  admin: "Админ",
  moderator: "Модерация",
  support: "Поддержка",
  finance: "Финансы",
  none: "Нет доступа",
};

export function AdminTopBar() {
  const { persona, demoRoleLabel, setCommandPaletteOpen } = useAdminConsole();
  const links = flattenNavLinksForPersona(persona);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur md:hidden">
      <AdminInternalLink href="/admin" className="text-sm font-semibold text-slate-900">
        Classify Admin
      </AdminInternalLink>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          aria-label="Поиск по консоли"
        >
          <Search className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
          {PERSONA_BADGE[persona] ?? persona}
        </span>
        <details className="relative group">
          <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 marker:hidden">
            <Menu className="h-4 w-4" strokeWidth={1.5} />
            Разделы
          </summary>
          <div className="absolute right-0 z-50 mt-1 max-h-[70vh] w-64 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
            {links.map((l) => (
              <AdminInternalLink key={l.href + l.label} href={l.href} className="block px-3 py-2 text-sm text-slate-800 hover:bg-slate-50">
                {l.label}
              </AdminInternalLink>
            ))}
          </div>
        </details>
      </div>
      <span className="sr-only">Демо-роль: {demoRoleLabel}</span>
    </header>
  );
}
