import Link from "next/link";

import { FavoriteButton } from "@/components/favorites/favorite-button";
import { categoryLabels } from "@/lib/listings";
import { Listing } from "@/lib/types";

type FavoritesGridProps = {
  listings: Listing[];
  getSavedAtLabel: (listingId: string) => string;
};

export function FavoritesGrid({ listings, getSavedAtLabel }: FavoritesGridProps) {
  return (
    <div className="space-y-3">
      {listings.map((listing) => (
        <article
          key={listing.id}
          className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex gap-3 sm:gap-4">
            <Link href={`/listings/${listing.id}`} className={`h-24 w-24 shrink-0 rounded-xl bg-gradient-to-br ${listing.image}`} />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-lg font-bold tracking-tight text-slate-900">{listing.price}</p>
                <FavoriteButton listingId={listing.id} size="sm" />
              </div>
              <Link
                href={`/listings/${listing.id}`}
                className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900 hover:text-slate-700"
              >
                {listing.title}
              </Link>
              <p className="line-clamp-1 text-xs text-slate-600">{listing.condition}</p>
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500">
                <span>{categoryLabels[listing.category]}</span>
                <span>•</span>
                <span>{listing.location}</span>
                <span>•</span>
                <span>{getSavedAtLabel(listing.id)}</span>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
