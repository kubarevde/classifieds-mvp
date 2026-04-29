"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { SearchActiveFilterChips, type SearchActiveChip } from "@/components/search/search-active-filter-chips";
import { UnifiedSearchShell } from "@/components/search/unified-search-shell";
import { SaveSearchButton } from "@/components/saved-searches/save-search-button";
import { RecommendedStores } from "@/components/stores/recommended-stores";
import { StoreCard, StoreCatalogItem } from "@/components/stores/store-card";
import { StoreCatalogHero } from "@/components/stores/store-catalog-hero";
import { StoreFiltersBar, StoreSortOption } from "@/components/stores/store-filters-bar";
import { isStorefrontCatalogSellerType } from "@/lib/demo-role-constants";
import {
  SellerPlanTier,
  SellerStorefront,
  type SellerType,
  getSellerTypeLabel,
  getStorefrontListingsBySellerId,
  storefrontSellers,
} from "@/lib/sellers";
import { CatalogWorld, getWorldLabel } from "@/lib/listings";
import { cn } from "@/components/ui/cn";
import { buttonVariants } from "@/lib/button-styles";
import {
  createSearchIntentFromFilters,
  createStoreSearchIntentFromFilters,
  defaultSavedSearchFilters,
  hasPersistableSearchIntent,
} from "@/lib/saved-searches";
import { buildCreateRequestHrefFromIntent } from "@/services/requests/intent-adapter";

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
    href: `/stores/${seller.id}`,
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

  const allStores = useMemo(
    () => storefrontSellers.filter((seller) => isStorefrontCatalogSellerType(seller.type)).map(mapToCardModel),
    [],
  );

  const worldOptions = useMemo(
    () => [
      { value: "all", label: "Все миры" },
      ...Array.from(new Set(allStores.map((store) => store.worldHint)))
        .sort((a, b) => getWorldLabel(a).localeCompare(getWorldLabel(b), "ru"))
        .map((world) => ({ value: world, label: getWorldLabel(world) })),
    ],
    [allStores],
  );

  const storeTypeScopeOptions = useMemo(() => {
    const types = Array.from(new Set(allStores.map((store) => store.type)));
    types.sort((a, b) => getSellerTypeLabel(a).localeCompare(getSellerTypeLabel(b), "ru"));
    return types;
  }, [allStores]);

  const typeOptions = useMemo(
    () => [
      { value: "all", label: "Все категории" },
      ...storeTypeScopeOptions.map((type) => ({ value: type, label: getSellerTypeLabel(type) })),
    ],
    [storeTypeScopeOptions],
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

  const storeIntent = useMemo(
    () =>
      createStoreSearchIntentFromFilters({
        query,
        location: selectedCity,
        specialization: "all",
        verifiedOnly: selectedRating !== "all",
        storeType: selectedType,
        sortBy,
      }),
    [query, selectedCity, selectedType, selectedRating, sortBy],
  );

  const storeFilterDrawerCount = useMemo(() => {
    let n = 0;
    if (selectedWorld !== "all") {
      n += 1;
    }
    if (selectedType !== "all") {
      n += 1;
    }
    if (selectedRating !== "all") {
      n += 1;
    }
    if (selectedCity !== "all") {
      n += 1;
    }
    if (query.trim().length > 0) {
      n += 1;
    }
    if (sortBy !== "rating_desc") {
      n += 1;
    }
    return n;
  }, [query, selectedCity, selectedRating, selectedType, selectedWorld, sortBy]);

  const storeActiveChips = useMemo((): SearchActiveChip[] => {
    const chips: SearchActiveChip[] = [];
    const q = query.trim();
    if (q) {
      chips.push({
        id: "q",
        label: `Запрос: ${q.length > 36 ? `${q.slice(0, 36)}…` : q}`,
        onRemove: () => setQuery(""),
      });
    }
    if (selectedWorld !== "all") {
      chips.push({
        id: "world",
        label: getWorldLabel(selectedWorld as CatalogWorld),
        onRemove: () => setSelectedWorld("all"),
      });
    }
    if (selectedType !== "all") {
      chips.push({
        id: "type",
        label: getSellerTypeLabel(selectedType as SellerType),
        onRemove: () => setSelectedType("all"),
      });
    }
    if (selectedRating !== "all") {
      chips.push({
        id: "rating",
        label: `Рейтинг от ${selectedRating}`,
        onRemove: () => setSelectedRating("all"),
      });
    }
    if (selectedCity !== "all") {
      chips.push({
        id: "city",
        label: selectedCity,
        onRemove: () => setSelectedCity("all"),
      });
    }
    if (sortBy !== "rating_desc") {
      const sortLabel =
        sortBy === "newest_desc" ? "Сортировка: новые" : sortBy === "listings_desc" ? "Сортировка: по объявлениям" : sortBy;
      chips.push({
        id: "sort",
        label: sortLabel,
        onRemove: () => setSortBy("rating_desc"),
      });
    }
    return chips;
  }, [query, selectedCity, selectedRating, selectedType, selectedWorld, sortBy]);

  const listingBridgeFromStoreSearch = useMemo(() => {
    const world =
      selectedWorld !== "all" && allStores.some((s) => s.worldHint === selectedWorld)
        ? (selectedWorld as (typeof defaultSavedSearchFilters)["world"])
        : "all";
    return createSearchIntentFromFilters(
      {
        ...defaultSavedSearchFilters,
        world,
        query: query.trim(),
        category: "all",
        location: selectedCity,
      },
      "keyword",
    );
  }, [allStores, query, selectedCity, selectedWorld]);

  return (
    <div className="space-y-4">
      <UnifiedSearchShell
        target="store"
        onTargetChange={() => {}}
        showVerticalTabs={false}
        photoSearch="never"
        query={query}
        onQueryChange={setQuery}
        onQuerySubmit={() => {}}
        placeholder="Название магазина, город или описание"
        belowQuery={
          <SearchActiveFilterChips
            chips={storeActiveChips}
            onClearAll={storeActiveChips.length ? resetFilters : undefined}
            clearAllLabel="Сбросить всё"
          />
        }
        extraControls={hasPersistableSearchIntent(storeIntent) ? <SaveSearchButton intent={storeIntent} /> : null}
      />
      <StoreCatalogHero totalStores={allStores.length} />

      <RecommendedStores stores={recommendedStores} />

      <div className="space-y-1.5">
        <p className="px-1 text-sm font-medium text-slate-600">Тип магазина</p>
        <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-0.5">
          <button
            type="button"
            onClick={() => setSelectedType("all")}
            className={`min-h-11 whitespace-nowrap rounded-full border px-3 py-2 text-sm font-medium transition ${
              selectedType === "all"
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            Все типы
          </button>
          {storeTypeScopeOptions.map((typeId) => (
            <button
              key={typeId}
              type="button"
              onClick={() => setSelectedType(typeId)}
              className={`min-h-11 whitespace-nowrap rounded-full border px-3 py-2 text-sm font-medium transition ${
                selectedType === typeId
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {getSellerTypeLabel(typeId as SellerType)}
            </button>
          ))}
        </div>
      </div>

      <StoreFiltersBar
        hideStoreType
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
        mobileActiveCount={storeFilterDrawerCount}
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
      ) : null}

      {sortedStores.length > 0 && sortedStores.length < 3 ? (
        <section className="rounded-2xl border border-dashed border-slate-200/90 bg-white p-4 shadow-none sm:p-5">
          <h3 className="text-base font-semibold text-slate-900">Не нашли то, что нужно?</h3>
          <p className="mt-1 text-sm text-slate-600">
            Создайте запрос на товар — подставим ваш поиск и город в форму обращения к продавцам.
          </p>
          <Link
            href={buildCreateRequestHrefFromIntent(listingBridgeFromStoreSearch)}
            className={cn(buttonVariants({ variant: "primary", size: "md" }), "mt-3 inline-flex justify-center rounded-xl")}
          >
            Создать запрос
          </Link>
        </section>
      ) : null}

      {!sortedStores.length ? (
        <section className="rounded-2xl border border-slate-200/90 bg-white p-6 text-center shadow-none">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Пока нет магазинов по этому набору фильтров</h2>
          <p className="mt-2 text-sm text-slate-600">
            Попробуйте снять ограничение по рейтингу или городу, либо очистить поисковый запрос. Так вы увидите больше релевантных магазинов.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className={cn(buttonVariants({ variant: "secondary", size: "md" }), "mt-4 justify-center rounded-xl")}
          >
            Сбросить фильтры и показать все магазины
          </button>
          {hasActiveFilters ? (
            <Link
              href={buildCreateRequestHrefFromIntent(listingBridgeFromStoreSearch)}
              className={cn(
                buttonVariants({ variant: "outline", size: "md" }),
                "mt-3 inline-flex w-full justify-center rounded-xl sm:w-auto",
              )}
            >
              Создать запрос
            </Link>
          ) : null}
          {!hasActiveFilters ? (
            <p className="mt-3 text-xs text-slate-500">Каталог пуст только для текущих mock-данных.</p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
