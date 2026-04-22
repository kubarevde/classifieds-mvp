"use client";

import Link from "next/link";

import { HeroBannerPlacement } from "@/lib/hero-board";
import { getStorefrontSellerById } from "@/lib/sellers";
import { getWorldLabel } from "@/lib/listings";

type HeroBoardPlacementCardProps = {
  placement: HeroBannerPlacement;
  compact?: boolean;
};

const periodLabel = {
  day: "день",
  week: "неделя",
  month: "месяц",
} as const;

export function HeroBoardPlacementCard({ placement, compact = false }: HeroBoardPlacementCardProps) {
  const seller = getStorefrontSellerById(placement.sellerId);
  const destinationHref = placement.ctaHref || `/sellers/${placement.sellerId}`;
  const hasImage = Boolean(placement.imageUrl) && !compact;

  return (
    <article
      className={`rounded-2xl border border-amber-200 bg-[linear-gradient(to_bottom,#fffef7,#fff7df)] shadow-sm ${
        compact ? "p-3" : "p-4 sm:p-5"
      }`}
      style={
        hasImage
          ? {
              backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.72), rgba(30,41,59,0.58)), url(${placement.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-900">
          {placement.scope === "global" ? "Герой доски" : "Герой мира"}
        </span>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
          20% стоимости идут на благотворительность (демо)
        </span>
      </div>

      <div className={`mt-2 grid gap-3 ${compact ? "md:grid-cols-[minmax(0,1fr)_130px]" : "md:grid-cols-[minmax(0,1fr)_170px]"}`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {seller?.storefrontName ?? "Рекламная доска"}
          </p>
          <p className={`${compact ? "text-base" : "text-xl"} mt-1 font-semibold tracking-tight text-slate-900`}>
            {placement.title}
          </p>
          <p className="mt-1 text-sm text-slate-600">{placement.subtitle}</p>
          <p className="mt-2 text-xs text-slate-500">
            Охват:{" "}
            {placement.scope === "global" ? "вся платформа" : getWorldLabel(placement.worldId ?? "all")} · период:{" "}
            {periodLabel[placement.period]}
          </p>
        </div>
        <div className={`rounded-xl border border-white/70 bg-white/80 p-2 ${compact ? "text-xs" : "text-sm"}`}>
          <p className="text-slate-500">Mock‑бюджет</p>
          <p className="mt-1 font-semibold text-slate-900">{placement.mockPrice.toLocaleString("ru-RU")} ₽</p>
          <Link
            href={destinationHref}
            className="mt-2 inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {placement.ctaLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
