"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useDemoRole } from "@/components/demo-role/demo-role";
import { canAccessModerationConsole } from "@/services/moderation";

export function AdminAccessGate({ children }: { children: ReactNode }) {
  const { role, isHydrated, setRole } = useDemoRole();

  if (!isHydrated) {
    return <div className="p-6 text-sm text-slate-500">Проверяем внутренний доступ…</div>;
  }

  if (canAccessModerationConsole({ role })) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
      <p className="text-lg font-semibold text-slate-900">Нет доступа к internal console</p>
      <p className="mt-1 text-sm text-slate-600">
        Раздел доступен только moderator/admin (в демо используйте роль `all`).
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setRole("all")}
          className="inline-flex h-10 items-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white"
        >
          Переключиться в all
        </button>
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}

