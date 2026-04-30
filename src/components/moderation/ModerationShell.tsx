"use client";

import type { ReactNode } from "react";

import { AdminAccessGate } from "@/components/admin/AdminAccessGate";
import { ModerationSubNav } from "@/components/admin/ModerationSubNav";

/** Вложен в общий `AdminConsoleLayout`: без публичного navbar/footer. */
export function ModerationShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <ModerationSubNav />
      <AdminAccessGate>{children}</AdminAccessGate>
    </div>
  );
}

