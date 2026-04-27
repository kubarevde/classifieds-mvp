import { Search } from "lucide-react";

import { AuctionCard } from "@/components/auctions/AuctionCard";
import type { AuctionState } from "@/entities/auction/model";
import { EmptyState } from "@/components/platform";
import { ListingPreviewCard } from "@/components/listings/listing-preview-card";
import { ListingsView, UnifiedCatalogListing } from "@/lib/listings";

type ListingsGridProps = {
  listings: UnifiedCatalogListing[];
  auctionsByListingId?: Record<string, AuctionState>;
  view: ListingsView;
  emptyStateClassName?: string;
  emptyMessage?: string;
  emptyTitle?: string;
};

export function ListingsGrid({
  listings,
  auctionsByListingId = {},
  view,
  emptyStateClassName = "",
  emptyMessage = "Попробуйте изменить фильтры или поисковый запрос.",
  emptyTitle = "Ничего не найдено",
}: ListingsGridProps) {
  if (listings.length === 0) {
    return (
      <EmptyState
        className={emptyStateClassName}
        icon={<Search className="h-6 w-6" strokeWidth={1.5} />}
        title={emptyTitle}
        description={emptyMessage}
      />
    );
  }

  return (
    <div className={view === "grid" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
      {listings.map((listing) => {
        const auction = listing.listingSaleMode === "auction" ? auctionsByListingId[listing.id] ?? null : null;
        if (auction) {
          return <AuctionCard key={listing.id} listing={listing} auction={auction} view={view} />;
        }
        return <ListingPreviewCard key={listing.id} listing={listing} view={view} />;
      })}
    </div>
  );
}
