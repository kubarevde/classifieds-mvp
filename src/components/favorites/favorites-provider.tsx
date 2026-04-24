"use client";

import { ReactNode } from "react";

import { useBuyer } from "@/components/buyer/buyer-provider";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useFavorites() {
  const buyer = useBuyer();
  const favoriteIds = buyer.favorites.map((item) => item.id);
  const idsSet = new Set(favoriteIds);

  return {
    favoriteIds,
    favoritesCount: favoriteIds.length,
    isHydrated: true,
    isFavorite: (listingId: string) => idsSet.has(listingId),
    addToFavorites: buyer.addToFavorites,
    removeFromFavorites: buyer.removeFromFavorites,
    toggleFavorite: buyer.toggleFavorite,
    getAddedAt: buyer.getFavoriteAddedAt,
  };
}
