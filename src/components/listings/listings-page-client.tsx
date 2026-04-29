"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createElement, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { catalogWorldLucideIcons } from "@/config/icons";
import { FiltersBar } from "@/components/listings/filters-bar";
import { ListingRefinementsMobileDrawer } from "@/components/listings/listing-refinements-mobile-drawer";
import { ListingsGrid } from "@/components/listings/listings-grid";
import { CatalogCategoryScope } from "@/components/search/catalog-category-scope";
import { SearchActiveFilterChips, type SearchActiveChip } from "@/components/search/search-active-filter-chips";
import { UnifiedSearchShell } from "@/components/search/unified-search-shell";
import { SaveSearchButton } from "@/components/saved-searches/save-search-button";
import { cn } from "@/components/ui/cn";
import { buttonVariants } from "@/lib/button-styles";
import type { SearchIntent } from "@/entities/search/model";
import { StoreCard, type StoreCatalogItem } from "@/components/stores/store-card";
import { WorldIdentityStrip } from "@/components/worlds/world-identity";
import {
  CatalogWorld,
  filterAndSortUnifiedListings,
  getCategoryOptionsForWorld,
  getUniqueLocationsForUnified,
  getWorldLabel,
  getWorldScopedListings,
  ListingsView,
  sortOptions,
  SortOption,
} from "@/lib/listings";
import type { SavedSearchFilters } from "@/lib/saved-searches";
import {
  countListingsDrawerRefinements,
  createSearchIntentFromFilters,
  createStoreSearchIntentFromFilters,
  defaultSavedSearchFilters,
  hasPersistableSearchIntent,
  serializeFiltersToSearchParams,
  serializeStoreFiltersToSearchParams,
  type StoreSearchFilters,
} from "@/lib/saved-searches";
import { getWorldAudienceChips, getWorldOnlineStats } from "@/lib/worlds.community";
import { getWorldPresentation } from "@/lib/worlds";
import { buildReturnTo, withReturnTo } from "@/lib/navigation/return-to";
import { getSellerTypeLabel, storefrontSellers } from "@/lib/sellers";
import { mockAuctionService } from "@/services/auctions";
import { mockListingsService } from "@/services/listings";
import { mockSearchIntentService } from "@/services/search-intent";
import { buildCreateRequestHrefFromIntent } from "@/services/requests/intent-adapter";

type ListingsPageClientProps = {
  initialFilters: SavedSearchFilters;
  initialIntent?: SearchIntent | null;
};

