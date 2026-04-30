import { Suspense, type ReactNode } from "react";

export default function AdminListingsLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="p-6 text-sm text-slate-500">Загрузка…</div>}>{children}</Suspense>;
}
