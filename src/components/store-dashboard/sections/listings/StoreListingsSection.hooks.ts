import { useMemo } from "react";

import type { ListingFilter } from "@/components/store-dashboard/store-dashboard-shared";
import type { SellerDashboardListing } from "@/lib/sellers";

type UseStoreListingsSectionParams = {
  listings: SellerDashboardListing[];
  filter: ListingFilter;
};

export function useStoreListingsSectionData({ listings, filter }: UseStoreListingsSectionParams) {
  const counts = useMemo(
    () => ({
      all: listings.length,
      active: listings.filter((listing) => listing.status === "active").length,
      paused: listings.filter((listing) => listing.status === "hidden").length,
      sold: listings.filter((listing) => listing.status === "archived").length,
    }),
    [listings],
  );

  const visibleListings = useMemo(
    () =>
      listings.filter((listing) => {
        if (filter === "active") {
          return listing.status === "active";
        }
        if (filter === "paused") {
          return listing.status === "hidden";
        }
        if (filter === "sold") {
          return listing.status === "archived";
        }
        return true;
      }),
    [filter, listings],
  );

  return { counts, visibleListings };
}
