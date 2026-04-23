"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, Heart, ShieldCheck, Users } from "lucide-react";

import { ListingPreviewCard } from "@/components/listings/listing-preview-card";
import { ListingsGrid } from "@/components/listings/listings-grid";
import {
  MarketingCampaign,
  MarketingCoupon,
  SellerPost,
  SellerStorefront,
  StorefrontListing,
  getSellerTypeLabel,
} from "@/lib/sellers";
import { ListingsView, ListingWorld } from "@/lib/listings";

type StorefrontPageClientProps = {
  seller: SellerStorefront;
  listings: StorefrontListing[];
  posts: SellerPost[];
  pinnedPost: SellerPost | null;
  coupons: MarketingCoupon[];
  promotionState: {
    sellerId: string;
    listingId: string;
    lastBoostedAt: string | null;
    isSuper: boolean;
    isSponsored: boolean;
  }[];
  campaigns: MarketingCampaign[];
};

type ListingScope = "all" | "active";

const scopeLabels: Record<ListingScope, string> = {
  all: "Все объявления",
  active: "Активные",
};

const worldLabels: Record<ListingWorld, string> = {
  base: "Каталог",
  autos: "Автомобили",
  agriculture: "Сельское хозяйство",
  electronics: "Электроника",
  real_estate: "Недвижимость",
  jobs: "Работа",
  services: "Услуги",
};

const viewButtonClassName =
  "rounded-xl border px-3 py-2 text-sm font-medium transition hover:border-slate-300 hover:bg-slate-50";

function TrustBadgeIcon({ badgeId }: { badgeId: string }) {
  const className = "h-5 w-5";
  if (badgeId === "verified") {
    return <ShieldCheck className={className} strokeWidth={1.5} />;
  }
  if (badgeId === "response") {
    return <Clock3 className={className} strokeWidth={1.5} />;
  }
  if (badgeId === "repeat") {
    return <Users className={className} strokeWidth={1.5} />;
  }
  return <ShieldCheck className={className} strokeWidth={1.5} />;
}

function formatPostDate(isoDate: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
  }).format(new Date(isoDate));
}

