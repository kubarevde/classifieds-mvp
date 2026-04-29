"use client";

import type { ReactNode } from "react";

export function AdminFiltersBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky top-2 z-20 rounded-xl border border-slate-200 bg-white p-3">
      {children}
    </div>
  );
}

