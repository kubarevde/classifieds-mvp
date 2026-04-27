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
      inactive: listings.filter((listing) => listing.status === "hidden" || listing.status === "archived")
        .length,
      auctions: listings.filter((listing) => listing.listingSaleMode === "auction").length,
    }),
    [listings],
  );

  const visibleListings = useMemo(
    () =>
      listings.filter((listing) => {
        if (filter === "active") {
          return listing.status === "active";
        }
        if (filter === "inactive") {
          return listing.status === "hidden" || listing.status === "archived";
        }
        if (filter === "auctions") {
          return listing.listingSaleMode === "auction";
        }
        return true;
      }),
    [filter, listings],
  );

  return { counts, visibleListings };
}
