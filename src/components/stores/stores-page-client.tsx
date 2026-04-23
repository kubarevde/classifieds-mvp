"use client";

import { useMemo, useState } from "react";

import { RecommendedStores } from "@/components/stores/recommended-stores";
import { StoreCard, StoreCatalogItem } from "@/components/stores/store-card";
import { StoreCatalogHero } from "@/components/stores/store-catalog-hero";
import { StoreFiltersBar, StoreSortOption } from "@/components/stores/store-filters-bar";
import {
  SellerPlanTier,
  SellerStorefront,
  SellerType,
  getSellerTypeLabel,
  getStorefrontListingsBySellerId,
  storefrontSellers,
} from "@/lib/sellers";
import { CatalogWorld, getWorldLabel } from "@/lib/listings";

type StoreCatalogViewModel = StoreCatalogItem & {
  worldHint: CatalogWorld;
  type: SellerType;
  tier: SellerPlanTier;
  latestListingTimestamp: number;
};

const tierOrder: Record<SellerPlanTier, number> = {
  free: 0,
  pro: 1,
  business: 2,
};

function getReviewsCount(seller: SellerStorefront) {
  return Math.max(9, Math.round(seller.followersCount * 0.18) + seller.metrics.activeListingsCount * 8);
}

function getLatestListingTimestamp(sellerId: string, fallbackYear: number) {
  const listings = getStorefrontListingsBySellerId(sellerId);
  if (!listings.length) {
    return new Date(`${fallbackYear}-01-01T00:00:00.000Z`).getTime();
  }
  return listings.reduce((maxValue, listing) => {
    const nextValue = new Date(listing.postedAtIso).getTime();
    return Number.isFinite(nextValue) && nextValue > maxValue ? nextValue : maxValue;
  }, 0);
}

function mapToCardModel(seller: SellerStorefront): StoreCatalogViewModel {
  return {
    id: seller.id,
    href: `/sellers/${seller.id}`,
    avatarLabel: seller.avatarLabel,
    storefrontName: seller.storefrontName,
    specializationLabel: getSellerTypeLabel(seller.type),
    shortDescription: seller.shortDescription,
    city: seller.city,
    rating: seller.metrics.rating,
    reviewsCount: getReviewsCount(seller),
    activeListingsCount: seller.metrics.activeListingsCount,
    trustBadges: seller.trustBadges.map((badge) => badge.label),
    worldHint: seller.worldHint,
    type: seller.type,
    tier: seller.planTier,
    latestListingTimestamp: getLatestListingTimestamp(seller.id, seller.memberSinceYear),
  };
}

