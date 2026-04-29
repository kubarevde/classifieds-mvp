"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { CheckCircle2, Heart, Search } from "lucide-react";

import { ListingsGrid } from "@/components/listings/listings-grid";
import { ErrorBoundary } from "@/components/platform";
import { StorefrontFeaturedSection } from "@/components/sellers/storefront-featured-section";
import { StorefrontHeroTrustHint } from "@/components/sellers/storefront-hero-trust-hint";
import {
  MarketingCampaign,
  MarketingCoupon,
  SellerPost,
  SellerStorefront,
  StorefrontListing,
  getSellerTypeLabel,
} from "@/lib/sellers";
import { ListingsView, ListingWorld } from "@/lib/listings";
import { withReturnTo } from "@/lib/navigation/return-to";
import { ReportAbuseButton } from "@/components/safety/ReportAbuseButton";
import { TransactionSafetyChecklist } from "@/components/risk/TransactionSafetyChecklist";

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
  "min-h-11 rounded-xl border px-3 py-2 text-sm font-medium transition hover:border-slate-300 hover:bg-slate-50";

const StorefrontReputationSection = dynamic(
  () => import("@/components/sellers/storefront-reputation-section").then((mod) => mod.StorefrontReputationSection),
  {
    loading: () => <div className="h-[420px] animate-pulse rounded-2xl bg-slate-200" />,
    ssr: false,
  },
);

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
  const storefrontReturnTo = `/stores/${seller.id}#seller-listings`;
  const [scope, setScope] = useState<ListingScope>("all");
  const [world, setWorld] = useState<"all" | ListingWorld>("all");
  const [inventoryQuery, setInventoryQuery] = useState("");
  const [inventorySort, setInventorySort] = useState<"newest" | "price_asc" | "price_desc">("newest");
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

  const visibleListings = useMemo(() => {
    const normalized = inventoryQuery.trim().toLowerCase();
    const base = listings.filter((listing) => {
      const matchesScope = scope === "all" ? true : listing.status === "active";
      const matchesWorld = world === "all" ? true : listing.world === world;
      if (!matchesScope || !matchesWorld) {
        return false;
      }
      if (!normalized) {
        return true;
      }
      const haystack = [
        listing.title,
        listing.description,
        listing.categoryLabel,
        listing.price,
        listing.location,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
    const sorted = [...base].sort((a, b) => {
      if (inventorySort === "price_asc") {
        return a.priceValue - b.priceValue;
      }
      if (inventorySort === "price_desc") {
        return b.priceValue - a.priceValue;
      }
      return new Date(b.postedAtIso).getTime() - new Date(a.postedAtIso).getTime();
    });
    return sorted;
  }, [listings, scope, world, inventoryQuery, inventorySort]);
  const visibleListingsWithReturnTo = useMemo(
    () =>
      visibleListings.map((listing) => ({
        ...listing,
        detailsHref: withReturnTo(listing.detailsHref, storefrontReturnTo),
      })),
    [storefrontReturnTo, visibleListings],
  );

  const firstListing = visibleListings[0] ?? listings[0];
  const activeCoupons = useMemo(() => coupons.filter((coupon) => coupon.status === "active"), [coupons]);
  const activeCampaigns = useMemo(() => campaigns.filter((campaign) => campaign.status === "active"), [campaigns]);
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
  const vitrinePopularWithReturnTo = useMemo(
    () =>
      vitrinePopular.map((listing) => ({
        ...listing,
        detailsHref: withReturnTo(listing.detailsHref, storefrontReturnTo),
      })),
    [storefrontReturnTo, vitrinePopular],
  );

  const vitrineNew = useMemo(
    () =>
      [...listings]
        .filter((listing) => listing.status === "active")
        .sort((a, b) => new Date(b.postedAtIso).getTime() - new Date(a.postedAtIso).getTime())
        .slice(0, 4),
    [listings],
  );
  const vitrineNewWithReturnTo = useMemo(
    () =>
      vitrineNew.map((listing) => ({
        ...listing,
        detailsHref: withReturnTo(listing.detailsHref, storefrontReturnTo),
      })),
    [storefrontReturnTo, vitrineNew],
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
  const vitrineBudgetWithReturnTo = useMemo(
    () =>
      vitrineBudget.map((listing) => ({
        ...listing,
        detailsHref: withReturnTo(listing.detailsHref, storefrontReturnTo),
      })),
    [storefrontReturnTo, vitrineBudget],
  );

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
  const pinnedPromoListingsWithReturnTo = useMemo(
    () =>
      pinnedPromoListings.map((listing) => ({
        ...listing,
        detailsHref: withReturnTo(listing.detailsHref, storefrontReturnTo),
      })),
    [pinnedPromoListings, storefrontReturnTo],
  );

  const primaryCoupon = activeCoupons[0] ?? null;
  function toggleSubscription() {
    setIsSubscribed((current) => !current);
  }

  function toggleFavoriteStore() {
    setIsFavoriteStore((current) => !current);
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <section className="rounded-2xl border border-slate-200/90 bg-white shadow-none">
        <div className="h-1 w-full rounded-t-2xl bg-slate-900/80" aria-hidden />
        <div className="grid gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-6 lg:px-5">
          <div className="min-w-0 space-y-3.5">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-700 sm:px-2.5 sm:py-1 sm:text-[11px]">
                Магазин
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 sm:px-2.5 sm:py-1 sm:text-[11px]">
                {seller.city}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 sm:px-2.5 sm:py-1 sm:text-[11px]">
                {getSellerTypeLabel(seller.type)}
              </span>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-100 text-base font-semibold tracking-tight text-slate-800 sm:h-16 sm:w-16 sm:text-lg">
                {seller.avatarLabel}
              </div>

              <div className="min-w-0 max-w-[620px] space-y-1.5">
                <div className="flex flex-wrap items-center gap-1">
                  <h1 className="text-balance text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
                    {seller.storefrontName}
                  </h1>
                  <button
                    type="button"
                    onClick={toggleFavoriteStore}
                    aria-label={isFavoriteStore ? "Убрать из избранных магазинов" : "Добавить магазин в избранные"}
                    className={`ml-1 inline-flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white transition sm:ml-2 ${
                      isFavoriteStore ? "text-rose-600" : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Heart className="h-4 w-4" fill={isFavoriteStore ? "currentColor" : "none"} strokeWidth={1.5} />
                  </button>
                </div>
                <p className="text-xs text-slate-600 sm:text-sm">
                  {seller.displayName} · {seller.city}
                </p>
                <p className="text-pretty text-sm leading-snug text-slate-700 sm:text-[15px] sm:leading-relaxed">
                  {seller.shortDescription}
                </p>
                <p className="text-[11px] text-slate-500 sm:text-xs">
                  Активно: <span className="font-semibold tabular-nums text-slate-800">{activeListingsCount}</span>
                  <span className="text-slate-400"> · </span>
                  На платформе: <span className="font-medium text-slate-700">{seller.memberSinceLabel}</span>
                </p>
                <StorefrontHeroTrustHint targetId={seller.id} memberSinceLabel={seller.memberSinceLabel} />
              </div>
            </div>
          </div>

          <aside className="space-y-2 lg:border-l lg:border-slate-100 lg:pl-6">
            <p className="text-xs text-slate-600">
              <span className="font-medium text-slate-800">{seller.city}</span>, {seller.region}
            </p>
            <div className="space-y-1.5">
              <Link
                href={{
                  pathname: "/messages",
                  query: {
                    listingId: firstListing?.id ?? "",
                    sellerName: seller.displayName,
                    listingTitle: firstListing?.title ?? seller.storefrontName,
                  },
                }}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Написать продавцу
              </Link>
              <button
                type="button"
                onClick={() => setIsPhoneRevealed((previous) => !previous)}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                {isPhoneRevealed ? seller.phone : "Показать телефон"}
              </button>
              <a
                href="#seller-listings"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Ко всем объявлениям
              </a>
              <ReportAbuseButton
                targetType="store"
                targetId={seller.id}
                targetLabel={seller.storefrontName}
                variant="outline"
                className="w-full justify-center text-sm"
                label="Сообщить о нарушении"
              />
            </div>
            <p className="text-[11px] text-slate-500">Откройте каталог, чтобы сразу посмотреть актуальные позиции магазина.</p>
            <TransactionSafetyChecklist variant="compact" />
            <button
              type="button"
              onClick={toggleSubscription}
              className={`inline-flex min-h-11 w-full items-center justify-center rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                isSubscribed
                  ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                  : "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
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
          </aside>
        </div>
      </section>

      <StorefrontFeaturedSection pinnedListings={pinnedPromoListingsWithReturnTo} campaigns={campaigns} />

      {vitrinePopular.length ? (
        <section className="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-none sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Лучшее</h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Подборка сильных позиций по демо-правилам видимости и релевантности магазина.
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
            listings={vitrinePopularWithReturnTo}
            view="grid"
            emptyMessage="Пока нет позиций для подборки «Лучшее»."
            emptyStateClassName="bg-slate-50"
          />
        </section>
      ) : null}

      {vitrineNew.length ? (
        <section className="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-none sm:p-6">
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
            listings={vitrineNewWithReturnTo}
            view="grid"
            emptyMessage="Новых активных объявлений пока нет."
            emptyStateClassName="bg-slate-50"
          />
        </section>
      ) : null}

      {vitrineBudget.length > 0 && vitrineBudgetCap != null ? (
        <section className="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-none sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Выгодные объявления</h2>
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
            listings={vitrineBudgetWithReturnTo}
            view="grid"
            emptyMessage="В этом ценовом блоке пока пусто."
            emptyStateClassName="bg-slate-50"
          />
        </section>
      ) : null}

      <section
        id="seller-listings"
        className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-none sm:p-5"
      >
        <div className="mb-3 border-b border-slate-100 pb-3">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Все объявления</h2>
          <p className="mt-1 text-sm text-slate-600">
            Локальный поиск по магазину, сортировка и фильтры по статусу и мирам каталога.
          </p>
        </div>

        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={inventoryQuery}
              onChange={(event) => setInventoryQuery(event.target.value)}
              placeholder="Искать в этом магазине…"
              className="h-11 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
            />
          </div>
          <select
            value={inventorySort}
            onChange={(event) => setInventorySort(event.target.value as "newest" | "price_asc" | "price_desc")}
            className="h-11 min-h-[44px] shrink-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400 sm:min-w-[11rem]"
          >
            <option value="newest">Сначала новые</option>
            <option value="price_asc">Сначала дешевле</option>
            <option value="price_desc">Сначала дороже</option>
          </select>
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
                  className={`min-h-11 rounded-full border px-3 py-2 text-sm font-medium transition ${
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
            className={`min-h-11 rounded-full border px-3 py-2 text-sm font-medium transition ${
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
              className={`min-h-11 rounded-full border px-3 py-2 text-sm font-medium transition ${
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
        listings={visibleListingsWithReturnTo}
        view={view}
        emptyMessage="По выбранным фильтрам у продавца пока нет объявлений."
      />

      <ErrorBoundary
        context="storefront-reputation-section"
        fallback={<div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Раздел отзывов временно недоступен.</div>}
      >
        <StorefrontReputationSection targetId={seller.id} />
      </ErrorBoundary>

      {activeCoupons.length ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-none sm:p-5">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Акции и купоны</h2>
          <p className="mt-1 text-sm text-slate-600">
            Магазин может создавать временные предложения и купоны — вы видите их здесь.
          </p>
          {primaryCoupon ? (
            <div className="relative mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-4 shadow-none">
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

      <section
        id="store-about"
        className="rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 p-5 shadow-none sm:p-6"
      >
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">О магазине</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Краткий профиль продавца и контакты — в одном блоке, без лишних экранов.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-none">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">История и позиционирование</p>
            <p className="text-sm leading-relaxed text-slate-700">{seller.shortDescription}</p>
            <p className="text-xs text-slate-500">
              Тип продавца: <span className="font-medium text-slate-700">{getSellerTypeLabel(seller.type)}</span>
            </p>
          </div>
          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-none">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Активность</p>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex justify-between gap-2">
                <span className="text-slate-500">Активные лоты</span>
                <span className="font-semibold tabular-nums text-slate-900">{activeListingsCount}</span>
              </li>
            </ul>
            <p className="text-xs leading-relaxed text-slate-500">
              Репутация и отзывы — в разделе «Репутация и отзывы» на этой странице.
            </p>
          </div>
          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-none">
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
