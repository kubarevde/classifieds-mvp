"use client";

import { ListingPreviewCard } from "@/components/listings/listing-preview-card";
import type { MarketingCampaign, StorefrontListing } from "@/lib/sellers";

type StorefrontFeaturedSectionProps = {
  pinnedListings: StorefrontListing[];
  campaigns: MarketingCampaign[];
};

/**
 * Закреплённые и продвигаемые объявления + статусы кампаний — выше общего каталога.
 * Секция не рендерится, если нет ни объявлений, ни кампаний.
 */
export function StorefrontFeaturedSection({ pinnedListings, campaigns }: StorefrontFeaturedSectionProps) {
  if (!pinnedListings.length && !campaigns.length) {
    return null;
  }

  return (
    <section
      id="store-featured-offers"
      className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5"
    >
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Лучшие предложения магазина</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Закреплённые и продвигаемые позиции — смотрите в первую очередь, затем переходите к полному каталогу.
        </p>
      </div>

      {pinnedListings.length ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Выделенные объявления</p>
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 pt-0.5 [scrollbar-width:thin]">
            {pinnedListings.map((listing) => (
              <div key={listing.id} className="w-[min(100%,17rem)] shrink-0">
                <ListingPreviewCard listing={listing} view="grid" />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {campaigns.length ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Кампании продвижения</p>
          <ul className="flex flex-wrap gap-2">
            {campaigns.map((campaign) => (
              <li
                key={campaign.id}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                  campaign.status === "active"
                    ? "border-emerald-200/80 bg-emerald-50/90 text-emerald-900"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                <span className="max-w-[220px] truncate">{campaign.name}</span>
                <span className="tabular-nums text-[10px] uppercase tracking-wide text-slate-500">
                  {campaign.status === "active" ? "идёт" : "пауза"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
