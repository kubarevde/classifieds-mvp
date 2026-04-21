import { FavoriteButton } from "@/components/favorites/favorite-button";
import { categoryLabels, formatPostedAt } from "@/lib/listings";
import { Listing } from "@/lib/types";

type ListingDetailsProps = {
  listing: Listing;
};

export function ListingDetails({ listing }: ListingDetailsProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className={`h-64 w-full rounded-t-2xl bg-gradient-to-br sm:h-80 ${listing.image}`} />
      <div className="space-y-4 p-4 sm:p-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {categoryLabels[listing.category]}
            </span>
            <FavoriteButton
              listingId={listing.id}
              showLabel
              className="h-10 w-auto rounded-xl px-3"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{listing.title}</h1>
          <p className="text-3xl font-bold text-slate-900">{listing.price}</p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
          <span>📍 {listing.location}</span>
          <span>🕒 {formatPostedAt(listing.postedAtIso)}</span>
          <span>• {listing.condition}</span>
        </div>

        <section>
          <h2 className="text-base font-semibold text-slate-900">Описание</h2>
          <p className="mt-2 leading-7 text-slate-700">{listing.description}</p>
        </section>
      </div>
    </article>
  );
}
