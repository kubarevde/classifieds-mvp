"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  SavedSearch,
  SavedSearchFilters,
  SAVED_SEARCHES_CHANGE_EVENT,
  SAVED_SEARCHES_STORAGE_KEY,
  buildAutoSearchLabel,
  defaultSavedSearchFilters,
} from "@/lib/saved-searches";

type SavedSearchesState = {
  searches: SavedSearch[];
};

type SavedSearchesContextValue = {
  searches: SavedSearch[];
  isHydrated: boolean;
  addSearch: (filters: SavedSearchFilters, options?: { name?: string; alertsEnabled?: boolean }) => SavedSearch;
  removeSearch: (id: string) => void;
  renameSearch: (id: string, name: string) => void;
  setAlertsEnabled: (id: string, enabled: boolean) => void;
};

const SavedSearchesContext = createContext<SavedSearchesContextValue | null>(null);

const EMPTY: SavedSearch[] = [];

function parseStoredState(value: string | null): SavedSearchesState {
  if (!value) {
    return { searches: [] };
  }

  try {
    const parsed = JSON.parse(value) as SavedSearchesState;
    if (!parsed || !Array.isArray(parsed.searches)) {
      return { searches: [] };
    }

    return {
      searches: parsed.searches.filter(
        (item): item is SavedSearch =>
          typeof item?.id === "string" &&
          typeof item?.name === "string" &&
          typeof item?.createdAtIso === "string" &&
          typeof item?.alertsEnabled === "boolean" &&
          item?.filters &&
          typeof item.filters === "object" &&
          typeof item.filters.query === "string" &&
          typeof item.filters.category === "string" &&
          typeof item.filters.location === "string" &&
          typeof item.filters.sortBy === "string" &&
          typeof item.filters.view === "string",
      ),
    };
  } catch {
    return { searches: [] };
  }
}

let cachedSerialized: string | null = null;
let cachedSearches: SavedSearch[] = EMPTY;

function invalidateCache() {
  cachedSerialized = null;
}

function readSearchesFromStorage(): SavedSearch[] {
  if (typeof window === "undefined") {
    return EMPTY;
  }

  const raw = window.localStorage.getItem(SAVED_SEARCHES_STORAGE_KEY);
  if (raw === cachedSerialized) {
    return cachedSearches;
  }

  const { searches } = parseStoredState(raw);
  cachedSerialized = raw;
  cachedSearches = searches;
  return cachedSearches;
}

function writeSearchesToStorage(nextSearches: SavedSearch[]) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: SavedSearchesState = { searches: nextSearches };
  const serialized = JSON.stringify(payload);
  window.localStorage.setItem(SAVED_SEARCHES_STORAGE_KEY, serialized);
  cachedSerialized = serialized;
  cachedSearches = nextSearches;
  window.dispatchEvent(new Event(SAVED_SEARCHES_CHANGE_EVENT));
}

function subscribeSavedSearches(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SAVED_SEARCHES_STORAGE_KEY || event.key === null) {
      invalidateCache();
      onStoreChange();
    }
  };

  const onLocalChange = () => {
    invalidateCache();
    onStoreChange();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SAVED_SEARCHES_CHANGE_EVENT, onLocalChange);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SAVED_SEARCHES_CHANGE_EVENT, onLocalChange);
  };
}

function getServerSnapshot(): SavedSearch[] {
  return EMPTY;
}

function getClientSnapshot(): SavedSearch[] {
  return readSearchesFromStorage();
}

function subscribeNoop() {
  return () => {};
}

function getClientMountedSnapshot() {
  return true;
}

function getServerMountedSnapshot() {
  return false;
}

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `ss-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type SavedSearchesProviderProps = {
  children: ReactNode;
};

export function SavedSearchesProvider({ children }: SavedSearchesProviderProps) {
  const searches = useSyncExternalStore(subscribeSavedSearches, getClientSnapshot, getServerSnapshot);
  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    getClientMountedSnapshot,
    getServerMountedSnapshot,
  );

  const addSearch = useCallback(
    (filters: SavedSearchFilters, options?: { name?: string; alertsEnabled?: boolean }) => {
      const current = readSearchesFromStorage();
      const name = (options?.name?.trim() || buildAutoSearchLabel(filters)).slice(0, 120);
      const entry: SavedSearch = {
        id: newId(),
        name,
        createdAtIso: new Date().toISOString(),
        alertsEnabled: options?.alertsEnabled ?? false,
        filters: { ...defaultSavedSearchFilters, ...filters },
      };

      writeSearchesToStorage([entry, ...current]);
      return entry;
    },
    [],
  );

  const removeSearch = useCallback((id: string) => {
    const current = readSearchesFromStorage();
    writeSearchesToStorage(current.filter((item) => item.id !== id));
  }, []);

  const renameSearch = useCallback((id: string, name: string) => {
    const current = readSearchesFromStorage();
    const nextName = name.trim().slice(0, 120);
    if (!nextName) {
      return;
    }

    writeSearchesToStorage(
      current.map((item) => (item.id === id ? { ...item, name: nextName } : item)),
    );
  }, []);

  const setAlertsEnabled = useCallback((id: string, enabled: boolean) => {
    const current = readSearchesFromStorage();
    writeSearchesToStorage(
      current.map((item) => (item.id === id ? { ...item, alertsEnabled: enabled } : item)),
    );
  }, []);

  const value = useMemo<SavedSearchesContextValue>(() => {
    return {
      searches: [...searches].sort(
        (a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime(),
      ),
      isHydrated,
      addSearch,
      removeSearch,
      renameSearch,
      setAlertsEnabled,
    };
  }, [addSearch, isHydrated, removeSearch, renameSearch, searches, setAlertsEnabled]);

  return <SavedSearchesContext.Provider value={value}>{children}</SavedSearchesContext.Provider>;
}

export function useSavedSearches() {
  const context = useContext(SavedSearchesContext);
  if (!context) {
    throw new Error("useSavedSearches must be used within SavedSearchesProvider");
  }

  return context;
}