export function ListingsPageClient({ initialFilters, initialIntent }: ListingsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [world] = useState<CatalogWorld>(initialFilters.world);
  const [draftQuery, setDraftQuery] = useState(initialFilters.query);
  const [committedQuery, setCommittedQuery] = useState(initialFilters.query);
  const [category, setCategory] = useState<"all" | string>(initialFilters.category);
  const [location, setLocation] = useState<"all" | string>(initialFilters.location);
  const [saleMode, setSaleMode] = useState(initialFilters.saleMode);
  const [sortBy, setSortBy] = useState<SortOption>(initialFilters.sortBy);
  const [view, setView] = useState<ListingsView>(initialFilters.view);
  const [allWorldListings, setAllWorldListings] = useState(() => getWorldScopedListings(world));
  const [auctionsByListingId, setAuctionsByListingId] = useState<Record<string, Awaited<ReturnType<typeof mockAuctionService.getAll>>[number]>>({});
  const [searchMode, setSearchMode] = useState<SearchIntent["mode"]>(initialIntent?.mode ?? "keyword");
  const [target, setTarget] = useState<SearchIntent["target"]>(initialIntent?.target ?? "listing");
  const [storeDraftQuery, setStoreDraftQuery] = useState(
    initialIntent?.target === "store" ? initialIntent.filters.query ?? "" : "",
  );
  const [storeFilters, setStoreFilters] = useState<StoreSearchFilters>({
    query: initialIntent?.target === "store" ? initialIntent.filters.query ?? "" : "",
    location: initialIntent?.target === "store" ? initialIntent.filters.location ?? "all" : "all",
    specialization:
      initialIntent?.target === "store" && typeof initialIntent.filters.attributes?.specialization === "string"
        ? (initialIntent.filters.attributes.specialization as string)
        : "all",
    verifiedOnly: initialIntent?.target === "store" && initialIntent.filters.attributes?.verifiedOnly === "1",
    storeType:
      initialIntent?.target === "store" && typeof initialIntent.filters.attributes?.storeType === "string"
        ? (initialIntent.filters.attributes.storeType as string)
        : "all",
    sortBy:
      initialIntent?.target === "store" &&
      (initialIntent.sort === "rating_desc" ||
        initialIntent.sort === "listings_desc" ||
        initialIntent.sort === "newest_desc")
        ? (initialIntent.sort as StoreSearchFilters["sortBy"])
        : "rating_desc",
  });
  const lastSyncedUrlRef = useRef<string>("");
  const isMountedRef = useRef(false);
  const [mobileListingFiltersOpen, setMobileListingFiltersOpen] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const worldPresentation = useMemo(() => getWorldPresentation(world), [world]);
  const worldHeroIcon = catalogWorldLucideIcons[world];
  const worldScopedListings = allWorldListings;
  const categoryOptions = useMemo(() => getCategoryOptionsForWorld(world), [world]);
  const locations = useMemo(() => getUniqueLocationsForUnified(worldScopedListings), [worldScopedListings]);
  const worldOnlineStats = useMemo(() => (world === "all" ? null : getWorldOnlineStats(world)), [world]);
  const worldAudienceChips = useMemo(() => (world === "all" ? [] : getWorldAudienceChips(world)), [world]);
  const storeTypeScopeOptions = useMemo(() => {
    const types = Array.from(new Set(storefrontSellers.map((seller) => seller.type)));
    types.sort((a, b) => getSellerTypeLabel(a).localeCompare(getSellerTypeLabel(b), "ru"));
    return types;
  }, []);

  const hasSelectedCategory = useMemo(
    () => categoryOptions.some((option) => option.id === category),
    [category, categoryOptions],
  );
  const resolvedCategory = category === "all" || hasSelectedCategory ? category : "all";

  const catalogListings = useMemo(
    () =>
      filterAndSortUnifiedListings(worldScopedListings, {
        query: committedQuery,
        category: resolvedCategory,
        location,
        saleMode,
        sortBy,
      }),
    [committedQuery, resolvedCategory, location, saleMode, sortBy, worldScopedListings],
  );

  const filtersSnapshot = useMemo(
    () => ({ world, query: committedQuery, category: resolvedCategory, location, saleMode, sortBy, view }),
    [world, committedQuery, resolvedCategory, location, saleMode, sortBy, view],
  );
  const searchIntent = useMemo(() => {
    if (target === "store") {
      return createStoreSearchIntentFromFilters(storeFilters, searchMode);
    }
    return createSearchIntentFromFilters(filtersSnapshot, searchMode);
  }, [target, storeFilters, filtersSnapshot, searchMode]);
  const drawerRefinementCount = useMemo(() => countListingsDrawerRefinements(filtersSnapshot), [filtersSnapshot]);
  const listingActiveChips = useMemo((): SearchActiveChip[] => {
    const chips: SearchActiveChip[] = [];
    const q = committedQuery.trim();
    if (q) {
      chips.push({
        id: "q",
        label: `Запрос: ${q.length > 36 ? `${q.slice(0, 36)}…` : q}`,
        onRemove: () => {
          setSearchMode("keyword");
          setDraftQuery("");
          setCommittedQuery("");
        },
      });
    }
    if (resolvedCategory !== "all") {
      const catLabel = categoryOptions.find((o) => o.id === resolvedCategory)?.label ?? resolvedCategory;
      chips.push({
        id: "cat",
        label: catLabel,
        onRemove: () => {
          setSearchMode("keyword");
          setCategory("all");
        },
      });
    }
    if (location !== "all") {
      chips.push({
        id: "loc",
        label: location,
        onRemove: () => {
          setSearchMode("keyword");
          setLocation("all");
        },
      });
    }
    if (saleMode !== defaultSavedSearchFilters.saleMode) {
      const saleLabel =
        saleMode === "fixed" ? "Продажа" : saleMode === "auction" ? "Аукцион" : saleMode === "free" ? "Бесплатно" : saleMode;
      chips.push({
        id: "sale",
        label: saleLabel,
        onRemove: () => {
          setSearchMode("keyword");
          setSaleMode("all");
        },
      });
    }
    if (sortBy !== defaultSavedSearchFilters.sortBy) {
      chips.push({
        id: "sort",
        label: sortOptions[sortBy],
        onRemove: () => {
          setSearchMode("keyword");
          setSortBy(defaultSavedSearchFilters.sortBy);
        },
      });
    }
    return chips;
  }, [categoryOptions, committedQuery, location, resolvedCategory, saleMode, sortBy]);
  const clearListingDiscoveryFilters = useCallback(() => {
    setSearchMode("keyword");
    setDraftQuery("");
    setCommittedQuery("");
    setCategory("all");
    setLocation("all");
    setSaleMode(defaultSavedSearchFilters.saleMode);
    setSortBy(defaultSavedSearchFilters.sortBy);
    setView(defaultSavedSearchFilters.view);
  }, []);
  const storeRequestBridgeIntent = useMemo(
    () =>
      createSearchIntentFromFilters(
        {
          ...filtersSnapshot,
          query: storeFilters.query.trim() || storeDraftQuery.trim(),
          category: "all",
          location: storeFilters.location,
          saleMode: defaultSavedSearchFilters.saleMode,
          sortBy: defaultSavedSearchFilters.sortBy,
        },
        "keyword",
      ),
    [filtersSnapshot, storeDraftQuery, storeFilters.location, storeFilters.query],
  );
  const returnTo = useMemo(() => {
    const params = serializeFiltersToSearchParams(filtersSnapshot);
    return buildReturnTo(pathname, params.toString());
  }, [filtersSnapshot, pathname]);
  const catalogListingsWithReturnTo = useMemo(
    () =>
      catalogListings.map((listing) => ({
        ...listing,
        detailsHref: withReturnTo(listing.detailsHref, returnTo),
      })),
    [catalogListings, returnTo],
  );
  const storeResults = useMemo<StoreCatalogItem[]>(() => {
    if (target !== "store") {
      return [];
    }
    const normalized = storeFilters.query.trim().toLowerCase();
    const filtered = storefrontSellers.filter((seller) => {
      if (
        normalized &&
        !`${seller.storefrontName} ${seller.shortDescription} ${seller.city}`.toLowerCase().includes(normalized)
      ) {
        return false;
      }
      if (storeFilters.location !== "all" && seller.city !== storeFilters.location) {
        return false;
      }
      if (
        storeFilters.specialization !== "all" &&
        !seller.shortDescription.toLowerCase().includes(storeFilters.specialization.toLowerCase())
      ) {
        return false;
      }
      if (storeFilters.verifiedOnly && seller.trustBadges.length === 0) {
        return false;
      }
      if (storeFilters.storeType !== "all" && seller.type !== storeFilters.storeType) {
        return false;
      }
      return true;
    });
    return filtered.map((seller) => ({
      id: seller.id,
      href: `/stores/${seller.id}`,
      avatarLabel: seller.avatarLabel,
      storefrontName: seller.storefrontName,
      specializationLabel: seller.shortDescription,
      shortDescription: seller.shortDescription,
      city: seller.city,
      rating: seller.metrics.rating,
      reviewsCount: Math.max(8, Math.round(seller.followersCount * 0.16)),
      activeListingsCount: seller.metrics.activeListingsCount,
      trustBadges: seller.trustBadges.map((item) => item.label),
    }));
  }, [target, storeFilters]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCommittedQuery((prev) => (prev === draftQuery ? prev : draftQuery));
    }, 320);
    return () => window.clearTimeout(timer);
  }, [draftQuery]);

  useEffect(() => {
    if (target !== "store") {
      return;
    }
    const timer = window.setTimeout(() => {
      setStoreFilters((prev) => (prev.query === storeDraftQuery ? prev : { ...prev, query: storeDraftQuery }));
    }, 320);
    return () => window.clearTimeout(timer);
  }, [storeDraftQuery, target]);

  useEffect(() => {
    if (!isMountedRef.current) {
      return;
    }
    const params = serializeFiltersToSearchParams(filtersSnapshot);
    const paramsForTarget = target === "store" ? serializeStoreFiltersToSearchParams(storeFilters) : params;
    paramsForTarget.set("target", target);
    paramsForTarget.set("mode", searchMode);
    const next = paramsForTarget.toString();
    const href = next ? `${pathname}?${next}` : pathname;
    if (lastSyncedUrlRef.current === href) {
      return;
    }
    lastSyncedUrlRef.current = href;
    router.replace(href);
  }, [filtersSnapshot, pathname, router, searchMode, target, storeFilters]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [listings, auctions] = await Promise.all([
        mockListingsService.getAll({ world }),
        mockAuctionService.getAll(),
      ]);
      if (cancelled) {
        return;
      }
      setAllWorldListings(listings);
      setAuctionsByListingId(
        auctions.reduce<Record<string, (typeof auctions)[number]>>((acc, auction) => {
          acc[auction.listingId] = auction;
          return acc;
        }, {}),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [world]);

  return (
    <div className={`space-y-3 rounded-3xl p-3 sm:p-4 ${worldPresentation.pageToneClass}`}>
      <section className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 ${worldPresentation.heroToneClass}`}>
        <div className={`pointer-events-none absolute inset-0 ${worldPresentation.heroDecorClass}`} />
        <div className="relative space-y-2">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-80">
            {createElement(worldHeroIcon, { className: "h-4 w-4", strokeWidth: 1.5 })}
            Каталог мира
          </p>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{worldPresentation.title}</h2>
          <p className="text-sm opacity-90 sm:max-w-2xl">{worldPresentation.subtitle}</p>
        </div>
      </section>

      {world !== "all" ? (
        <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-3 shadow-none">
          <WorldIdentityStrip
            world={world}
            chips={worldAudienceChips}
            usersOnline={worldOnlineStats?.usersOnline}
            shopsOnline={worldOnlineStats?.shopsOnline}
            contextLine="Плотный каталог внутри выбранного мира"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Link
              href={`/worlds/${world}`}
              className={cn(buttonVariants({ variant: "secondary", size: "md" }), "rounded-xl")}
            >
              Вернуться в мир
            </Link>
            <Link href="/worlds" className={cn(buttonVariants({ variant: "secondary", size: "md" }), "rounded-xl")}>
              Все миры
            </Link>
          </div>
        </div>
      ) : null}

      <UnifiedSearchShell
        target={target}
        onTargetChange={(next) => {
          if (next === target) {
            return;
          }
          setSearchMode("keyword");
          if (next === "store") {
            const listingText = draftQuery.trim() || committedQuery.trim();
            setStoreDraftQuery((prev) => (prev.trim() ? prev : listingText));
            setStoreFilters((prev) => ({
              ...prev,
              query: prev.query.trim() ? prev.query : listingText,
            }));
            setTarget("store");
            return;
          }
          const storeText = storeDraftQuery.trim() || storeFilters.query.trim();
          setDraftQuery((prev) => (prev.trim() ? prev : storeText));
          setCommittedQuery((prev) => {
            const nextQuery = storeText || prev;
            return nextQuery;
          });
          setTarget("listing");
        }}
        query={target === "store" ? storeDraftQuery : draftQuery}
        onQueryChange={(value) => {
          setSearchMode("keyword");
          if (target === "store") {
            setStoreDraftQuery(value);
            return;
          }
          setDraftQuery(value);
        }}
        onQuerySubmit={() => {
          setSearchMode("keyword");
          if (target === "store") {
            setStoreFilters((prev) => ({ ...prev, query: storeDraftQuery }));
            return;
          }
          setCommittedQuery(draftQuery);
        }}
        onPhotoSearch={() => {
          void mockSearchIntentService
            .fromImageSearch({
              imageUrl: "https://example.com/chair.jpg",
              inferredCategory: "furniture",
              traits: ["красное кресло", "ткань", "современный стиль"],
            })
            .then((intent) => {
              setTarget("listing");
              setSearchMode("image");
              setDraftQuery(intent.filters.query ?? "");
              setCommittedQuery(intent.filters.query ?? "");
              setCategory(intent.filters.categoryId ?? "all");
            });
        }}
        placeholder={
          target === "store" ? "Название магазина, город, описание…" : "Что ищете? Название, бренд, модель…"
        }
        belowQuery={
          target === "listing" ? (
            <SearchActiveFilterChips
              chips={listingActiveChips}
              onClearAll={listingActiveChips.length ? clearListingDiscoveryFilters : undefined}
              clearAllLabel="Сбросить всё"
            />
          ) : null
        }
        extraControls={hasPersistableSearchIntent(searchIntent) ? <SaveSearchButton intent={searchIntent} /> : null}
      />

      {target === "listing" ? (
        <CatalogCategoryScope
          categoryOptions={categoryOptions}
          resolvedCategory={resolvedCategory}
          onCategoryChange={(id) => setCategory(id)}
          onInteract={() => setSearchMode("keyword")}
        />
      ) : (
        <div className="space-y-2">
          <div className="space-y-1.5 rounded-xl border border-slate-200/90 bg-white/80 px-2 py-2 shadow-none">
            <p className="px-1 text-sm font-medium text-slate-600">Тип магазина</p>
            <div className="no-scrollbar flex flex-wrap items-center gap-1.5 px-1 pb-0.5">
              {(["all", ...storeTypeScopeOptions] as const).map((id) => (
                <button
                  key={id === "all" ? "all" : id}
                  type="button"
                  onClick={() => {
                    setSearchMode("keyword");
                    setStoreFilters((prev) => ({
                      ...prev,
                      storeType: id === "all" ? "all" : id,
                      specialization: "all",
                    }));
                  }}
                  className={`min-h-11 whitespace-nowrap rounded-full border px-3 py-2 text-sm font-medium transition ${
                    (id === "all" && storeFilters.storeType === "all") ||
                    (id !== "all" && storeFilters.storeType === id)
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {id === "all" ? "Все типы" : getSellerTypeLabel(id)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-2 rounded-lg border border-slate-100/80 bg-slate-50/40 p-2.5 sm:grid-cols-2 sm:p-3">
            <select
              value={storeFilters.location}
              onChange={(event) => {
                setSearchMode("keyword");
                setStoreFilters((prev) => ({ ...prev, location: event.target.value }));
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="all">Все города</option>
              {Array.from(new Set(storefrontSellers.map((item) => item.city))).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <label className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm">
              <input
                type="checkbox"
                checked={storeFilters.verifiedOnly}
                onChange={(event) => {
                  setSearchMode("keyword");
                  setStoreFilters((prev) => ({ ...prev, verifiedOnly: event.target.checked }));
                }}
              />
              Только проверенные
            </label>
          </div>
        </div>
      )}

      {target === "listing" ? (
        <>
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileListingFiltersOpen(true)}
              className={cn(
                buttonVariants({ variant: "secondary", size: "md" }),
                "min-h-11 flex-1 justify-center rounded-xl font-semibold",
              )}
            >
              Фильтры{drawerRefinementCount > 0 ? ` (${drawerRefinementCount})` : ""}
            </button>
          </div>
          <ListingRefinementsMobileDrawer
            open={mobileListingFiltersOpen}
            onClose={() => setMobileListingFiltersOpen(false)}
            title={`Фильтры${drawerRefinementCount > 0 ? ` (${drawerRefinementCount})` : ""}`}
          >
            <FiltersBar
              variant="refinements-only"
              hideCategory
              category={resolvedCategory}
              onCategoryChange={(value) => {
                setSearchMode("keyword");
                setCategory(value);
              }}
              categoryOptions={categoryOptions}
              location={location}
              onLocationChange={(value) => {
                setSearchMode("keyword");
                setLocation(value);
              }}
              locations={locations}
              saleMode={saleMode}
              onSaleModeChange={(value) => {
                setSearchMode("keyword");
                setSaleMode(value);
              }}
              sortBy={sortBy}
              onSortChange={(value) => {
                setSearchMode("keyword");
                setSortBy(value);
              }}
              view={view}
              onViewChange={(value) => {
                setSearchMode("keyword");
                setView(value);
              }}
              actions={null}
              className=""
            />
          </ListingRefinementsMobileDrawer>
          <div className="hidden md:block">
            <FiltersBar
              variant="refinements-only"
              hideCategory
              category={resolvedCategory}
              onCategoryChange={(value) => {
                setSearchMode("keyword");
                setCategory(value);
              }}
              categoryOptions={categoryOptions}
              location={location}
              onLocationChange={(value) => {
                setSearchMode("keyword");
                setLocation(value);
              }}
              locations={locations}
              saleMode={saleMode}
              onSaleModeChange={(value) => {
                setSearchMode("keyword");
                setSaleMode(value);
              }}
              sortBy={sortBy}
              onSortChange={(value) => {
                setSearchMode("keyword");
                setSortBy(value);
              }}
              view={view}
              onViewChange={(value) => {
                setSearchMode("keyword");
                setView(value);
              }}
              actions={null}
              className=""
            />
          </div>
        </>
      ) : null}
      {target === "listing" ? (
      <section className="hidden rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 shadow-none md:block">
        <p className="text-sm font-medium text-slate-600">Smart Search demo</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              void mockSearchIntentService
                .fromNaturalLanguage("Хочу красный угловой диван в Москве до 80к")
                .then((intent) => {
                  setSearchMode("natural_language");
                  setDraftQuery(intent.filters.query ?? "");
                  setCommittedQuery(intent.filters.query ?? "");
                  setCategory(intent.filters.categoryId ?? "all");
                  setLocation(intent.filters.location ?? "all");
                });
            }}
            className={cn(buttonVariants({ variant: "secondary", size: "md" }), "rounded-xl bg-white")}
          >
            AI query: &quot;красный диван&quot;
          </button>
          <button
            type="button"
            onClick={() => {
              void mockSearchIntentService
                .fromImageSearch({
                  imageUrl: "https://example.com/chair.jpg",
                  inferredCategory: "furniture",
                  traits: ["красное кресло", "ткань", "современный стиль"],
                })
                .then((intent) => {
                  setSearchMode("image");
                  setDraftQuery(intent.filters.query ?? "");
                  setCommittedQuery(intent.filters.query ?? "");
                  setCategory(intent.filters.categoryId ?? "all");
                });
            }}
            className={cn(buttonVariants({ variant: "secondary", size: "md" }), "rounded-xl bg-white")}
          >
            Photo search demo
          </button>
        </div>
      </section>
      ) : null}

      {target === "listing" ? (
      <p className="text-sm text-slate-600">
        Найдено объявлений: <span className="font-semibold text-slate-700">{catalogListings.length}</span>
        <span className="ml-1 text-slate-500">· сортировка: {sortOptions[sortBy].toLowerCase()}</span>
        {world !== "all" ? <span className="ml-1 text-slate-500">· мир: {getWorldLabel(world)}</span> : null}
      </p>
      ) : (
      <p className="text-sm text-slate-600">
        Найдено магазинов: <span className="font-semibold text-slate-700">{storeResults.length}</span>
      </p>
      )}

      {target === "listing" ? (
      <ListingsGrid
        listings={catalogListingsWithReturnTo}
        auctionsByListingId={auctionsByListingId}
        view={view}
        emptyStateClassName={worldPresentation.sectionToneClass}
        emptyTitle="Пока нет объявлений"
        emptyMessage={
          world === "all"
            ? "Ничего не найдено. Попробуйте уточнить фильтры или переключиться в тематический мир."
            : `В мире «${getWorldLabel(world)}» пока нет карточек под ваш запрос.`
        }
      />
      ) : (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {storeResults.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </section>
      )}

      {target === "listing" && catalogListings.length < 3 ? (
        <section className="rounded-2xl border border-dashed border-slate-200/90 bg-white p-4 shadow-none sm:p-5">
          <h3 className="text-base font-semibold text-slate-900">Не нашли то, что нужно?</h3>
          <p className="mt-1 text-sm text-slate-600">
            Создайте запрос — перенесём текущий поиск и фильтры в форму, чтобы продавцы могли откликнуться предложениями.
          </p>
          <Link
            href={buildCreateRequestHrefFromIntent(searchIntent)}
            className={cn(buttonVariants({ variant: "primary", size: "md" }), "mt-3 inline-flex justify-center rounded-xl")}
          >
            Создать запрос
          </Link>
        </section>
      ) : null}

      {target === "store" && storeResults.length < 3 ? (
        <section className="rounded-2xl border border-dashed border-slate-200/90 bg-white p-4 shadow-none sm:p-5">
          <h3 className="text-base font-semibold text-slate-900">Не нашли то, что нужно?</h3>
          <p className="mt-1 text-sm text-slate-600">
            Опишите запрос на товар — подставим ваш поиск по магазинам в черновик обращения к продавцам.
          </p>
          <Link
            href={buildCreateRequestHrefFromIntent(storeRequestBridgeIntent)}
            className={cn(buttonVariants({ variant: "primary", size: "md" }), "mt-3 inline-flex justify-center rounded-xl")}
          >
            Создать запрос
          </Link>
        </section>
      ) : null}
    </div>
  );
}
