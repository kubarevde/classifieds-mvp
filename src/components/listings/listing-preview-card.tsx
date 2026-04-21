import Link from "next/link";

import { FavoriteButton } from "@/components/favorites/favorite-button";
import { categoryLabels, ListingsView } from "@/lib/listings";
import { Listing } from "@/lib/types";

type ListingPreviewCardProps = {
  listing: Listing;
  view: ListingsView;
};

export function ListingPreviewCard({ listing, view }: ListingPreviewCardProps) {
  if (view === "list") {
    return (
      <Link
        href={`/listings/${listing.id}`}
        className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300 hover:shadow-md"
      >
        <div className={`h-28 w-28 shrink-0 rounded-xl bg-gradient-to-br ${listing.image}`} />
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-lg font-bold tracking-tight text-slate-900">{listing.price}</p>
            <FavoriteButton listingId={listing.id} size="sm" stopPropagation />
          </div>
          <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900 group-hover:text-slate-700">
            {listing.title}
          </h3>
          <p className="line-clamp-1 text-xs text-slate-600">{listing.condition}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{categoryLabels[listing.category]}</span>
            <span>•</span>
            <span>{listing.location}</span>
            <span>•</span>
            <span>{listing.publishedAt}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
    >
      <div className={`relative h-44 bg-gradient-to-br ${listing.image} p-4`}>
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
            {categoryLabels[listing.category]}
          </span>
          <FavoriteButton listingId={listing.id} stopPropagation />
        </div>
      </div>
      <div className="space-y-2.5 p-4">
        <p className="text-xl font-bold tracking-tight text-slate-900">{listing.price}</p>
        <h3 className="line-clamp-2 min-h-[3rem] text-base font-semibold leading-6 text-slate-900 transition group-hover:text-slate-700">
          {listing.title}
        </h3>
        <p className="line-clamp-1 text-sm text-slate-600">{listing.condition}</p>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{listing.location}</span>
          <span>{listing.publishedAt}</span>
        </div>
      </div>
    </Link>
  );
}