function includesQuery(store: StoreCatalogViewModel, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const haystack = [
    store.storefrontName,
    store.specializationLabel,
    store.shortDescription,
    store.city,
    getWorldLabel(store.worldHint),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

function sortStores(stores: StoreCatalogViewModel[], sortBy: StoreSortOption) {
  return [...stores].sort((a, b) => {
    if (sortBy === "newest_desc") {
      return b.latestListingTimestamp - a.latestListingTimestamp;
    }
    if (sortBy === "listings_desc") {
      return b.activeListingsCount - a.activeListingsCount || b.rating - a.rating;
    }
    return b.rating - a.rating || b.activeListingsCount - a.activeListingsCount;
  });
}

export function StoresPageClient() {
  const [query, setQuery] = useState("");
  const [selectedWorld, setSelectedWorld] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [sortBy, setSortBy] = useState<StoreSortOption>("rating_desc");

  const allStores = useMemo(() => storefrontSellers.map(mapToCardModel), []);

  const worldOptions = useMemo(
    () => [
      { value: "all", label: "Все миры" },
      ...Array.from(new Set(allStores.map((store) => store.worldHint)))
        .sort((a, b) => getWorldLabel(a).localeCompare(getWorldLabel(b), "ru"))
        .map((world) => ({ value: world, label: getWorldLabel(world) })),
    ],
    [allStores],
  );

  const typeOptions = useMemo(
    () => [
      { value: "all", label: "Все категории" },
      ...Array.from(new Set(allStores.map((store) => store.type)))
        .sort((a, b) => getSellerTypeLabel(a).localeCompare(getSellerTypeLabel(b), "ru"))
        .map((type) => ({ value: type, label: getSellerTypeLabel(type) })),
    ],
    [allStores],
  );

  const ratingOptions = [
    { value: "all", label: "Любой рейтинг" },
    { value: "4.0", label: "От 4.0" },
    { value: "4.5", label: "От 4.5" },
    { value: "4.8", label: "От 4.8" },
  ];

  const cityOptions = useMemo(
    () => [
      { value: "all", label: "Все города" },
      ...Array.from(new Set(allStores.map((store) => store.city)))
        .sort((a, b) => a.localeCompare(b, "ru"))
        .map((city) => ({ value: city, label: city })),
    ],
    [allStores],
  );

  const filteredStores = useMemo(() => {
    const minRating = selectedRating === "all" ? 0 : Number(selectedRating);
    return allStores.filter((store) => {
      const matchesWorld = selectedWorld === "all" || store.worldHint === selectedWorld;
      const matchesType = selectedType === "all" || store.type === selectedType;
      const matchesRating = store.rating >= minRating;
      const matchesCity = selectedCity === "all" || store.city === selectedCity;
      const matchesQuery = includesQuery(store, query);
      return matchesWorld && matchesType && matchesRating && matchesCity && matchesQuery;
    });
  }, [allStores, query, selectedCity, selectedRating, selectedType, selectedWorld]);

  const sortedStores = useMemo(() => sortStores(filteredStores, sortBy), [filteredStores, sortBy]);

  const recommendedStores = useMemo(() => {
    const base = sortedStores.length ? sortedStores : sortStores(allStores, "rating_desc");
    const premiumFirst = [...base].sort((a, b) => {
      const byTier = tierOrder[b.tier] - tierOrder[a.tier];
      if (byTier !== 0) {
        return byTier;
      }
      return b.rating - a.rating;
    });
    return premiumFirst.slice(0, 3);
  }, [allStores, sortedStores]);

  const hasActiveFilters =
    selectedWorld !== "all" ||
    selectedType !== "all" ||
    selectedRating !== "all" ||
    selectedCity !== "all" ||
    query.trim().length > 0;

  function resetFilters() {
    setQuery("");
    setSelectedWorld("all");
    setSelectedType("all");
    setSelectedRating("all");
    setSelectedCity("all");
    setSortBy("rating_desc");
  }

  return (
    <div className="space-y-4">
      <StoreCatalogHero query={query} onQueryChange={setQuery} totalStores={allStores.length} />

      <RecommendedStores stores={recommendedStores} />

      <StoreFiltersBar
        world={selectedWorld}
        onWorldChange={setSelectedWorld}
        worldOptions={worldOptions}
        type={selectedType}
        onTypeChange={setSelectedType}
        typeOptions={typeOptions}
        rating={selectedRating}
        onRatingChange={setSelectedRating}
        ratingOptions={ratingOptions}
        city={selectedCity}
        onCityChange={setSelectedCity}
        cityOptions={cityOptions}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onReset={resetFilters}
      />

      <p className="text-sm text-slate-600">
        Найдено магазинов: <span className="font-semibold text-slate-900">{sortedStores.length}</span>
      </p>

      {sortedStores.length ? (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sortedStores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Пока нет магазинов по этому набору фильтров</h2>
          <p className="mt-2 text-sm text-slate-600">
            Попробуйте снять ограничение по рейтингу или городу, либо очистить поисковый запрос. Так вы увидите больше релевантных витрин.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Сбросить фильтры и показать все магазины
          </button>
          {!hasActiveFilters ? (
            <p className="mt-3 text-xs text-slate-500">Каталог пуст только для текущих mock-данных.</p>
          ) : null}
        </section>
      )}
    </div>
  );
}
