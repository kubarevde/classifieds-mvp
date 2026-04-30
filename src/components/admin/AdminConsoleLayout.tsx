"use client";

import { Suspense, type ReactNode } from "react";

import { AdminCommandPalette } from "./AdminCommandPalette";
import { AdminConsoleProvider, useAdminConsole } from "./admin-console-context";
import { AdminRouteGuard } from "./AdminRouteGuard";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";

function AdminConsoleInner({ children }: { children: ReactNode }) {
  const { commandPaletteOpen } = useAdminConsole();
  return (
    <div className="flex min-h-[calc(100vh-0px)] bg-slate-100/90">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar />
        <main className="flex-1 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
          <AdminRouteGuard>{children}</AdminRouteGuard>
        </main>
      </div>
      {commandPaletteOpen ? <AdminCommandPalette /> : null}
    </div>
  );
}

export function AdminConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Загрузка консоли…</div>}>
      <AdminConsoleProvider>
        <AdminConsoleInner>{children}</AdminConsoleInner>
      </AdminConsoleProvider>
    </Suspense>
  );
}
