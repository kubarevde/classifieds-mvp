"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { HeroBoardPlacementCard } from "@/components/hero-board/hero-board-placement-card";
import { DiscoveryFlowModal } from "@/components/agriculture/discovery-flow-modal";
import { ElectronicsDiscoveryFlowModal } from "@/components/electronics/electronics-discovery-flow-modal";
import { FiltersBar } from "@/components/listings/filters-bar";
import { ListingsGrid } from "@/components/listings/listings-grid";
import { SaveSearchButton } from "@/components/saved-searches/save-search-button";
import {
  CatalogWorld,
  filterAndSortUnifiedListings,
  getCategoryOptionsForWorld,
  getUniqueLocationsForUnified,
  getWorldScopedListings,
  getWorldLabel,
  worldOptions,
  worldQuickFilters,
  ListingsView,
  sortOptions,
  SortOption,
  UnifiedCatalogListing,
} from "@/lib/listings";
import {
  DISCOVERY_DEFAULT_CITY,
  DiscoveryAnswers,
  DiscoveryListing,
  ElectronicsDiscoveryAnswers,
  resolveDiscoveryListings,
  resolveElectronicsDiscoveryListings,
} from "@/lib/discovery";
import { getActiveHeroBannerForWorld } from "@/lib/hero-board";
import type { SavedSearchFilters } from "@/lib/saved-searches";
import { getWorldPresentation } from "@/lib/worlds";

type ListingsPageClientProps = {
  initialFilters: SavedSearchFilters;
};

