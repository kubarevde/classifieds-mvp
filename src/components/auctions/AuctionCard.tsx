import Link from "next/link";

import type { AuctionState } from "@/entities/auction/model";
import type { UnifiedCatalogListing } from "@/lib/listings";

import { AuctionStatusBadge } from "./AuctionStatusBadge";
import { CountdownTimer } from "./CountdownTimer";

type AuctionCardProps = {
  listing: UnifiedCatalogListing;
  auction: AuctionState;
  view: "grid" | "list";
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

export function AuctionCard({ listing, auction, view }: AuctionCardProps) {
  const actionLabel = auction.status === "live" || auction.status === "ending_soon" ? "Сделать ставку" : "Смотреть";
  const wrapperClass =
    view === "list"
      ? "group flex gap-3 rounded-2xl border border-indigo-100 bg-[linear-gradient(to_bottom,#ffffff,#f5f8ff)] p-3 shadow-sm transition hover:border-indigo-200 hover:shadow-md sm:gap-4"
      : "group flex h-full flex-col overflow-hidden rounded-2xl border border-indigo-100 bg-[linear-gradient(to_bottom,#ffffff,#f5f8ff)] shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg";

  return (
    <Link href={listing.detailsHref ?? `/listings/${listing.id}`} className={wrapperClass}>
      <div className={view === "list" ? `h-20 w-20 shrink-0 rounded-xl bg-gradient-to-br sm:h-28 sm:w-28 ${listing.image}` : `h-44 bg-gradient-to-br ${listing.image}`} />
      <div className={view === "list" ? "min-w-0 flex-1 space-y-2" : "flex flex-1 flex-col gap-2.5 p-4"}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <AuctionStatusBadge status={auction.status} />
          <span className="text-xs text-slate-500">{auction.bidCount} ставок</span>
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{listing.title}</h3>
        <p className="text-2xl font-bold tracking-tight text-slate-900">{formatMoney(auction.currentBid)} ₽</p>
        <CountdownTimer endAt={auction.endAt} />
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{listing.location}</span>
          <span>{listing.publishedAt}</span>
        </div>
        <span className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white transition group-hover:bg-slate-700">
          {actionLabel}
        </span>
      </div>
    </Link>
  );
}
