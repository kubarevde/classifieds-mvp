"use client";

import Link from "next/link";

import { HeroBannerPlacement } from "@/lib/hero-board";
import { getStorefrontSellerById } from "@/lib/sellers";
import { getWorldLabel } from "@/lib/listings";

type HeroBoardPlacementCardProps = {
  placement: HeroBannerPlacement;
  compact?: boolean;
  /** Целая карточка ведёт на целевой URL (витрина продукта sponsor-board). */
  inventory?: boolean;
  /**
   * Витрина sponsor-board: «портал» — тёплый премиум, «мир» — холодный премиум.
   * Не задавать на страницах миров / списках — сохраняется прежний янтарный стиль.
   */
  visualTier?: "portal" | "world";
};

const periodLabel = {
  day: "день",
  week: "неделя",
  month: "месяц",
} as const;

export function HeroBoardPlacementCard({
  placement,
  compact = false,
  inventory = false,
  visualTier,
}: HeroBoardPlacementCardProps) {
  const seller = getStorefrontSellerById(placement.sellerId);
  const destinationHref = placement.ctaHref || `/sellers/${placement.sellerId}`;
  const hasImage = Boolean(placement.imageUrl) && !compact;
  const onPhoto = hasImage;

  const defaultArticle = `rounded-2xl border border-amber-200 bg-[linear-gradient(to_bottom,#fffef7,#fff7df)] shadow-sm ${
    compact ? "p-3" : "p-4 sm:p-5"
  } ${inventory ? "transition hover:border-amber-300 hover:shadow-md" : ""}`;

  const tierArticle =
    visualTier === "portal"
      ? `rounded-2xl border border-[#c9a87a]/50 bg-gradient-to-br from-[#fdfbf7] via-[#faf5ee] to-[#ebe0cf] shadow-sm ring-1 ring-[#e8dcc8]/80 ${
          compact ? "p-3 sm:p-4" : "p-4 sm:p-6"
        } ${inventory ? "transition hover:border-[#b8956a]/80 hover:shadow-md" : ""}`
      : visualTier === "world"
        ? `rounded-2xl border border-slate-300/75 bg-gradient-to-br from-slate-50 via-white to-slate-100/90 shadow-sm ring-1 ring-slate-200/60 ${
            compact ? "p-2.5 sm:p-3.5" : "p-3.5 sm:p-4"
          } ${inventory ? "transition hover:border-slate-400/90 hover:shadow-md" : ""}`
        : defaultArticle;

  const articleClass = visualTier ? tierArticle : defaultArticle;

  const scopeBadgeClass =
    visualTier === "portal"
      ? "rounded-full border border-[#b8956a]/45 bg-[#fdf8ee]/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#4a3d30]"
      : visualTier === "world"
        ? "rounded-full border border-slate-400/45 bg-slate-100/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-800"
        : "rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-900";

  const charityBadgeClass =
    visualTier === "world"
      ? "rounded-full border border-teal-700/15 bg-teal-50/95 px-2.5 py-1 text-[11px] font-semibold text-teal-900"
      : visualTier === "portal"
        ? "rounded-full border border-emerald-800/12 bg-emerald-50/95 px-2.5 py-1 text-[11px] font-semibold text-emerald-900"
        : "rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800";

  const scopeBadgeLabel = visualTier
    ? placement.scope === "global"
      ? "Весь портал"
      : "Мир"
    : placement.scope === "global"
      ? "Герой доски"
      : "Герой мира";

  const charityBadgeLabel =
    visualTier === "world" ? "20% в демо — благотворительность" : "20% стоимости идут на благотворительность (демо)";

  const titleClass = `${compact ? "text-base sm:text-[17px]" : "text-lg sm:text-xl"} mt-1 font-semibold tracking-tight ${
    onPhoto ? "text-white drop-shadow-sm" : "text-slate-900"
  }`;

  const subtitleClass = `mt-1 ${compact ? "text-xs sm:text-sm" : "text-sm"} ${onPhoto ? "text-slate-200" : "text-slate-600"}`;

  const metaClass = `mt-2 text-xs ${onPhoto ? "text-slate-300" : "text-slate-500"}`;

  const sellerClass = `text-xs font-semibold uppercase tracking-wide ${onPhoto ? "text-slate-300" : "text-slate-500"}`;

  const inner = (
    <article
      className={articleClass}
      style={
        hasImage
          ? {
              backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.78), rgba(30,41,59,0.62)), url(${placement.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={scopeBadgeClass}>{scopeBadgeLabel}</span>
        <span className={charityBadgeClass}>{charityBadgeLabel}</span>
      </div>

      <div className={`mt-2 grid gap-3 ${compact ? "md:grid-cols-[minmax(0,1fr)_118px]" : "md:grid-cols-[minmax(0,1fr)_158px]"}`}>
        <div>
          <p className={sellerClass}>{seller?.storefrontName ?? "Рекламная доска"}</p>
          <p className={titleClass}>{placement.title}</p>
          <p className={subtitleClass}>{placement.subtitle}</p>
          <p className={metaClass}>
            Охват:{" "}
            {placement.scope === "global" ? "вся платформа" : getWorldLabel(placement.worldId ?? "all")} · период:{" "}
            {periodLabel[placement.period]}
          </p>
        </div>
        <div
          className={`rounded-xl border p-2 ${
            onPhoto
              ? "border-white/25 bg-white/15 backdrop-blur-sm"
              : visualTier === "world"
                ? "border-slate-200/90 bg-white/90"
                : visualTier === "portal"
                  ? "border-[#d8c4a8]/60 bg-white/85"
                  : "border-white/70 bg-white/80"
          } ${compact ? "text-xs" : "text-sm"}`}
        >
          <p className={onPhoto ? "text-slate-200" : "text-slate-500"}>Mock‑бюджет</p>
          <p className={`mt-1 font-semibold tabular-nums ${onPhoto ? "text-white" : "text-slate-900"}`}>
            {placement.mockPrice.toLocaleString("ru-RU")} ₽
          </p>
          {inventory ? (
            <span
              className={`mt-2 inline-flex h-8 items-center rounded-lg border px-2.5 font-semibold ${
                onPhoto
                  ? "border-white/35 bg-white/20 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {placement.ctaLabel}
            </span>
          ) : (
            <Link
              href={destinationHref}
              className="mt-2 inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {placement.ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </article>
  );

  if (inventory) {
    return (
      <Link
        href={destinationHref}
        className={`block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
          visualTier === "portal"
            ? "focus-visible:ring-[#b8956a]/70"
            : visualTier === "world"
              ? "focus-visible:ring-slate-400"
              : "focus-visible:ring-slate-400"
        }`}
        aria-label={`${placement.title}: ${placement.ctaLabel}`}
      >
        {inner}
      </Link>
    );
  }

  return inner;
}