export function ListingsPageClient({ initialFilters }: ListingsPageClientProps) {
  const [world, setWorld] = useState<CatalogWorld>(initialFilters.world);
  const [query, setQuery] = useState(initialFilters.query);
  const [category, setCategory] = useState<"all" | string>(initialFilters.category);
  const [location, setLocation] = useState<"all" | string>(initialFilters.location);
  const [sortBy, setSortBy] = useState<SortOption>(initialFilters.sortBy);
  const [view, setView] = useState<ListingsView>(initialFilters.view);
  const [isAgriDiscoveryOpen, setIsAgriDiscoveryOpen] = useState(false);
  const [agriDiscoveryAnswers, setAgriDiscoveryAnswers] = useState<DiscoveryAnswers | null>(null);
  const [isElectronicsDiscoveryOpen, setIsElectronicsDiscoveryOpen] = useState(false);
  const [electronicsDiscoveryAnswers, setElectronicsDiscoveryAnswers] =
    useState<ElectronicsDiscoveryAnswers | null>(null);

  const worldPresentation = useMemo(() => getWorldPresentation(world), [world]);
  const worldScopedListings = useMemo(() => getWorldScopedListings(world), [world]);
  const categoryOptions = useMemo(() => getCategoryOptionsForWorld(world), [world]);
  const quickFilters = useMemo(() => worldQuickFilters[world], [world]);
  const locations = useMemo(() => getUniqueLocationsForUnified(worldScopedListings), [worldScopedListings]);

  const hasSelectedCategory = useMemo(
    () => categoryOptions.some((option) => option.id === category),
    [category, categoryOptions],
  );
  const resolvedCategory = category === "all" || hasSelectedCategory ? category : "all";

  const visibleListings = useMemo(
    () =>
      filterAndSortUnifiedListings(worldScopedListings, {
        query,
        category: resolvedCategory,
        location,
        sortBy,
      }),
    [query, resolvedCategory, location, sortBy, worldScopedListings],
  );

  const agriDiscoveryListings = useMemo<DiscoveryListing[]>(() => {
    if (!agriDiscoveryAnswers || world !== "agriculture") {
      return [];
    }

    return resolveDiscoveryListings(agriDiscoveryAnswers, DISCOVERY_DEFAULT_CITY, {
      world: "agriculture",
    });
  }, [agriDiscoveryAnswers, world]);

  const electronicsDiscoveryListings = useMemo<DiscoveryListing[]>(() => {
    if (!electronicsDiscoveryAnswers || world !== "electronics") {
      return [];
    }

    return resolveElectronicsDiscoveryListings(electronicsDiscoveryAnswers, DISCOVERY_DEFAULT_CITY);
  }, [electronicsDiscoveryAnswers, world]);

  const handleElectronicsDiscoveryApply = (answers: ElectronicsDiscoveryAnswers) => {
    setElectronicsDiscoveryAnswers(answers);

    const queryByUseCase: Record<ElectronicsDiscoveryAnswers["useCase"], string> = {
      work: "ноут",
      gaming: "игров",
      content: "камера",
      cheap: "смартфон",
      study: "смартфон",
    };
    setQuery(queryByUseCase[answers.useCase]);
    setCategory("all");
    setSortBy(answers.budget === "budget" ? "price_asc" : "newest");
  };

  const handleWorldChange = (nextWorld: CatalogWorld) => {
    setWorld(nextWorld);
    setCategory("all");
    setLocation("all");
    setQuery("");
    setSortBy("newest");
    setAgriDiscoveryAnswers(null);
    setElectronicsDiscoveryAnswers(null);
  };

  const filtersSnapshot = useMemo(
    () => ({ world, query, category: resolvedCategory, location, sortBy, view }),
    [world, query, resolvedCategory, location, sortBy, view],
  );

  const activeDiscoveryListings = useMemo(
    () =>
      world === "agriculture" && agriDiscoveryAnswers
        ? agriDiscoveryListings
        : world === "electronics" && electronicsDiscoveryAnswers
          ? electronicsDiscoveryListings
          : [],
    [
      world,
      agriDiscoveryAnswers,
      agriDiscoveryListings,
      electronicsDiscoveryAnswers,
      electronicsDiscoveryListings,
    ],
  );

  const discoveryModeIsActive = useMemo(() => activeDiscoveryListings.length > 0, [activeDiscoveryListings]);

  const catalogListings: UnifiedCatalogListing[] = useMemo(() => {
    if (!discoveryModeIsActive) {
      return visibleListings;
    }

    return activeDiscoveryListings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      priceValue: listing.priceValue,
      location: listing.location,
      publishedAt: listing.publishedAt,
      postedAtIso: new Date().toISOString(),
      image: listing.image,
      condition: listing.condition,
      description: listing.description,
      sellerName: listing.sellerName,
      sellerPhone: listing.sellerPhone,
      categoryId: listing.categoryLabel.toLowerCase().replace(/\s+/g, "_"),
      categoryLabel: listing.categoryLabel,
      world: world === "agriculture" ? "agriculture" : world === "electronics" ? "electronics" : "base",
      worldLabel: listing.themeLabel,
    }));
  }, [activeDiscoveryListings, discoveryModeIsActive, visibleListings, world]);

  const discoveryPreviewText = activeDiscoveryListings.slice(0, 3).map((item) => item.title).join(" · ");
  const worldHeroPlacement = useMemo(
    () => (world === "all" ? null : getActiveHeroBannerForWorld(world)),
    [world],
  );

  const railsWithListings = useMemo(() => {
    if (world === "all") {
      return [];
    }

    return worldPresentation.rails.map((rail) => {
      const byQuery = worldScopedListings.filter((listing) =>
        `${listing.title} ${listing.description} ${listing.categoryLabel}`
          .toLowerCase()
          .includes(rail.query.toLowerCase()),
      );

      const byCategory = rail.categoryId
        ? worldScopedListings.filter((listing) => listing.categoryId === rail.categoryId)
        : [];

      const candidates = [...byCategory, ...byQuery].filter(
        (listing, index, array) => array.findIndex((current) => current.id === listing.id) === index,
      );

      return { ...rail, listings: candidates.slice(0, 5) };
    });
  }, [world, worldPresentation.rails, worldScopedListings]);

  const openDiscovery = () => {
    if (world === "agriculture") {
      setIsAgriDiscoveryOpen(true);
    }
    if (world === "electronics") {
      setIsElectronicsDiscoveryOpen(true);
    }
  };
  const discoveryAvailable = world === "agriculture" || world === "electronics";

  return (
    <div className={`space-y-4 rounded-3xl p-2 sm:p-3 ${worldPresentation.pageToneClass}`}>
      <section className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 ${worldPresentation.heroToneClass}`}>
        <div className={`pointer-events-none absolute inset-0 ${worldPresentation.heroDecorClass}`} />
        <div className="pointer-events-none absolute -right-16 -top-14 h-44 w-44 rounded-full bg-white/25 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-8 h-28 w-28 rounded-full bg-white/20 blur-xl" />
        <div className="relative space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">Immersive world mode</p>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                <span className="mr-2">{worldPresentation.heroIcon}</span>
                {worldPresentation.title}
              </h2>
              <p className="text-sm opacity-90 sm:max-w-2xl sm:text-base">{worldPresentation.heroDescription}</p>
            </div>
            <button
              type="button"
              onClick={openDiscovery}
              disabled={!discoveryAvailable}
              className="rounded-xl border border-white/30 bg-black/25 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/35 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {discoveryAvailable ? worldPresentation.discovery.primaryCtaLabel : "Guided-подбор скоро"}
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {worldPresentation.highlights.map((item) => (
              <p key={item} className="rounded-xl border border-white/20 bg-white/15 px-3 py-2 text-xs sm:text-sm">
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className={`rounded-2xl border p-4 ${worldPresentation.sectionToneClass}`}>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Мир (режим платформы)
          </p>
          <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
            {worldOptions.map((option) => {
              const isActive = option.id === world;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleWorldChange(option.id)}
                  className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    isActive ? worldPresentation.chipActiveClass : worldPresentation.chipInactiveClass
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
            {quickFilters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setQuery(item.query);
                  setCategory(item.categoryId ?? "all");
                }}
                className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Мир задаёт контекст выдачи, а категория в фильтрах ниже уточняет тип объявлений внутри выбранного мира.
          </p>
        </div>
      </section>

      <section className={`rounded-2xl border p-4 ${worldPresentation.sectionToneClass}`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{worldPresentation.discovery.eyebrow}</p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{worldPresentation.discovery.title}</h3>
        <p className="mt-1 text-sm text-slate-600">{worldPresentation.discovery.description}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {worldPresentation.discovery.steps.map((step, index) => (
            <div key={step} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <span className="mr-1 text-xs text-slate-400">{index + 1}.</span>
              {step}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openDiscovery}
            disabled={!discoveryAvailable}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {discoveryAvailable ? worldPresentation.discovery.primaryCtaLabel : "Guided-подбор скоро"}
          </button>
          {worldPresentation.discovery.secondaryOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setQuery(option.query);
                setCategory(option.categoryId ?? "all");
              }}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {discoveryModeIsActive
            ? `Рекомендации: ${discoveryPreviewText}`
            : worldPresentation.discovery.resultLabel}
        </p>
      </section>

      {worldHeroPlacement ? (
        <section className={`space-y-2 rounded-2xl border p-3 ${worldPresentation.sectionToneClass}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">Герой мира</p>
            <Link href="/sponsor-board" className="text-xs font-semibold text-slate-600 transition hover:text-slate-900">
              Как попасть в этот слот?
            </Link>
          </div>
          <HeroBoardPlacementCard placement={worldHeroPlacement} compact />
        </section>
      ) : null}

      {world !== "all" ? (
        <section className="space-y-3">
          {railsWithListings.map((rail) => (
            <article key={rail.id} className={`rounded-2xl border p-4 ${worldPresentation.sectionToneClass}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    <span className="mr-1">{rail.icon}</span>
                    {rail.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">{rail.description}</p>
                </div>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {rail.listings.map((listing) => {
                  const href =
                    listing.detailsHref ??
                    `/listings?world=${world}&q=${encodeURIComponent(listing.title.split(" ").slice(0, 2).join(" "))}`;
                  return (
                    <Link
                      key={listing.id}
                      href={href}
                      className="group rounded-xl border border-slate-200 bg-white p-2.5 transition hover:border-slate-300 hover:shadow-sm"
                    >
                      <p className="line-clamp-1 text-xs font-medium text-slate-500">{listing.categoryLabel}</p>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">{listing.title}</p>
                      <p className="mt-1 text-xs text-slate-600">{listing.price}</p>
                    </Link>
                  );
                })}
              </div>
            </article>
          ))}
        </section>
      ) : null}

      <FiltersBar
        query={query}
        onQueryChange={setQuery}
        category={resolvedCategory}
        onCategoryChange={setCategory}
        categoryOptions={categoryOptions}
        location={location}
        onLocationChange={setLocation}
        locations={locations}
        sortBy={sortBy}
        onSortChange={setSortBy}
        view={view}
        onViewChange={setView}
        actions={<SaveSearchButton filters={filtersSnapshot} />}
        className={worldPresentation.sectionToneClass}
      />

      <p className="text-sm text-slate-500">
        Найдено объявлений: <span className="font-semibold text-slate-700">{catalogListings.length}</span>
        <span className="ml-1 text-slate-400">· сортировка: {sortOptions[sortBy].toLowerCase()}</span>
      </p>
      <ListingsGrid
        listings={catalogListings}
        view={view}
        emptyStateClassName={worldPresentation.sectionToneClass}
        emptyMessage={
          world === "all"
            ? "Ничего не найдено. Попробуйте уточнить фильтры или переключиться в тематический мир."
            : `В мире «${getWorldLabel(world)}» пока нет карточек под ваш запрос. Попробуйте другой сценарий или сбросьте фильтры.`
        }
      />

      <section className={`rounded-2xl border p-3 ${worldPresentation.sectionToneClass}`}>
        <p className="text-xs text-slate-600">{worldPresentation.supportStrip}</p>
      </section>

      <DiscoveryFlowModal
        isOpen={isAgriDiscoveryOpen}
        onClose={() => setIsAgriDiscoveryOpen(false)}
        onComplete={(answers) => setAgriDiscoveryAnswers(answers)}
      />
      <ElectronicsDiscoveryFlowModal
        isOpen={isElectronicsDiscoveryOpen}
        onClose={() => setIsElectronicsDiscoveryOpen(false)}
        onComplete={handleElectronicsDiscoveryApply}
      />
    </div>
  );
}
