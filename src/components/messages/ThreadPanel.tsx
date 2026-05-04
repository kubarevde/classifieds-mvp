"use client";

import type { ReactNode } from "react";

/**
 * Правая колонка split-view: активный диалог.
 * Родитель передаёт шапку, карточку контекста, ленту и композер как `children`.
 */
export function ThreadPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <article className={`flex min-h-[560px] flex-col overflow-hidden rounded-xl border border-slate-200 ${className}`}>{children}</article>;
}
