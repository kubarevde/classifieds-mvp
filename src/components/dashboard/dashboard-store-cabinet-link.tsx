"use client";

import Link from "next/link";

import { useDemoRole } from "@/components/demo-role/demo-role";
import { cn } from "@/components/ui/cn";
import { buttonVariants } from "@/lib/button-styles";
import { DEFAULT_DEMO_ROLE, resolveDemoStoreNavSellerId } from "@/lib/demo-role-constants";

export function DashboardStoreCabinetLink() {
  const { role, isHydrated } = useDemoRole();
  const effectiveRole = isHydrated ? role : DEFAULT_DEMO_ROLE;
  const storeNavSellerId = resolveDemoStoreNavSellerId(effectiveRole);

  if (!storeNavSellerId) {
    return null;
  }

  return (
    <Link
      href={`/dashboard/store?sellerId=${storeNavSellerId}`}
      className={cn(buttonVariants({ variant: "secondary", size: "md" }), "rounded-xl")}
    >
      Перейти в кабинет магазина
    </Link>
  );
}
