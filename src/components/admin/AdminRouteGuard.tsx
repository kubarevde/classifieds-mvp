"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { getRouteAccessIdForPathname } from "@/config/admin-routes";
import { personaCanAccessRoute } from "@/lib/admin-access";

import { AdminInternalLink } from "./AdminInternalLink";
import { useAdminConsole } from "./admin-console-context";

const PERSONA_LABELS: Record<string, string> = {
  admin: "Администратор",
  moderator: "Модератор",
  support: "Поддержка",
  finance: "Финансы / биллинг",
  none: "Нет доступа",
};

export function AdminRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/admin";
  const { persona } = useAdminConsole();
  const accessId = getRouteAccessIdForPathname(pathname);
  const allowed = personaCanAccessRoute(persona, accessId);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="text-lg font-semibold text-slate-900">Нет доступа к разделу</p>
        <p className="mt-2 text-sm text-slate-700">
          Текущая внутренняя персона: <span className="font-medium">{PERSONA_LABELS[persona] ?? persona}</span>. Раздел требует других полномочий (mock ACL).
        </p>
        <p className="mt-2 text-xs text-slate-600">
          Для демо переключите демо-роль (например «Всё вместе» → полный админ) или добавьте в URL параметр{" "}
          <code className="rounded bg-white px-1 py-0.5">?internalAccess=admin</code> / moderator / support / finance.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <AdminInternalLink href="/admin" className="inline-flex h-10 items-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white">
            На обзор консоли
          </AdminInternalLink>
          <Link href="/" className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700">
            На сайт
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
