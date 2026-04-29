import { FavoriteButton } from "@/components/favorites/favorite-button";
import { ReportAbuseButton } from "@/components/safety/ReportAbuseButton";
import { Clock3, MapPin } from "lucide-react";
import { categoryLabels, formatPostedAt } from "@/lib/listings";
import { Listing } from "@/lib/types";
import { detectListingRisk } from "@/services/risk";
import { RiskWarningBanner } from "@/components/risk/RiskWarningBanner";
import { TransactionSafetyChecklist } from "@/components/risk/TransactionSafetyChecklist";
import { SafetyHintCard } from "@/components/risk/SafetyHintCard";

type ListingDetailsProps = {
  listing: Listing;
  sellerId?: string | null;
  sellerMemberSinceYear?: number;
};

export function ListingDetails({ listing, sellerId, sellerMemberSinceYear }: ListingDetailsProps) {
  const riskSignals = detectListingRisk(
    {
      id: listing.id,
      title: listing.title,
      priceValue: listing.priceValue,
      category: listing.category,
    },
    sellerId ? { id: sellerId, memberSinceYear: sellerMemberSinceYear } : null,
  );
  const primaryRisk = riskSignals.find((s) => s.level === "high" || s.level === "medium") ?? null;
  const needsVerificationCta =
    primaryRisk?.type === "unverified_store" || primaryRisk?.type === "new_seller_high_value_item";

  return (
    <article className="rounded-2xl border border-slate-200/90 bg-white shadow-none">
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
              className="min-h-11 w-auto rounded-xl px-3"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{listing.title}</h1>
          <p className="text-3xl font-bold text-slate-900">{listing.price}</p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4" strokeWidth={1.5} /> {listing.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-4 w-4" strokeWidth={1.5} /> {formatPostedAt(listing.postedAtIso)}
          </span>
          <span>• {listing.condition}</span>
        </div>

        <section>
          <h2 className="text-base font-semibold text-slate-900">Описание</h2>
          <p className="mt-2 leading-7 text-slate-700">{listing.description}</p>
        </section>

        {primaryRisk ? (
          <RiskWarningBanner
            signal={primaryRisk}
            ctaHref="/safety"
            ctaLabel="Рекомендации по безопасности"
          />
        ) : null}
        {needsVerificationCta ? (
          <SafetyHintCard
            title="Для этой категории полезно подтверждение профиля"
            description="Подтверждённый профиль продавца добавляет прозрачности и помогает снизить риск недопонимания."
            href={sellerId ? "/verification/business" : "/verification/identity"}
            ctaLabel="Пройти подтверждение"
          />
        ) : null}
        <TransactionSafetyChecklist variant="full" />

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
          <ReportAbuseButton
            targetType="listing"
            targetId={listing.id}
            targetLabel={listing.title}
            variant="outline"
            className="text-sm"
          />
        </div>
      </div>
    </article>
  );
}
