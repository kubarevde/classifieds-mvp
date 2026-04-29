import Link from "next/link";

import { FavoriteButton } from "@/components/favorites/favorite-button";
import { TrustSummary } from "@/components/trust";
import { VerificationBadgeForListing } from "@/components/verification/VerificationBadgeForListing";
import { RiskIndicator } from "@/components/risk/RiskIndicator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import { getListingBadges, ListingsView, UnifiedCatalogListing } from "@/lib/listings";
import { getListingMarketingBadgeData, getStorefrontSellerByListingId } from "@/lib/sellers";
import { detectListingRisk } from "@/services/risk";

type ListingPreviewCardProps = {
  listing: UnifiedCatalogListing;
  view: ListingsView;
};

export function ListingPreviewCard({ listing, view }: ListingPreviewCardProps) {
  const categoryLabel = listing.categoryLabel;
  const badges = getListingBadges(listing);
  const marketing = getListingMarketingBadgeData(listing.id);
  const seller = getStorefrontSellerByListingId(listing.id);
  const sellerReviewsCount = seller ? Math.max(8, Math.round(seller.followersCount * 0.16)) : null;
  const sellerVerified = seller ? seller.trustBadges.some((badge) => badge.id === "verified") : false;
  const highRiskSignal = detectListingRisk(
    {
      id: listing.id,
      title: listing.title,
      priceValue: listing.priceValue,
      categoryId: listing.categoryId,
    },
    seller ? { id: seller.id, memberSinceYear: seller.memberSinceYear } : null,
  ).find((s) => s.level === "high");
  const promotionBadges = [
    marketing.coupon
      ? `Купон ${marketing.coupon.discountType === "percent" ? `${marketing.coupon.discountValue}%` : `${marketing.coupon.discountValue} ₽`}`
      : null,
    marketing.isSuper ? "Суперобъявление" : null,
    marketing.isSponsored ? "Продвижение" : null,
  ].filter((badge): badge is string => Boolean(badge));
  const catalogBadgeClass = (tone: "agriculture" | "electronics") =>
    tone === "agriculture"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-slate-200/90 bg-slate-50 text-slate-700";
  const cardToneClass = marketing.isSuper
    ? "border-amber-200/90 bg-amber-50/40"
    : "border-slate-200/90 bg-white";

  if (view === "list") {
    if (listing.detailsHref) {
      return (
        <Link
          href={listing.detailsHref}
          className={`group flex gap-4 rounded-2xl border p-3 shadow-none transition hover:border-slate-300 hover:shadow-md ${cardToneClass}`}
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
              {highRiskSignal ? <RiskIndicator level="high" /> : null}
              {seller ? (
                <>
                  <TrustSummary
                    variant="compact"
                    verified={sellerVerified}
                    rating={seller.metrics.rating}
                    reviewsCount={sellerReviewsCount}
                  />
                  <VerificationBadgeForListing storeId={seller.id} />
                </>
              ) : null}
            </div>
            {badges.length ? (
              <div className="flex flex-wrap gap-1.5">
                {badges.map((badge) => (
                  <Badge
                    key={badge.id}
                    variant="outline"
                    size="sm"
                    className={cn("font-medium", catalogBadgeClass(badge.tone))}
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>
            ) : null}
            {promotionBadges.length ? (
              <div className="flex flex-wrap gap-1.5">
                {promotionBadges.map((badge) => (
                  <Badge key={badge} variant="outline" size="sm" className="font-medium text-slate-700">
                    {badge}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </Link>
      );
    }

    return (
      <article className={`group flex gap-4 rounded-2xl border p-3 shadow-none transition hover:border-slate-300 hover:shadow-md ${cardToneClass}`}>
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
            {highRiskSignal ? <RiskIndicator level="high" /> : null}
            {seller ? (
              <>
                <TrustSummary
                  variant="compact"
                  verified={sellerVerified}
                  rating={seller.metrics.rating}
                  reviewsCount={sellerReviewsCount}
                />
                <VerificationBadgeForListing storeId={seller.id} />
              </>
            ) : null}
          </div>
          {badges.length ? (
            <div className="flex flex-wrap gap-1.5">
              {badges.map((badge) => (
                <Badge
                  key={badge.id}
                  variant="outline"
                  size="sm"
                  className={cn("font-medium", catalogBadgeClass(badge.tone))}
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          ) : null}
          {promotionBadges.length ? (
            <div className="flex flex-wrap gap-1.5">
              {promotionBadges.map((badge) => (
                <Badge key={badge} variant="outline" size="sm" className="font-medium text-slate-700">
                  {badge}
                </Badge>
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
        className={`group flex h-full flex-col overflow-hidden rounded-2xl border shadow-none transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ${cardToneClass}`}
      >
        <div className={`relative h-44 bg-gradient-to-br ${listing.image} p-4`}>
          <div className="flex items-start justify-between gap-2">
            <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
              {categoryLabel}
            </span>
            <FavoriteButton listingId={listing.id} stopPropagation />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2.5 p-4">
          <p className="text-xl font-bold tracking-tight text-slate-900">{listing.price}</p>
          <h3 className="line-clamp-2 min-h-[3rem] text-base font-semibold leading-6 text-slate-900 transition group-hover:text-slate-700">
            {listing.title}
          </h3>
          <p className="line-clamp-1 min-h-5 text-sm text-slate-600">{listing.condition}</p>
          <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
            <span>{listing.location}</span>
            <span>{listing.publishedAt}</span>
            {highRiskSignal ? <RiskIndicator level="high" /> : null}
          </div>
          {seller ? (
            <>
              <TrustSummary
                variant="compact"
                verified={sellerVerified}
                rating={seller.metrics.rating}
                reviewsCount={sellerReviewsCount}
              />
              <VerificationBadgeForListing storeId={seller.id} />
            </>
          ) : null}
          {badges.length ? (
            <div className="flex flex-wrap gap-1.5">
              {badges.map((badge) => (
                <Badge
                  key={badge.id}
                  variant="outline"
                  size="sm"
                  className={cn("font-medium", catalogBadgeClass(badge.tone))}
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          ) : null}
          {promotionBadges.length ? (
            <div className="flex flex-wrap gap-1.5">
              {promotionBadges.map((badge) => (
                <Badge key={badge} variant="outline" size="sm" className="font-medium text-slate-700">
                  {badge}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </Link>
    );
  }

  return (
    <article className={`group flex h-full flex-col overflow-hidden rounded-2xl border shadow-none transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ${cardToneClass}`}>
      <div className={`relative h-44 bg-gradient-to-br ${listing.image} p-4`}>
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
            {categoryLabel}
          </span>
          <FavoriteButton listingId={listing.id} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <p className="text-xl font-bold tracking-tight text-slate-900">{listing.price}</p>
        <h3 className="line-clamp-2 min-h-[3rem] text-base font-semibold leading-6 text-slate-900">{listing.title}</h3>
        <p className="line-clamp-1 min-h-5 text-sm text-slate-600">{listing.condition}</p>
        <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
          <span>{listing.location}</span>
          <span>{listing.publishedAt}</span>
          {highRiskSignal ? <RiskIndicator level="high" /> : null}
        </div>
        {seller ? (
          <>
            <TrustSummary
              variant="compact"
              verified={sellerVerified}
              rating={seller.metrics.rating}
              reviewsCount={sellerReviewsCount}
            />
            <VerificationBadgeForListing storeId={seller.id} />
          </>
        ) : null}
        {badges.length ? (
          <div className="flex flex-wrap gap-1.5">
            {badges.map((badge) => (
              <Badge
                key={badge.id}
                variant="outline"
                size="sm"
                className={cn("font-medium", catalogBadgeClass(badge.tone))}
              >
                {badge.label}
              </Badge>
            ))}
          </div>
        ) : null}
        {promotionBadges.length ? (
          <div className="flex flex-wrap gap-1.5">
            {promotionBadges.map((badge) => (
              <Badge key={badge} variant="outline" size="sm" className="font-medium text-slate-700">
                {badge}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
