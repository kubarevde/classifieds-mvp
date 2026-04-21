import Link from "next/link";

import { FavoriteButton } from "@/components/favorites/favorite-button";
import { getListingBadges, UnifiedCatalogListing } from "@/lib/listings";

type ListingCardProps = {
  listing: UnifiedCatalogListing;
};

export function ListingCard({ listing }: ListingCardProps) {
  const Wrapper = listing.detailsHref ? Link : "article";
  const wrapperProps = listing.detailsHref ? { href: listing.detailsHref } : {};
  const badges = getListingBadges(listing);
  const badgeToneClass = (tone: "agriculture" | "electronics") =>
    tone === "agriculture"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-slate-300 bg-[linear-gradient(to_bottom,#ffffff,#eef3fa)] text-slate-700 shadow-sm";

  return (
    <Wrapper
      {...wrapperProps}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
    >
      <div
        className={`relative h-44 bg-gradient-to-br ${listing.image} p-4`}
        aria-label={`${listing.title} cover`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(15,23,42,0.28),transparent_55%)]" />
        <div className="relative flex items-start justify-between">
          <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
            {listing.categoryLabel}
          </span>
          <FavoriteButton listingId={listing.id} size="sm" />
        </div>
        <p className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white">
          Фото
        </p>
      </div>

      <div className="space-y-2.5 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="line-clamp-1 text-xs font-medium text-slate-500">{listing.worldLabel}</span>
        </div>
        <p className="text-xl font-bold tracking-tight text-slate-900">{listing.price}</p>
        <h3 className="line-clamp-2 min-h-[3rem] text-base font-semibold leading-6 text-slate-900 transition group-hover:text-slate-700">
          {listing.title}
        </h3>
        <p className="line-clamp-1 text-sm text-slate-600">{listing.condition}</p>
        {badges.length ? (
          <div className="flex flex-wrap gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge.id}
                className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${badgeToneClass(badge.tone)}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">📍 {listing.location}</span>
          <span>{listing.publishedAt}</span>
        </div>
      </div>
    </Wrapper>
  );
}
