"use client";

import { useEffect, useMemo, useState } from "react";

import { EmptyFavoritesState } from "@/components/favorites/empty-favorites-state";
import { FavoritesGrid } from "@/components/favorites/favorites-grid";
import { useFavorites } from "@/components/favorites/favorites-provider";
import { Card } from "@/components/ui";
import { UnifiedCatalogListing } from "@/lib/listings";
import { Listing, ListingCategory } from "@/lib/types";
import { mockListingsService } from "@/services/listings";

type FavoritesSortOption = "recently_added" | "price_asc" | "price_desc";

const sortOptions: Record<FavoritesSortOption, string> = {
  recently_added: "Сначала сохраненные",
  price_asc: "Сначала дешевле",
  price_desc: "Сначала дороже",
};

function getSavedAtLabel(addedAtIso: string | null) {
  if (!addedAtIso) {
    return "Сохранено";
  }

  return `Сохранено ${new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(addedAtIso))}`;
}

function sortFavorites(
  listings: UnifiedCatalogListing[],
  sortBy: FavoritesSortOption,
  getAddedAt: (listingId: string) => string | null,
) {
  return [...listings].sort((a, b) => {
    if (sortBy === "price_asc") {
      return a.priceValue - b.priceValue;
    }

    if (sortBy === "price_desc") {
      return b.priceValue - a.priceValue;
    }

    const aAddedAt = getAddedAt(a.id) ?? "";
    const bAddedAt = getAddedAt(b.id) ?? "";
    return new Date(bAddedAt).getTime() - new Date(aAddedAt).getTime();
  });
}

export function FavoritesPageClient() {
  const { favoriteIds, favoritesCount, getAddedAt, isHydrated } = useFavorites();
  const [sortBy, setSortBy] = useState<FavoritesSortOption>("recently_added");
  const [catalogListings, setCatalogListings] = useState<UnifiedCatalogListing[]>([]);

  useEffect(() => {
    let isActive = true;
    void mockListingsService.getAll().then((listings) => {
      if (isActive) {
        setCatalogListings(listings);
      }
    });
    return () => {
      isActive = false;
    };
  }, []);

  const savedListings = useMemo<Listing[]>(() => {
    if (favoriteIds.length === 0) {
      return [];
    }

    const saved = catalogListings.filter((listing) => favoriteIds.includes(listing.id));
    const sorted = sortFavorites(saved, sortBy, getAddedAt);
    return sorted.map((listing) => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      priceValue: listing.priceValue,
      location: listing.location,
      publishedAt: listing.publishedAt,
      postedAtIso: listing.postedAtIso,
      image: listing.image,
      condition: listing.condition,
      category: listing.categoryId as ListingCategory,
      description: listing.description,
      sellerName: listing.sellerName,
      sellerPhone: listing.sellerPhone,
      listingSaleMode: listing.listingSaleMode,
    }));
  }, [catalogListings, favoriteIds, getAddedAt, sortBy]);

  if (isHydrated && favoritesCount === 0) {
    return <EmptyFavoritesState />;
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-slate-600">Сохранено объявлений</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              {isHydrated ? favoritesCount : "—"}
            </p>
          </div>
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            Сортировка
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as FavoritesSortOption)}
              className="h-10 min-w-48 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
            >
              {Object.entries(sortOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <FavoritesGrid
        listings={savedListings}
        getSavedAtLabel={(listingId) => getSavedAtLabel(getAddedAt(listingId))}
      />
    </div>
  );
}
