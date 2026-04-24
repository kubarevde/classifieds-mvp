"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useDemoRole } from "@/components/demo-role/demo-role";
import { resolveDemoStoreNavSellerId } from "@/lib/demo-role-constants";

export default function NotificationsPage() {
  const router = useRouter();
  const { role, isHydrated } = useDemoRole();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    if (role === "seller") {
      const sellerId = resolveDemoStoreNavSellerId(role);
      if (sellerId) {
        router.replace(`/dashboard/store?sellerId=${sellerId}&section=notifications`);
        return;
      }
    }
    if (role === "guest") {
      router.replace("/");
      return;
    }
    router.replace("/dashboard?tab=notifications");
  }, [isHydrated, role, router]);

  return null;
}

