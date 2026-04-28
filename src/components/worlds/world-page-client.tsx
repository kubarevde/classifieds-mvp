"use client";

import Link from "next/link";
import { createElement, useEffect, useMemo, useState } from "react";

import { ListingPreviewCard } from "@/components/listings/listing-preview-card";
import { PageShell, SectionCard } from "@/components/platform";
import { StoreCard, type StoreCatalogItem } from "@/components/stores/store-card";
import { WorldChat } from "@/components/worlds/world-chat";
import { WorldIdentityStrip } from "@/components/worlds/world-identity";
import { CatalogCategoryScope } from "@/components/search/catalog-category-scope";
import { WorldSearch } from "@/components/worlds/world-search";
import { catalogWorldLucideIcons } from "@/config/icons";
import {
  filterAndSortUnifiedListings,
  getCategoryOptionsForWorld,
  getUniqueLocationsForUnified,
  getWorldLabel,
  type CatalogWorld,
  type UnifiedCatalogListing,
} from "@/lib/listings";
import {
  getWorldAudienceChips,
  getWorldBroadcast,
  getWorldCuratedScenarios,
  getWorldOnlineStats,
  getWorldStories,
  searchListingsSmart,
} from "@/lib/worlds.community";
import { getWorldPresentation } from "@/lib/worlds";
import type { SellerStorefront } from "@/lib/sellers";
import { buildReturnTo, withReturnTo } from "@/lib/navigation/return-to";
import { mockListingsService } from "@/services/listings";

type WorldPageClientProps = {
  world: Exclude<CatalogWorld, "all">;
  listings: UnifiedCatalogListing[];
  stores: SellerStorefront[];
};

const storyAccentClass: Record<string, string> = {
  success: "border-emerald-200 bg-emerald-50/70",
  warning: "border-amber-200 bg-amber-50/70",
  accent: "border-sky-200 bg-sky-50/80",
};

