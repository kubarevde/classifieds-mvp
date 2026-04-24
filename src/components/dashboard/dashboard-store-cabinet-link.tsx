"use client";

import Link from "next/link";

import { useDemoRole } from "@/components/demo-role/demo-role";
import { resolveDemoStoreNavSellerId } from "@/lib/demo-role-constants";

export function DashboardStoreCabinetLink() {
  const { role, isHydrated } = useDemoRole();
  const effectiveRole = isHydrated ? role : "all";
  const storeNavSellerId = resolveDemoStoreNavSellerId(effectiveRole);

  if (!storeNavSellerId) {
    return null;
  }

  return (
    <Link
      href={`/dashboard/store?sellerId=${storeNavSellerId}`}
      className="inline-flex rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      Перейти в кабинет магазина
    </Link>
  );
}
