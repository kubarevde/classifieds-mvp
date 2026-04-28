"use client";

import { ReactNode } from "react";

import type { SearchAlertPreference, SearchIntent } from "@/entities/search/model";
import { useSavedSearchesStore } from "@/stores/saved-searches-store";

export function SavedSearchesProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useSavedSearches() {
  const searches = useSavedSearchesStore((s) => s.searches);
  const add = useSavedSearchesStore((s) => s.addSearch);
  const remove = useSavedSearchesStore((s) => s.removeSearch);
  const update = useSavedSearchesStore((s) => s.updateSearch);
  const updateAlerts = useSavedSearchesStore((s) => s.updateAlertPreference);
  const markViewed = useSavedSearchesStore((s) => s.markViewed);
  const getById = useSavedSearchesStore((s) => s.getSearchById);
  const getMatchingListings = useSavedSearchesStore((s) => s.getMatchingListings);
  const getNewMatchesCount = useSavedSearchesStore((s) => s.getNewMatchesCount);
  const getTotalNewMatches = useSavedSearchesStore((s) => s.getTotalNewMatches);

  return {
    searches: [...searches].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
    isHydrated: true,
    addSearch: (intent: SearchIntent, alertPreference?: SearchAlertPreference, title?: string) =>
      add(intent, alertPreference, title),
    removeSearch: remove,
    updateSearch: update,
    updateAlertPreference: updateAlerts,
    markViewed,
    getSearchById: getById,
    getMatchingListings,
    getNewMatchesCount,
    getTotalNewMatches,
  };
}
