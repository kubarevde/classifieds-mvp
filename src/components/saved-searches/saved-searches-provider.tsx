"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { SearchAlertPreference, SearchIntent, SavedSearch } from "@/entities/search/model";
import { fetchSavedSearches, savedSearchUid } from "@/services/saved-searches";
import { serializeIntentKey } from "@/lib/saved-searches";

type SavedSearchesContextValue = {
  searches: SavedSearch[];
  isHydrated: boolean;
  addSearch: (intent: SearchIntent, alertPreference?: SearchAlertPreference, title?: string) => SavedSearch;
  removeSearch: (id: string) => void;
  updateSearch: (id: string, patch: Partial<SavedSearch>) => void;
  updateAlertPreference: (id: string, prefs: SearchAlertPreference) => void;
  markViewed: (id: string) => void;
  getSearchById: (id: string) => SavedSearch | undefined;
};

const SavedSearchesContext = createContext<SavedSearchesContextValue | null>(null);

export function SavedSearchesProvider({ children }: { children: ReactNode }) {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchSavedSearches().then((rows) => {
      if (!cancelled) {
        setSearches(rows);
        setIsHydrated(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addSearch = useCallback((intent: SearchIntent, alertPreference?: SearchAlertPreference, title?: string) => {
    const key = serializeIntentKey(intent);
    let resolved: SavedSearch | undefined;
    setSearches((prev) => {
      const existing = prev.find((item) => serializeIntentKey(item.intent) === key);
      if (existing) {
        resolved = existing;
        return prev;
      }
      const created: SavedSearch = {
        id: savedSearchUid("ss"),
        intent,
        title: title?.trim() ? title.trim().slice(0, 120) : undefined,
        alertPreference: alertPreference ?? { channel: "off", enabled: false },
        createdAt: new Date().toISOString(),
        lastViewedAt: null,
      };
      resolved = created;
      return [created, ...prev];
    });
    return resolved as SavedSearch;
  }, []);

  const removeSearch = useCallback((id: string) => {
    setSearches((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateSearch = useCallback((id: string, patch: Partial<SavedSearch>) => {
    setSearches((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const updateAlertPreference = useCallback((id: string, prefs: SearchAlertPreference) => {
    setSearches((prev) =>
      prev.map((item) => (item.id === id ? { ...item, alertPreference: prefs } : item)),
    );
  }, []);

  const markViewed = useCallback((id: string) => {
    setSearches((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, lastViewedAt: new Date().toISOString() } : item,
      ),
    );
  }, []);

  const getSearchById = useCallback(
    (id: string) => searches.find((item) => item.id === id),
    [searches],
  );

  const value = useMemo<SavedSearchesContextValue>(
    () => ({
      searches: [...searches].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      isHydrated,
      addSearch,
      removeSearch,
      updateSearch,
      updateAlertPreference,
      markViewed,
      getSearchById,
    }),
    [
      searches,
      isHydrated,
      addSearch,
      removeSearch,
      updateSearch,
      updateAlertPreference,
      markViewed,
      getSearchById,
    ],
  );

  return <SavedSearchesContext.Provider value={value}>{children}</SavedSearchesContext.Provider>;
}

export function useSavedSearches(): SavedSearchesContextValue {
  const ctx = useContext(SavedSearchesContext);
  if (!ctx) {
    throw new Error("useSavedSearches must be used within SavedSearchesProvider");
  }
  return ctx;
}
