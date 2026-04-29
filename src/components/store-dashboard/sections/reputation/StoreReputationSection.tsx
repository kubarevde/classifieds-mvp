"use client";

import { ReviewsList, TrustSummaryFromTarget } from "@/components/trust";

type StoreReputationSectionProps = {
  sellerId: string;
  storefrontHref?: string;
};

export function StoreReputationSection({ sellerId, storefrontHref }: StoreReputationSectionProps) {
  return (
    <section id="dashboard-store-reputation" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Репутация</h2>
        <p className="text-sm text-slate-600">Единая trust-модель: Verified, Trust Score, рейтинг и response rate.</p>
        {storefrontHref ? (
          <a href={storefrontHref} className="inline-flex text-xs font-semibold text-slate-700 underline underline-offset-2 hover:text-slate-900">
            Смотреть отзывы на витрине магазина
          </a>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-3">
          <TrustSummaryFromTarget targetId={sellerId} variant="full" />
        </div>
        <ReviewsList targetId={sellerId} hideWriteReview />
      </div>
    </section>
  );
}
