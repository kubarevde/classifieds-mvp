import Link from "next/link";

import { FavoriteButton } from "@/components/favorites/favorite-button";
import { getListingBadges, ListingsView, UnifiedCatalogListing } from "@/lib/listings";
import { getListingMarketingBadgeData } from "@/lib/sellers";

type ListingPreviewCardProps = {
  listing: UnifiedCatalogListing;
  view: ListingsView;
};

export function ListingPreviewCard({ listing, view }: ListingPreviewCardProps) {
  const categoryLabel = listing.categoryLabel;
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

  if (view === "list") {
    if (listing.detailsHref) {
      return (
        <Link
          href={listing.detailsHref}
          className={`group flex gap-4 rounded-2xl border p-3 shadow-sm transition hover:border-slate-300 hover:shadow-md ${cardToneClass}`}
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
              <span>{categoryLabel}</span>
              <span>•</span>
              <span>{listing.location}</span>
              <span>•</span>
              <span>{listing.publishedAt}</span>
            </div>
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
          </div>
        </Link>
      );
    }

    return (
      <article className={`group flex gap-4 rounded-2xl border p-3 shadow-sm transition hover:border-slate-300 hover:shadow-md ${cardToneClass}`}>
        <div className={`h-28 w-28 shrink-0 rounded-xl bg-gradient-to-br ${listing.image}`} />
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-lg font-bold tracking-tight text-slate-900">{listing.price}</p>
            <FavoriteButton listingId={listing.id} size="sm" />
          </div>
          <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">{listing.title}</h3>
          <p className="line-clamp-1 text-xs text-slate-600">{listing.condition}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{categoryLabel}</span>
            <span>•</span>
            <span>{listing.location}</span>
            <span>•</span>
            <span>{listing.publishedAt}</span>
          </div>
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
        </div>
      </article>
    );
  }

  if (listing.detailsHref) {
    return (
      <Link
        href={listing.detailsHref}
        className={`group overflow-hidden rounded-2xl border shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg ${cardToneClass}`}
      >
        <div className={`relative h-44 bg-gradient-to-br ${listing.image} p-4`}>
          <div className="flex items-start justify-between gap-2">
            <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
              {categoryLabel}
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
        </div>
      </Link>
    );
  }

  return (
    <article className={`group overflow-hidden rounded-2xl border shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg ${cardToneClass}`}>
      <div className={`relative h-44 bg-gradient-to-br ${listing.image} p-4`}>
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
            {categoryLabel}
          </span>
          <FavoriteButton listingId={listing.id} />
        </div>
      </div>
      <div className="space-y-2.5 p-4">
        <p className="text-xl font-bold tracking-tight text-slate-900">{listing.price}</p>
        <h3 className="line-clamp-2 min-h-[3rem] text-base font-semibold leading-6 text-slate-900">{listing.title}</h3>
        <p className="line-clamp-1 text-sm text-slate-600">{listing.condition}</p>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{listing.location}</span>
          <span>{listing.publishedAt}</span>
        </div>
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
      </div>
    </article>
  );
}
