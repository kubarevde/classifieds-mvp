"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useDemoRole } from "@/components/demo-role/demo-role";
import { resolveDemoStoreNavSellerId } from "@/lib/demo-role-constants";

export default function MessagesPage() {
  const router = useRouter();
  const { role, isHydrated } = useDemoRole();
  const didRedirectRef = useRef(false);

  useEffect(() => {
    if (!isHydrated || didRedirectRef.current) {
      return;
    }
    const id = window.setTimeout(() => {
      didRedirectRef.current = true;
      if (role === "seller") {
        const sellerId = resolveDemoStoreNavSellerId(role);
        if (sellerId) {
          router.replace(`/dashboard/store?sellerId=${sellerId}&section=messages`);
          return;
        }
      }
      if (role === "guest") {
        router.replace("/");
        return;
      }

      const next = new URLSearchParams({ tab: "messages" });
      const params = new URLSearchParams(window.location.search);
      ["conversationId", "listingId", "sellerName", "listingTitle"].forEach((key) => {
        const value = params.get(key);
        if (value) {
          next.set(key, value);
        }
      });
      router.replace(`/dashboard?${next.toString()}`);
    }, 0);
    return () => window.clearTimeout(id);
  }, [isHydrated, role, router]);

  return null;
}