export function WorldPageClient({ world, listings, stores }: WorldPageClientProps) {
  const [category, setCategory] = useState<"all" | string>("all");
  const [location, setLocation] = useState<"all" | string>("all");
  const [worldListings, setWorldListings] = useState<UnifiedCatalogListing[]>(listings);

  useEffect(() => {
    let isActive = true;
    void mockListingsService.getAll({ world }).then((nextListings) => {
      if (isActive) {
        setWorldListings(nextListings);
      }
    });
    return () => {
      isActive = false;
    };
  }, [world]);

  const worldPresentation = useMemo(() => getWorldPresentation(world), [world]);
  const worldIcon = catalogWorldLucideIcons[world];
  const online = useMemo(() => getWorldOnlineStats(world), [world]);
  const worldBroadcast = useMemo(() => getWorldBroadcast(world), [world]);
  const worldStories = useMemo(() => getWorldStories(world), [world]);
  const worldChips = useMemo(() => getWorldAudienceChips(world), [world]);
  const worldScenarios = useMemo(() => getWorldCuratedScenarios(world), [world]);
  const categoryOptions = useMemo(() => getCategoryOptionsForWorld(world), [world]);
  const locations = useMemo(() => getUniqueLocationsForUnified(worldListings), [worldListings]);

  const hasSelectedCategory = useMemo(
    () => categoryOptions.some((option) => option.id === category),
    [category, categoryOptions],
  );
  const resolvedCategory = category === "all" || hasSelectedCategory ? category : "all";

  const filteredListings = useMemo(
    () =>
      filterAndSortUnifiedListings(worldListings, {
        query: "",
        category: resolvedCategory,
        location,
        sortBy: "newest",
      }),
    [resolvedCategory, worldListings, location],
  );

  const featuredListings = useMemo(() => filteredListings.slice(0, 6), [filteredListings]);
  const returnTo = useMemo(() => buildReturnTo(`/worlds/${world}`, ""), [world]);
  const featuredListingsWithReturnTo = useMemo(
    () =>
      featuredListings.map((listing) => ({
        ...listing,
        detailsHref: withReturnTo(listing.detailsHref, returnTo),
      })),
    [featuredListings, returnTo],
  );
  const averagePrice = useMemo(() => {
    if (!worldListings.length) return 0;
    return Math.round(worldListings.reduce((sum, item) => sum + item.priceValue, 0) / worldListings.length);
  }, [worldListings]);

  const topStores = useMemo<StoreCatalogItem[]>(
    () =>
      stores.slice(0, 4).map((seller) => ({
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
      })),
    [stores],
  );
  const activeNow = useMemo(
    () => topStores.slice(0, 4).map((store) => store.storefrontName),
    [topStores],
  );

  const catalogHref = useMemo(
    () =>
      searchListingsSmart({
        worldId: world,
        city: location === "all" ? undefined : location,
        categoryId: resolvedCategory === "all" ? undefined : resolvedCategory,
      }),
    [resolvedCategory, location, world],
  );

  return (
    <PageShell
      title={`${worldPresentation.title}: хаб мира`}
      subtitle={worldPresentation.heroDescription}
      breadcrumbs={[
        { label: "Миры", href: "/worlds" },
        { label: getWorldLabel(world) },
      ]}
      className="py-5 sm:py-7"
    >
      <div className="space-y-3">
        <section className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 ${worldPresentation.heroToneClass}`}>
          <div className={`pointer-events-none absolute inset-0 ${worldPresentation.heroDecorClass}`} />
          <div className="relative space-y-2">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-80">
              {createElement(worldIcon, { className: "h-4 w-4", strokeWidth: 1.5 })}
              World Community
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{worldPresentation.title}</h1>
            <p className="text-sm opacity-90 sm:max-w-3xl">{worldPresentation.subtitle}</p>
            <p className="text-sm font-medium">
              Сейчас online: {online.usersOnline} человек · {online.shopsOnline} магазинов
            </p>
          </div>
        </section>

        <WorldSearch worldId={world} location={location} category={resolvedCategory} />

        <CatalogCategoryScope
          density="compact"
          categoryOptions={categoryOptions}
          resolvedCategory={resolvedCategory}
          onCategoryChange={(id) => setCategory(id)}
        />

        <section
          className={`grid gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] ${worldPresentation.sectionToneClass}`}
        >
          <select
            value={world}
            disabled
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none"
          >
            <option>{getWorldLabel(world)}</option>
          </select>
          <select
            value={location}
            onChange={(event) => setLocation(event.target.value as "all" | string)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
          >
            <option value="all">Весь мир</option>
            {locations.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <Link
            href={catalogHref}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Открыть каталог мира
          </Link>
        </section>

        <WorldIdentityStrip
          world={world}
          chips={worldChips}
          usersOnline={online.usersOnline}
          shopsOnline={online.shopsOnline}
          contextLine={`${worldListings.length.toLocaleString("ru-RU")} объявлений в мире`}
          href={`/worlds/${world}`}
        />

        <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <SectionCard title="Сейчас в мире" padding="sm">
            <p className="text-xs text-slate-600">{online.usersOnline} человек online</p>
            <p className="text-xs text-slate-600">{online.shopsOnline} магазинов активны</p>
            <p className="text-xs text-slate-600">{Math.max(6, Math.round(worldListings.length * 0.12))} новых объявлений сегодня</p>
            <p className="text-xs text-slate-600">{worldStories.length} stories сегодня</p>
          </SectionCard>
          <SectionCard title="Средняя цена" padding="sm">
            <p className="text-2xl font-semibold text-slate-900">{averagePrice.toLocaleString("ru-RU")} ₽</p>
          </SectionCard>
          <SectionCard title="Кто активен сейчас" padding="sm">
            <div className="flex flex-wrap gap-1.5">
              {activeNow.map((name) => (
                <span key={name} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700">
                  {name}
                </span>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Быстрый вход" padding="sm">
            <p className="text-xs text-slate-600">Показать объявления: {filteredListings.length}</p>
            <Link href={catalogHref} className="mt-2 inline-flex text-sm font-semibold text-slate-700 hover:text-slate-900">
              Смотреть все объявления мира →
            </Link>
          </SectionCard>
        </section>

        <SectionCard title="Подборки мира" subtitle="Сценарии ведут в отдельную фильтрацию каталога" padding="sm">
          <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
            {worldScenarios.map((scenario) => (
              <Link
                key={scenario.id}
                href={searchListingsSmart({
                  worldId: world,
                  city: location === "all" ? undefined : location,
                  categoryId: scenario.categoryId,
                  text: scenario.query,
                })}
                className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {scenario.icon} {scenario.title}
              </Link>
            ))}
          </div>
        </SectionCard>

        {worldBroadcast ? (
          <SectionCard title="Объявление мира" padding="sm">
            <div className="rounded-xl border border-slate-300 bg-white p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">Закреплено</span>
                {worldBroadcast.isPromoted ? (
                  <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Партнерское сообщение</span>
                ) : null}
              </div>
              <p className="text-sm font-semibold text-slate-900">{worldBroadcast.title}</p>
              <p className="mt-1 text-sm text-slate-700">{worldBroadcast.body}</p>
              <p className="mt-2 text-xs text-slate-500">
                {worldBroadcast.authorType === "system"
                  ? `от команды мира (${worldBroadcast.authorName})`
                  : `от ${worldBroadcast.authorType === "shop" ? "магазина" : "пользователя"} ${worldBroadcast.authorName}`}
              </p>
            </div>
          </SectionCard>
        ) : null}

        {worldStories.length ? (
          <SectionCard title="Что происходит в мире" subtitle="Story / activity layer" padding="sm">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {worldStories.slice(0, 6).map((story) => (
                <article
                  key={story.id}
                  className={`w-72 min-w-[17rem] rounded-xl border p-3 ${storyAccentClass[story.accent ?? "accent"] ?? "border-slate-200 bg-slate-50"}`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">{story.type.replace("_", " ")}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {story.actorType === "shop" ? "Магазин" : "Пользователь"} {story.actorName}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{story.title}</p>
                  <p className="mt-2 text-xs text-slate-500">{story.createdAt}</p>
                </article>
              ))}
            </div>
          </SectionCard>
        ) : null}

        <WorldChat worldId={world} />

        <SectionCard title="Рекомендуемые объявления" subtitle="Быстрый вход в ключевые карточки мира" padding="sm">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {featuredListingsWithReturnTo.map((listing) => (
              <div key={listing.id} className="h-full">
                <ListingPreviewCard listing={listing} view="grid" />
              </div>
            ))}
          </div>
          <Link href={catalogHref} className="mt-2 inline-flex text-sm font-semibold text-slate-700 hover:text-slate-900">
            Смотреть все объявления мира →
          </Link>
        </SectionCard>

        <SectionCard title="Топ магазины мира" subtitle="Активные витрины в этом контексте" padding="sm">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {topStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
