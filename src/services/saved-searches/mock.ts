import type { SavedSearch, SearchIntent } from "@/entities/search/model";
import type { UnifiedCatalogListing } from "@/lib/listings.types";
import {
  createSearchIntentFromFilters,
  createStoreSearchIntentFromFilters,
  defaultSavedSearchFilters,
  serializeIntentKey,
  type SavedSearchFilters,
} from "@/lib/saved-searches";
import { unifiedCatalogListings } from "@/lib/listings";
import { storefrontSellers } from "@/lib/sellers";

import type { SavedSearchMatchSummary } from "./types";

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

function matchesStoreIntent(seller: (typeof storefrontSellers)[number], intent: SearchIntent) {
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

function listingMatchesForSearch(search: SavedSearch): UnifiedCatalogListing[] {
  if (search.intent.target === "store") {
    return storefrontSellers
      .filter((seller) => matchesStoreIntent(seller, search.intent))
      .slice(0, 8)
      .map((seller) => ({
        id: `store-${seller.id}`,
        listingSaleMode: "fixed" as const,
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
        detailsHref: `/stores/${seller.id}`,
      }));
  }
  return unifiedCatalogListings.filter((listing) => matchesIntent(listing, search.intent));
}

function newMatchesCount(search: SavedSearch, totalMatches: number): number {
  if (!search.lastViewedAt) {
    return Math.min(3, totalMatches);
  }
  return Math.min(2, totalMatches);
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

export async function fetchSavedSearches(): Promise<SavedSearch[]> {
  return Promise.resolve([
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
  ]);
}

export async function getMatchesForSavedSearch(search: SavedSearch): Promise<UnifiedCatalogListing[]> {
  return Promise.resolve(listingMatchesForSearch(search));
}

export async function getMatchSummaryForSavedSearch(search: SavedSearch): Promise<SavedSearchMatchSummary> {
  const listings = listingMatchesForSearch(search);
  return Promise.resolve({
    searchId: search.id,
    listings,
    newMatches: newMatchesCount(search, listings.length),
  });
}

export async function getMatchSummariesForSavedSearches(
  searches: SavedSearch[],
): Promise<Record<string, SavedSearchMatchSummary>> {
  const entries = await Promise.all(
    searches.map(async (s) => {
      const summary = await getMatchSummaryForSavedSearch(s);
      return [s.id, summary] as const;
    }),
  );
  return Object.fromEntries(entries);
}

export function buildFiltersForIntentFromSnapshot(snapshot: SavedSearchFilters) {
  return createSearchIntentFromFilters(snapshot, "keyword");
}

export function savedSearchIntentKey(search: SavedSearch): string {
  return serializeIntentKey(search.intent);
}

export { uid as savedSearchUid };
