import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AuctionStatusBadge } from "@/components/auctions/AuctionStatusBadge";
import { CountdownTimer } from "@/components/auctions/CountdownTimer";
import type { AuctionState } from "@/entities/auction/model";
import {
  formatDate,
  listingFilterLabels,
  listingStatusLabels,
  toCreateListingWorld,
  worldLabels,
  type ListingFilter,
} from "@/components/store-dashboard/store-dashboard-shared";
import { mockAuctionService } from "@/services/auctions";
import { getAppealableActions, getUserEnforcementActions } from "@/services/enforcement";
import { useStoreListingsSectionData } from "@/components/store-dashboard/sections/listings/StoreListingsSection.hooks";
import { InlineNotice } from "@/components/platform";
import type { SellerDashboardListing, SellerStorefront } from "@/lib/sellers";

type StoreListingsSectionProps = {
  seller: SellerStorefront;
  listings: SellerDashboardListing[];
  filter: ListingFilter;
  onFilterChange: (next: ListingFilter) => void;
  getSectionClassName: (baseClassName: string, sectionId: string) => string;
  onToggleListingVisibility: (listingId: string) => void;
  /** Лимит активных объявлений по политике тарифа (демо, из feature gate). */
  listingSoftLimit?: number;
};

export function StoreListingsSection({
  seller,
  listings,
  filter,
  onFilterChange,
  getSectionClassName,
  onToggleListingVisibility,
  listingSoftLimit,
}: StoreListingsSectionProps) {
  const { counts, visibleListings } = useStoreListingsSectionData({ listings, filter });
  const [auctionsByListingId, setAuctionsByListingId] = useState<Record<string, AuctionState>>({});

  const sellerEnforcementActions = useMemo(() => getUserEnforcementActions(seller.id), [seller.id]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const auctions = await mockAuctionService.getAll();
      if (cancelled) {
        return;
      }
      setAuctionsByListingId(
        auctions.reduce<Record<string, AuctionState>>((acc, auction) => {
          acc[auction.listingId] = auction;
          return acc;
        }, {}),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sellerAuctions = listings
    .filter((listing) => listing.listingSaleMode === "auction")
    .map((listing) => ({
      listing,
      auction: auctionsByListingId[listing.id] ?? null,
    }))
    .filter((item): item is { listing: SellerDashboardListing; auction: AuctionState } => item.auction != null);

  return (
    <section
      id="dashboard-store-listings"
      className={getSectionClassName(
        "space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5",
        "dashboard-store-listings",
      )}
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Мои объявления</h2>
        <p className="text-sm text-slate-600">
          Здесь вы управляете статусом, видимостью и выделением своих объявлений.
        </p>
        {listingSoftLimit != null && listingSoftLimit > 0 ? (
          <p className="text-xs text-slate-500">Лимит по тарифу (демо): до {listingSoftLimit} активных карточек.</p>
        ) : null}
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {(Object.keys(listingFilterLabels) as ListingFilter[]).map((filterItem) => (
          <button
            key={filterItem}
            type="button"
            onClick={() => onFilterChange(filterItem)}
            className={`min-h-11 shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              filter === filterItem
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {listingFilterLabels[filterItem]} · {counts[filterItem]}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {visibleListings.map((listing) => (
          <article key={listing.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
            <div className="min-w-0 space-y-1">
              <p className="truncate text-sm font-semibold text-slate-900">{listing.title}</p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5">
                  {worldLabels[listing.world]}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 ${
                    listing.status === "active"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {listingStatusLabels[listing.status]}
                </span>
                <span>Создано: {formatDate(listing.createdAtIso)}</span>
                <span>Обновлено: {formatDate(listing.updatedAtIso)}</span>
              </div>

              {listing.status !== "active" ? (
                (() => {
                  const related = sellerEnforcementActions.find((a) => a.targetType === "listing" && a.targetId === listing.id) ?? null;
                  if (!related) return null;

                  const appealAllowed = getAppealableActions({
                    userId: seller.id,
                    enforcementActionId: related.id,
                  }).length > 0;

                  return (
                    <div className="mt-3">
                      <InlineNotice
                        type="info"
                        title="Решение модерации по объявлению"
                        description={related.reasonTitle}
                      />
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Link
                          href={`/enforcement/actions/${related.id}`}
                          className="inline-flex h-9 items-center rounded-lg bg-white px-3 text-sm font-semibold text-slate-700 underline underline-offset-2 transition hover:bg-slate-50"
                        >
                          Подробнее
                        </Link>
                        {appealAllowed ? (
                          <Link
                            href={`/enforcement/appeals/new?enforcementActionId=${encodeURIComponent(related.id)}`}
                            className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                          >
                            Подать обращение на пересмотр
                          </Link>
                        ) : null}
                        {related.actionType === "verification_required" ? (
                          <Link
                            href="/verification/business"
                            className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Пройти подтверждение
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  );
                })()
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 md:w-40 md:grid-cols-1">
              <p className="rounded-lg border border-slate-200 bg-white px-2 py-1">Просмотры: {listing.views}</p>
              <p className="rounded-lg border border-slate-200 bg-white px-2 py-1">Отклики: {listing.messages}</p>
            </div>

            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:w-[360px] md:grid-cols-2 md:justify-items-stretch">
              <Link
                href={`/listings/${listing.id}?returnTo=${encodeURIComponent(`/dashboard/store?sellerId=${seller.id}`)}`}
                className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:text-xs"
              >
                Открыть
              </Link>
              <Link
                href={`/create-listing?world=${toCreateListingWorld(listing.world)}&sellerId=${seller.id}&edit=${listing.id}`}
                className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:text-xs"
              >
                Редактировать
              </Link>
              <button
                type="button"
                onClick={() => onToggleListingVisibility(listing.id)}
                className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:text-xs"
              >
                {listing.status === "active" ? "Скрыть" : "Показать"}
              </button>
              <Link
                href={`/dashboard/store?sellerId=${seller.id}&marketing=boosts`}
                className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-700 md:text-xs"
              >
                Поднять
              </Link>
              <span className="text-xs text-slate-500 sm:col-span-2 md:col-span-2">
                Продвижение настраивается в маркетинге (раздел «Поднятие / Супер»).
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="space-y-2 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">Мои аукционы</h3>
          <span className="text-xs text-slate-500">{sellerAuctions.length} активных карточек</span>
        </div>
        {sellerAuctions.length === 0 ? (
          <p className="text-sm text-slate-600">Аукционов пока нет.</p>
        ) : (
          <ul className="space-y-2">
            {sellerAuctions.map(({ listing, auction }) => (
              <li key={listing.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">{listing.title}</p>
                  <AuctionStatusBadge status={auction.status} />
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <span>
                    Текущая ставка: {auction.currentBid.toLocaleString("ru-RU")} ₽ · Ставок: {auction.bidCount}
                  </span>
                  <CountdownTimer endAt={auction.endAt} className="min-w-[220px]" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
