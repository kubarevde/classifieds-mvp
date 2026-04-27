import { useMemo } from "react";

import type { StoreSubscriptionTierId } from "@/components/store-dashboard/store-dashboard-shared";
import type { SellerPlanTier, SellerStorefront } from "@/lib/sellers";

export function useStoreMarketingSectionData(
  seller: SellerStorefront,
  currentSubscriptionTier: StoreSubscriptionTierId,
) {
  const effectiveSeller = useMemo(
    () =>
      ({
        ...seller,
        planTier: (currentSubscriptionTier === "basic" ? "free" : currentSubscriptionTier) as SellerPlanTier,
      }) satisfies SellerStorefront,
    [currentSubscriptionTier, seller],
  );

  return { effectiveSeller };
}