export function StorefrontPageClient({
  seller,
  listings,
  coupons,
  promotionState,
  campaigns,
}: StorefrontPageClientProps) {
  const [scope, setScope] = useState<ListingScope>("all");
  const [world, setWorld] = useState<"all" | ListingWorld>("all");
  const [view, setView] = useState<ListingsView>("grid");
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isFavoriteStore, setIsFavoriteStore] = useState(false);

  const worlds = useMemo(
    () =>
      Array.from(new Set(listings.map((listing) => listing.world))).sort((a, b) =>
        worldLabels[a].localeCompare(worldLabels[b], "ru"),
      ),
    [listings],
  );

  const activeListingsCount = useMemo(
    () => listings.filter((listing) => listing.status === "active").length,
    [listings],
  );

  const visibleListings = useMemo(
    () =>
      listings.filter((listing) => {
        const matchesScope = scope === "all" ? true : listing.status === "active";
        const matchesWorld = world === "all" ? true : listing.world === world;
        return matchesScope && matchesWorld;
      }),
    [listings, scope, world],
  );

  const firstListing = visibleListings[0] ?? listings[0];
  const activeCoupons = useMemo(() => coupons.filter((coupon) => coupon.status === "active"), [coupons]);
  const activeCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.status === "active"),
    [campaigns],
  );
  const featuredListings = useMemo(() => {
    const promotedListingIds = new Set<string>();
    promotionState.forEach((state) => {
      if (state.isSuper || state.isSponsored || state.lastBoostedAt) {
        promotedListingIds.add(state.listingId);
      }
    });
    activeCampaigns.forEach((campaign) => campaign.listingIds.forEach((id) => promotedListingIds.add(id)));
    return listings.filter((listing) => promotedListingIds.has(listing.id)).slice(0, 4);
  }, [activeCampaigns, listings, promotionState]);

  const vitrinePopular = useMemo(() => {
    const used = new Set<string>();
    const rows: StorefrontListing[] = [];
    for (const listing of featuredListings) {
      if (!used.has(listing.id)) {
        used.add(listing.id);
        rows.push(listing);
      }
    }
    const filler = [...listings]
      .filter((listing) => listing.status === "active" && !used.has(listing.id))
      .sort((a, b) => b.priceValue - a.priceValue);
    for (const listing of filler) {
      if (rows.length >= 4) {
        break;
      }
      rows.push(listing);
      used.add(listing.id);
    }
    return rows;
  }, [featuredListings, listings]);

  const vitrineNew = useMemo(
    () =>
      [...listings]
        .filter((listing) => listing.status === "active")
        .sort((a, b) => new Date(b.postedAtIso).getTime() - new Date(a.postedAtIso).getTime())
        .slice(0, 4),
    [listings],
  );

  const vitrineBudgetCap = useMemo(() => {
    const prices = listings
      .filter((listing) => listing.status === "active")
      .map((listing) => listing.priceValue)
      .sort((a, b) => a - b);
    if (!prices.length) {
      return null;
    }
    const idx = Math.min(prices.length - 1, Math.floor((prices.length - 1) * 0.35));
    return prices[idx] ?? null;
  }, [listings]);

  const vitrineBudget = useMemo(() => {
    if (vitrineBudgetCap == null) {
      return [];
    }
    return listings
      .filter((listing) => listing.status === "active" && listing.priceValue <= vitrineBudgetCap)
      .sort((a, b) => a.priceValue - b.priceValue)
      .slice(0, 4);
  }, [listings, vitrineBudgetCap]);

  const pinnedPromoListings = useMemo(() => {
    const orderedIds: string[] = [];
    promotionState.forEach((state) => {
      if (state.isSuper) {
        orderedIds.push(state.listingId);
      }
    });
    promotionState.forEach((state) => {
      if (state.lastBoostedAt && !orderedIds.includes(state.listingId)) {
        orderedIds.push(state.listingId);
      }
    });
    featuredListings.forEach((listing) => {
      if (!orderedIds.includes(listing.id)) {
        orderedIds.push(listing.id);
      }
    });
    const out: StorefrontListing[] = [];
    for (const id of orderedIds) {
      const listing = listings.find((item) => item.id === id && item.status === "active");
      if (listing) {
        out.push(listing);
      }
      if (out.length >= 6) {
        break;
      }
    }
    return out;
  }, [featuredListings, listings, promotionState]);

  const primaryCoupon = activeCoupons[0] ?? null;
  function toggleSubscription() {
    setIsSubscribed((current) => !current);
  }

  function toggleFavoriteStore() {
    setIsFavoriteStore((current) => !current);
  }

  return (
    <div className="space-y-4">
      <section
        className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br p-4 text-white shadow-lg shadow-slate-900/10 sm:p-5 lg:min-h-[190px] ${seller.heroGradientClass}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.14),transparent_55%)]" />
        <div className="pointer-events-none absolute -left-10 top-8 h-32 w-32 rounded-full bg-white/12 blur-2xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-44 w-44 rounded-full bg-black/25 blur-3xl" />

        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-stretch">
          <div className="flex h-full min-h-[150px] flex-col justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/85">
                Витрина магазина
              </span>
              <span className="rounded-full border border-white/15 bg-black/10 px-2.5 py-1 text-[11px] font-medium text-white/80">
                {seller.city}
              </span>
              <span className="rounded-full border border-white/15 bg-black/10 px-2.5 py-1 text-[11px] font-medium text-white/80">
                {getSellerTypeLabel(seller.type)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 self-start place-items-center rounded-xl border border-white/35 bg-white/20 text-lg font-semibold tracking-tight shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_20px_rgba(15,23,42,0.22)]">
                {seller.avatarLabel}
              </div>
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center">
                  <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{seller.storefrontName}</h1>
                  <button
                    type="button"
                    onClick={toggleFavoriteStore}
                    aria-label={isFavoriteStore ? "Убрать из избранных магазинов" : "Добавить магазин в избранные"}
                    className={`ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
                      isFavoriteStore
                        ? "border-white/35 bg-white/20 text-white"
                        : "border-white/25 bg-black/15 text-white/80 hover:bg-white/10"
                    }`}
                  >
                    <Heart className="h-4 w-4" fill={isFavoriteStore ? "currentColor" : "none"} strokeWidth={1.5} />
                  </button>
                </div>
                <p className="text-sm text-white/75">
                  {seller.displayName} · {seller.city}
                </p>
                <p className="max-w-2xl text-pretty text-sm leading-relaxed text-white/88 sm:text-[15px]">
                  {seller.shortDescription}
                </p>
              </div>
            </div>

            <p className="text-xs text-white/80 sm:text-sm">
              Активно: <span className="font-semibold tabular-nums text-white">{activeListingsCount}</span>
              <span className="text-white/55"> · </span>
              Рейтинг: <span className="font-semibold tabular-nums text-white">{seller.metrics.rating.toFixed(1)}</span>
              <span className="text-white/55"> · </span>
              На платформе: <span className="font-semibold text-white">{seller.memberSinceLabel}</span>
            </p>
          </div>

          <aside className="flex flex-col gap-3 rounded-2xl border border-white/20 bg-black/25 p-4 text-sm shadow-lg shadow-black/20 backdrop-blur-md sm:p-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Связь с магазином</p>
              <p className={`text-sm font-medium ${seller.accentClass}`}>
                {seller.city}, {seller.region}
              </p>
              <p className="text-xs leading-relaxed text-white/75">{seller.responseSpeedLabel}</p>
            </div>

            <div className="space-y-2 border-t border-white/15 pt-3">
              <Link
                href={{
                  pathname: "/messages",
                  query: {
                    listingId: firstListing?.id ?? "",
                    sellerName: seller.displayName,
                    listingTitle: firstListing?.title ?? seller.storefrontName,
                  },
                }}
                className="inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Написать продавцу
              </Link>
              <button
                type="button"
                onClick={() => setIsPhoneRevealed((previous) => !previous)}
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/30 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {isPhoneRevealed ? seller.phone : "Показать телефон"}
              </button>
              <a
                href="#seller-listings"
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/30 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Ко всем объявлениям
              </a>
            </div>

            <div className="border-t border-white/15 pt-3">
              <button
                type="button"
                onClick={toggleSubscription}
                className={`inline-flex w-full items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  isSubscribed
                    ? "border-white/35 bg-white/15 text-white hover:bg-white/20"
                    : "border-white/25 bg-white text-slate-900 hover:bg-slate-100"
                }`}
              >
                {isSubscribed ? (
                  <span className="inline-flex items-center gap-1">
                    Подписан <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                ) : (
                  "Подписаться"
                )}
              </button>
            </div>
          </aside>
        </div>
      </section>

      <section className="rounded-2xl bg-white/70 px-2 py-1">
        <ul className="flex flex-wrap items-center gap-2">
          {seller.trustBadges.map((badge) => (
            <li
              key={badge.id}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm"
            >
              <span className="text-slate-500">
                <TrustBadgeIcon badgeId={badge.id} />
              </span>
              <span>{badge.label}</span>
            </li>
          ))}
        </ul>
      </section>

      {vitrinePopular.length ? (
        <section className="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Лучшее</h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Подборка сильных позиций по демо-правилам видимости и релевантности витрины.
              </p>
            </div>
            <a
              href="#seller-listings"
              className="text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
            >
              Все объявления ↓
            </a>
          </div>
          <ListingsGrid
            listings={vitrinePopular}
            view="grid"
            emptyMessage="Пока нет позиций для подборки «Лучшее»."
            emptyStateClassName="bg-slate-50"
          />
        </section>
      ) : null}

      {vitrineNew.length ? (
        <section className="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Новое поступление</h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Свежие активные объявления — по дате публикации, чтобы покупатель видел динамику магазина.
              </p>
            </div>
            <a
              href="#seller-listings"
              className="text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
            >
              Полный каталог ↓
            </a>
          </div>
          <ListingsGrid
            listings={vitrineNew}
            view="grid"
            emptyMessage="Новых активных объявлений пока нет."
            emptyStateClassName="bg-slate-50"
          />
        </section>
      ) : null}

      {vitrineBudget.length > 0 && vitrineBudgetCap != null ? (
        <section className="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Выгодная витрина</h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Активные объявления до порога{" "}
                <span className="font-semibold tabular-nums text-slate-800">
                  {vitrineBudgetCap.toLocaleString("ru-RU")} ₽
                </span>{" "}
                — нижняя треть ценового ряда магазина (mock‑подборка без персонализации).
              </p>
            </div>
            <a
              href="#seller-listings"
              className="text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
            >
              Все объявления ↓
            </a>
          </div>
          <ListingsGrid
            listings={vitrineBudget}
            view="grid"
            emptyMessage="В этой ценовой витрине пока пусто."
            emptyStateClassName="bg-slate-50"
          />
        </section>
      ) : null}

      <section id="seller-listings" className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Все объявления</h2>
          <p className="mt-1 text-sm text-slate-600">
            Полный каталог магазина с фильтрами по статусу и тематическим «мирам» каталога.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {(["all", "active"] as ListingScope[]).map((section) => {
              const isActive = section === scope;
              const count =
                section === "all"
                  ? listings.length
                  : listings.filter((listing) => listing.status === "active").length;
              return (
                <button
                  key={section}
                  type="button"
                  onClick={() => setScope(section)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {scopeLabels[section]} · {count}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`${viewButtonClassName} ${view === "grid" ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800" : "border-slate-200 bg-white text-slate-600"}`}
            >
              Сетка
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`${viewButtonClassName} ${view === "list" ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800" : "border-slate-200 bg-white text-slate-600"}`}
            >
              Список
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setWorld("all")}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              world === "all"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Все миры
          </button>
          {worlds.map((worldOption) => (
            <button
              key={worldOption}
              type="button"
              onClick={() => setWorld(worldOption)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                world === worldOption
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {worldLabels[worldOption]}
            </button>
          ))}
        </div>
      </section>

      <ListingsGrid
        listings={visibleListings}
        view={view}
        emptyMessage="По выбранным фильтрам у продавца пока нет объявлений."
      />

      <section
        id="store-promo-hub"
        className="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6"
      >
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Промо и закрепления</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Закреплённые товары и статусы кампаний — рабочий growth-слой витрины (демо-логика).
          </p>
        </div>

        {pinnedPromoListings.length ? (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Закреплённые товары</p>
            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 pt-0.5 [scrollbar-width:thin]">
              {pinnedPromoListings.map((listing) => (
                <div key={listing.id} className="w-[min(100%,18rem)] shrink-0">
                  <ListingPreviewCard listing={listing} view="grid" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm text-slate-600">
            Закреплённых позиций пока нет — витрина показывает каталог в естественном порядке.
          </p>
        )}

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
                  <span className="max-w-[200px] truncate">{campaign.name}</span>
                  <span className="tabular-nums text-[10px] uppercase tracking-wide text-slate-500">
                    {campaign.status === "active" ? "идёт" : "пауза"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {activeCoupons.length ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Акции и купоны</h2>
          <p className="mt-1 text-sm text-slate-600">
            Магазин может создавать временные предложения и купоны — вы видите их здесь.
          </p>
          {primaryCoupon ? (
            <div className="relative mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-4 shadow-sm">
              <div className="pointer-events-none absolute -right-6 top-0 h-24 w-24 rounded-full bg-slate-200/40 blur-2xl" />
              <div className="relative flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Промо-плашка акции</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{primaryCoupon.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Код <span className="font-mono font-semibold text-slate-800">{primaryCoupon.code}</span>
                    {" · "}
                    {primaryCoupon.discountType === "percent"
                      ? `−${primaryCoupon.discountValue}%`
                      : `−${primaryCoupon.discountValue.toLocaleString("ru-RU")} ₽`}{" "}
                    до {formatPostDate(primaryCoupon.validUntil)}
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  Активно
                </span>
              </div>
            </div>
          ) : null}
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {activeCoupons.map((coupon) => (
              <article key={coupon.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                    Купон
                  </span>
                  <span className="text-xs font-semibold text-slate-700">{coupon.code}</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-900">{coupon.title}</p>
                <p className="text-sm text-slate-600">
                  {coupon.discountType === "percent"
                    ? `Скидка ${coupon.discountValue}%`
                    : `Скидка ${coupon.discountValue.toLocaleString("ru-RU")} ₽`}
                  {" · до "}
                  {formatPostDate(coupon.validUntil)}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">О магазине</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Краткий профиль продавца, сервисные обещания и контакты — в одном блоке, без лишних экранов.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">История и позиционирование</p>
            <p className="text-sm leading-relaxed text-slate-700">{seller.shortDescription}</p>
            <p className="text-xs text-slate-500">
              Тип продавца: <span className="font-medium text-slate-700">{getSellerTypeLabel(seller.type)}</span>
            </p>
          </div>
          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Сервис и репутация</p>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex justify-between gap-2 border-b border-slate-100 pb-2">
                <span className="text-slate-500">Рейтинг</span>
                <span className="font-semibold tabular-nums text-slate-900">{seller.metrics.rating.toFixed(1)} / 5</span>
              </li>
              <li className="flex justify-between gap-2 border-b border-slate-100 pb-2">
                <span className="text-slate-500">Ответ</span>
                <span className="text-right font-medium text-slate-800">{seller.responseSpeedLabel}</span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-slate-500">Активные лоты</span>
                <span className="font-semibold tabular-nums text-slate-900">{activeListingsCount}</span>
              </li>
            </ul>
            <p className="text-xs leading-relaxed text-slate-500">
              Метрики на витрине — демо-значения для MVP, без подключения аналитики.
            </p>
          </div>
          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Контакты</p>
            <p className="text-sm text-slate-700">
              Телефон: <span className="font-medium text-slate-900">{seller.phone}</span>
            </p>
            <p className="break-all text-sm text-slate-600">
              Сайт: {seller.contactLinks.website ? <span className="text-slate-900">{seller.contactLinks.website}</span> : "не указан"}
            </p>
            <p className="break-all text-sm text-slate-600">
              Telegram:{" "}
              {seller.contactLinks.telegram ? (
                <span className="text-slate-900">{seller.contactLinks.telegram}</span>
              ) : (
                "не указан"
              )}
            </p>
            <p className="break-all text-sm text-slate-600">
              VK: {seller.contactLinks.vk ? <span className="text-slate-900">{seller.contactLinks.vk}</span> : "не указан"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
