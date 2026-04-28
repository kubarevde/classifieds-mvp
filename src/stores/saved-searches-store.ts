"use client";

import { create } from "zustand";

import type { SavedSearch, SearchAlertPreference, SearchIntent } from "@/entities/search/model";
import { type UnifiedCatalogListing, unifiedCatalogListings } from "@/lib/listings";
import {
  createSearchIntentFromFilters,
  defaultSavedSearchFilters,
  createStoreSearchIntentFromFilters,
  serializeIntentKey,
  type SavedSearchFilters,
} from "@/lib/saved-searches";
import { storefrontSellers } from "@/lib/sellers";

type SavedSearchesState = {
  searches: SavedSearch[];
  addSearch: (intent: SearchIntent, alertPreference?: SearchAlertPreference, title?: string) => SavedSearch;
  removeSearch: (id: string) => void;
  updateSearch: (id: string, patch: Partial<SavedSearch>) => void;
  updateAlertPreference: (id: string, prefs: SearchAlertPreference) => void;
  markViewed: (id: string) => void;
  getSearchById: (id: string) => SavedSearch | undefined;
  getMatchingListings: (searchId: string) => UnifiedCatalogListing[];
  getNewMatchesCount: (searchId: string) => number;
  getTotalNewMatches: () => number;
};

function uid(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function toStringArray(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function matchesIntent(listing: UnifiedCatalogListing, intent: SearchIntent) {
  if (intent.target !== "listing") {
    return false;
  }
  const query = intent.normalizedQuery;
  if (query) {
    const hay = `${listing.title} ${listing.description} ${listing.categoryLabel}`.toLowerCase();
    if (!hay.includes(query)) {
      return false;
    }
  }
  if (intent.filters.categoryId && listing.categoryId !== intent.filters.categoryId) {
    return false;
  }
  if (intent.filters.location && listing.location !== intent.filters.location) {
    return false;
  }
  if (typeof intent.filters.priceMin === "number" && listing.priceValue < intent.filters.priceMin) {
    return false;
  }
  if (typeof intent.filters.priceMax === "number" && listing.priceValue > intent.filters.priceMax) {
    return false;
  }
  const attributes = intent.filters.attributes ?? {};
  const world = typeof attributes.world === "string" ? attributes.world : null;
  if (world && world !== "all" && world !== listing.world) {
    return false;
  }
  const conditions = toStringArray(attributes.condition as string | string[] | undefined);
  if (conditions.length > 0 && !conditions.includes(listing.condition.toLowerCase())) {
    return false;
  }
  return true;
}

function matchesStoreIntent(
  seller: (typeof storefrontSellers)[number],
  intent: SearchIntent,
) {
  if (intent.target !== "store") {
    return false;
  }
  const query = intent.normalizedQuery;
  if (query) {
    const hay = `${seller.storefrontName} ${seller.shortDescription} ${seller.city}`.toLowerCase();
    if (!hay.includes(query)) {
      return false;
    }
  }
  if (intent.filters.location && seller.city !== intent.filters.location) {
    return false;
  }
  const attrs = intent.filters.attributes ?? {};
  const specialization = typeof attrs.specialization === "string" ? attrs.specialization : "all";
  if (specialization !== "all" && !seller.shortDescription.toLowerCase().includes(specialization.toLowerCase())) {
    return false;
  }
  if (attrs.verifiedOnly === "1" && seller.trustBadges.length === 0) {
    return false;
  }
  return true;
}

const starterIntent = createSearchIntentFromFilters({
  ...defaultSavedSearchFilters,
  query: "iPhone 14 Pro",
  category: "phones",
  location: "Москва",
  priceMax: 80000,
});
const starterStoreIntent = createStoreSearchIntentFromFilters({
  query: "авто",
  location: "all",
  specialization: "all",
  verifiedOnly: false,
  storeType: "all",
  sortBy: "rating_desc",
});

export const useSavedSearchesStore = create<SavedSearchesState>()((set, get) => ({
  searches: [
    {
      id: uid("ss"),
      intent: starterIntent,
      title: "iPhone до 80к",
      alertPreference: { channel: "push", enabled: true },
      createdAt: new Date().toISOString(),
      lastViewedAt: null,
    },
    {
      id: uid("ss"),
      intent: starterStoreIntent,
      title: "Магазины авто",
      alertPreference: { channel: "off", enabled: false },
      createdAt: new Date().toISOString(),
      lastViewedAt: null,
    },
  ],

  addSearch: (intent, alertPreference = { channel: "off", enabled: false }, title) => {
    const key = serializeIntentKey(intent);
    const existing = get().searches.find((item) => serializeIntentKey(item.intent) === key);
    if (existing) {
      return existing;
    }
    const created: SavedSearch = {
      id: uid("ss"),
      intent,
      title: title?.trim() ? title.trim().slice(0, 120) : undefined,
      alertPreference,
      createdAt: new Date().toISOString(),
      lastViewedAt: null,
    };
    set((state) => ({ searches: [created, ...state.searches] }));
    return created;
  },

  removeSearch: (id) => set((state) => ({ searches: state.searches.filter((item) => item.id !== id) })),

  updateSearch: (id, patch) =>
    set((state) => ({
      searches: state.searches.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })),

  updateAlertPreference: (id, prefs) =>
    set((state) => ({
      searches: state.searches.map((item) => (item.id === id ? { ...item, alertPreference: prefs } : item)),
    })),

  markViewed: (id) =>
    set((state) => ({
      searches: state.searches.map((item) =>
        item.id === id ? { ...item, lastViewedAt: new Date().toISOString() } : item,
      ),
    })),

  getSearchById: (id) => get().searches.find((item) => item.id === id),

  getMatchingListings: (searchId) => {
    const target = get().searches.find((item) => item.id === searchId);
    if (!target) {
      return [];
    }
    if (target.intent.target === "store") {
      return storefrontSellers
        .filter((seller) => matchesStoreIntent(seller, target.intent))
        .slice(0, 8)
        .map((seller) => ({
          id: `store-${seller.id}`,
          listingSaleMode: "fixed",
          title: seller.storefrontName,
          price: "—",
          priceValue: 0,
          location: seller.city,
          publishedAt: "store",
          postedAtIso: new Date().toISOString(),
          image: "bg-gradient-to-br from-slate-200 to-slate-300",
          condition: seller.shortDescription,
          description: seller.shortDescription,
          sellerName: seller.storefrontName,
          sellerPhone: seller.phone,
          categoryId: "store",
          categoryLabel: "Магазин",
          world: seller.worldHint === "all" ? "base" : seller.worldHint,
          worldLabel: seller.worldHint,
          detailsHref: `/sellers/${seller.id}`,
        }));
    }
    return unifiedCatalogListings.filter((listing) => matchesIntent(listing, target.intent));
  },

  getNewMatchesCount: (searchId) => {
    const target = get().searches.find((item) => item.id === searchId);
    if (!target) {
      return 0;
    }
    const total = get().getMatchingListings(searchId).length;
    if (!target.lastViewedAt) {
      return Math.min(3, total);
    }
    return Math.min(2, total);
  },

  getTotalNewMatches: () =>
    get().searches.reduce((acc, item) => acc + get().getNewMatchesCount(item.id), 0),
}));

export function buildFiltersForIntentFromSnapshot(snapshot: SavedSearchFilters) {
  return createSearchIntentFromFilters(snapshot, "keyword");
}
