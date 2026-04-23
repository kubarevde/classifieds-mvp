import Link from "next/link";
import { MapPin } from "lucide-react";

import { FavoriteButton } from "@/components/favorites/favorite-button";
import { getListingBadges, UnifiedCatalogListing } from "@/lib/listings";
import { getListingMarketingBadgeData } from "@/lib/sellers";

type ListingCardProps = {
  listing: UnifiedCatalogListing;
};

export function ListingCard({ listing }: ListingCardProps) {
  const badges = getListingBadges(listing);
  const marketing = getListingMarketingBadgeData(listing.id);
  const promotionBadges = [
    marketing.coupon
      ? `Купон ${marketing.coupon.discountType === "percent" ? `${marketing.coupon.discountValue}%` : `${marketing.coupon.discountValue} ₽`}`
      : null,
    marketing.isSuper ? "Суперобъявление" : null,
    marketing.isSponsored ? "Продвижение" : null,
  ].filter((badge): badge is string => Boolean(badge));
  const badgeToneClass = (tone: "agriculture" | "electronics") =>
    tone === "agriculture"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-slate-300 bg-[linear-gradient(to_bottom,#ffffff,#eef3fa)] text-slate-700 shadow-sm";
  const cardToneClass = marketing.isSuper
    ? "border-amber-300 bg-[linear-gradient(to_bottom,#ffffff,#fff9eb)] shadow-[0_6px_16px_rgba(245,158,11,0.18)]"
    : "border-slate-200 bg-white";

  const content = (
    <>
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
        {promotionBadges.length ? (
          <div className="flex flex-wrap gap-1.5">
            {promotionBadges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700"
              >
                {badge}
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} /> {listing.location}
          </span>
          <span>{listing.publishedAt}</span>
        </div>
      </div>
    </>
  );

  if (listing.detailsHref) {
    return (
      <Link
        href={listing.detailsHref}
        className={`group overflow-hidden rounded-2xl border shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg ${cardToneClass}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <article className={`group overflow-hidden rounded-2xl border shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg ${cardToneClass}`}>
      {content}
    </article>
  );
}
