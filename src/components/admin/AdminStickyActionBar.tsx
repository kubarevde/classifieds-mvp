"use client";

import type { ReactNode } from "react";

export function AdminStickyActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky top-2 z-30 rounded-xl border border-slate-200 bg-white p-3">
      {children}
    </div>
  );
}

