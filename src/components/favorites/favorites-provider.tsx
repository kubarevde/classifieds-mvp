"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

const FAVORITES_STORAGE_KEY = "classifieds-mvp:favorites";
const FAVORITES_CHANGE_EVENT = "classifieds-favorites-change";

type FavoriteEntry = {
  id: string;
  addedAt: string;
};

type FavoritesState = {
  entries: FavoriteEntry[];
};

type FavoritesContextValue = {
  favoriteIds: string[];
  favoritesCount: number;
  isHydrated: boolean;
  isFavorite: (listingId: string) => boolean;
  addToFavorites: (listingId: string) => void;
  removeFromFavorites: (listingId: string) => void;
  toggleFavorite: (listingId: string) => void;
  getAddedAt: (listingId: string) => string | null;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

const EMPTY_ENTRIES: FavoriteEntry[] = [];

function parseStoredState(value: string | null): FavoritesState {
  if (!value) {
    return { entries: [] };
  }

  try {
    const parsed = JSON.parse(value) as FavoritesState;
    if (!parsed || !Array.isArray(parsed.entries)) {
      return { entries: [] };
    }

    return {
      entries: parsed.entries
        .filter(
          (entry): entry is FavoriteEntry =>
            typeof entry?.id === "string" && typeof entry?.addedAt === "string",
        )
        .reduce<FavoriteEntry[]>((acc, entry) => {
          if (acc.some((item) => item.id === entry.id)) {
            return acc;
          }

          acc.push(entry);
          return acc;
        }, []),
    };
  } catch {
    return { entries: [] };
  }
}

let cachedSerialized: string | null = null;
let cachedEntries: FavoriteEntry[] = EMPTY_ENTRIES;

function invalidateCache() {
  cachedSerialized = null;
}

function readEntriesFromStorage(): FavoriteEntry[] {
  if (typeof window === "undefined") {
    return EMPTY_ENTRIES;
  }

  const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
  if (raw === cachedSerialized) {
    return cachedEntries;
  }

  const { entries } = parseStoredState(raw);
  cachedSerialized = raw;
  cachedEntries = entries;
  return cachedEntries;
}

function writeEntriesToStorage(nextEntries: FavoriteEntry[]) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: FavoritesState = { entries: nextEntries };
  const serialized = JSON.stringify(payload);
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, serialized);
  cachedSerialized = serialized;
  cachedEntries = nextEntries;
  window.dispatchEvent(new Event(FAVORITES_CHANGE_EVENT));
}

function subscribeFavorites(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === FAVORITES_STORAGE_KEY || event.key === null) {
      invalidateCache();
      onStoreChange();
    }
  };

  const onLocalChange = () => {
    invalidateCache();
    onStoreChange();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(FAVORITES_CHANGE_EVENT, onLocalChange);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(FAVORITES_CHANGE_EVENT, onLocalChange);
  };
}

function getServerSnapshot(): FavoriteEntry[] {
  return EMPTY_ENTRIES;
}

function getClientSnapshot(): FavoriteEntry[] {
  return readEntriesFromStorage();
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

type FavoritesProviderProps = {
  children: ReactNode;
};

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const entries = useSyncExternalStore(subscribeFavorites, getClientSnapshot, getServerSnapshot);
  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    getClientMountedSnapshot,
    getServerMountedSnapshot,
  );

  const getAddedAt = useCallback(
    (listingId: string) => entries.find((entry) => entry.id === listingId)?.addedAt ?? null,
    [entries],
  );

  const value = useMemo<FavoritesContextValue>(() => {
    const idsSet = new Set(entries.map((entry) => entry.id));

    const addToFavorites = (listingId: string) => {
      if (entries.some((entry) => entry.id === listingId)) {
        return;
      }

      writeEntriesToStorage([...entries, { id: listingId, addedAt: new Date().toISOString() }]);
    };

    const removeFromFavorites = (listingId: string) => {
      writeEntriesToStorage(entries.filter((entry) => entry.id !== listingId));
    };

    const toggleFavorite = (listingId: string) => {
      if (entries.some((entry) => entry.id === listingId)) {
        writeEntriesToStorage(entries.filter((entry) => entry.id !== listingId));
        return;
      }

      writeEntriesToStorage([...entries, { id: listingId, addedAt: new Date().toISOString() }]);
    };

    return {
      favoriteIds: entries.map((entry) => entry.id),
      favoritesCount: entries.length,
      isHydrated,
      isFavorite: (listingId: string) => idsSet.has(listingId),
      addToFavorites,
      removeFromFavorites,
      toggleFavorite,
      getAddedAt,
    };
  }, [entries, getAddedAt, isHydrated]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }

  return context;
}
