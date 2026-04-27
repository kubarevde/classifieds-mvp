"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createElement, useEffect, useMemo, useState } from "react";

import { catalogWorldLucideIcons } from "@/config/icons";
import { FiltersBar } from "@/components/listings/filters-bar";
import { ListingsGrid } from "@/components/listings/listings-grid";
import { SaveSearchButton } from "@/components/saved-searches/save-search-button";
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
import { serializeFiltersToSearchParams } from "@/lib/saved-searches";
import { getWorldAudienceChips, getWorldOnlineStats } from "@/lib/worlds.community";
import { getWorldPresentation } from "@/lib/worlds";
import { buildReturnTo, withReturnTo } from "@/lib/navigation/return-to";
import { mockAuctionService } from "@/services/auctions";
import { mockListingsService } from "@/services/listings";

type ListingsPageClientProps = {
  initialFilters: SavedSearchFilters;
};

export function ListingsPageClient({ initialFilters }: ListingsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [world] = useState<CatalogWorld>(initialFilters.world);
  const [query, setQuery] = useState(initialFilters.query);
  const [category, setCategory] = useState<"all" | string>(initialFilters.category);
  const [location, setLocation] = useState<"all" | string>(initialFilters.location);
  const [saleMode, setSaleMode] = useState(initialFilters.saleMode);
  const [sortBy, setSortBy] = useState<SortOption>(initialFilters.sortBy);
  const [view, setView] = useState<ListingsView>(initialFilters.view);
  const [allWorldListings, setAllWorldListings] = useState(() => getWorldScopedListings(world));
  const [auctionsByListingId, setAuctionsByListingId] = useState<Record<string, Awaited<ReturnType<typeof mockAuctionService.getAll>>[number]>>({});

  const worldPresentation = useMemo(() => getWorldPresentation(world), [world]);
  const worldHeroIcon = catalogWorldLucideIcons[world];
  const worldScopedListings = allWorldListings;
  const categoryOptions = useMemo(() => getCategoryOptionsForWorld(world), [world]);
  const locations = useMemo(() => getUniqueLocationsForUnified(worldScopedListings), [worldScopedListings]);
  const worldOnlineStats = useMemo(() => (world === "all" ? null : getWorldOnlineStats(world)), [world]);
  const worldAudienceChips = useMemo(() => (world === "all" ? [] : getWorldAudienceChips(world)), [world]);

  const hasSelectedCategory = useMemo(
    () => categoryOptions.some((option) => option.id === category),
    [category, categoryOptions],
  );
  const resolvedCategory = category === "all" || hasSelectedCategory ? category : "all";

  const catalogListings = useMemo(
    () =>
      filterAndSortUnifiedListings(worldScopedListings, {
        query,
        category: resolvedCategory,
        location,
        saleMode,
        sortBy,
      }),
    [query, resolvedCategory, location, saleMode, sortBy, worldScopedListings],
  );

  const filtersSnapshot = useMemo(
    () => ({ world, query, category: resolvedCategory, location, saleMode, sortBy, view }),
    [world, query, resolvedCategory, location, saleMode, sortBy, view],
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

  useEffect(() => {
    const params = serializeFiltersToSearchParams(filtersSnapshot);
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname);
  }, [filtersSnapshot, pathname, router]);

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
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-3">
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
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Вернуться в мир
            </Link>
            <Link
              href="/worlds"
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Все миры
            </Link>
          </div>
        </div>
      ) : null}

      <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
        {[...new Set(["all", ...categoryOptions.map((option) => option.id)])].slice(0, 6).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setCategory(id)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              resolvedCategory === id
                ? "border-slate-400 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {id === "all" ? "Все категории" : categoryOptions.find((item) => item.id === id)?.label ?? id}
          </button>
        ))}
      </div>
      <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
        <button
          type="button"
          onClick={() => setSaleMode("auction")}
          className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            saleMode === "auction"
              ? "border-indigo-500 bg-indigo-600 text-white"
              : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          }`}
        >
          Только аукционы
        </button>
        <button
          type="button"
          onClick={() => setSaleMode("all")}
          className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Сбросить режим
        </button>
      </div>

      <FiltersBar
        query={query}
        onQueryChange={setQuery}
        category={resolvedCategory}
        onCategoryChange={setCategory}
        categoryOptions={categoryOptions}
        location={location}
        onLocationChange={setLocation}
        locations={locations}
        saleMode={saleMode}
        onSaleModeChange={setSaleMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
        view={view}
        onViewChange={setView}
        actions={<SaveSearchButton filters={filtersSnapshot} />}
        className={worldPresentation.sectionToneClass}
      />

      <p className="text-sm text-slate-600">
        Найдено объявлений: <span className="font-semibold text-slate-700">{catalogListings.length}</span>
        <span className="ml-1 text-slate-500">· сортировка: {sortOptions[sortBy].toLowerCase()}</span>
        {world !== "all" ? <span className="ml-1 text-slate-500">· мир: {getWorldLabel(world)}</span> : null}
      </p>

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
    </div>
  );
}
