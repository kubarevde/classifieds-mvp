import {
  autosCatalogListings,
  realEstateCatalogListings,
  servicesCatalogListings,
  unifiedCatalogListings,
} from "@/lib/listings.data";
import { filterAndSortUnifiedListings } from "@/lib/listings.filters";
import type { ListingWorld, UnifiedCatalogListing } from "@/lib/listings.types";

import type { ListingDraft, ListingFilters, ListingsService } from "./types";

type CatalogFilterInput = Parameters<typeof filterAndSortUnifiedListings>[1];

function mergeInitialCatalog(): UnifiedCatalogListing[] {
  const byId = new Map<string, UnifiedCatalogListing>();
  for (const listing of [
    ...unifiedCatalogListings,
    ...autosCatalogListings,
    ...realEstateCatalogListings,
    ...servicesCatalogListings,
  ]) {
    byId.set(listing.id, listing);
  }
  return [...byId.values()];
}

let listingsStore: UnifiedCatalogListing[] | null = null;

function getStore(): UnifiedCatalogListing[] {
  if (!listingsStore) {
    listingsStore = mergeInitialCatalog();
  }
  return listingsStore;
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `listing-${crypto.randomUUID()}`;
  }
  return `listing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toFilterInput(filters?: ListingFilters): CatalogFilterInput {
  return {
    query: filters?.query ?? "",
    category: filters?.category ?? "all",
    location: filters?.location ?? "all",
    saleMode: filters?.saleMode ?? "all",
    sortBy: filters?.sortBy ?? "newest",
  };
}

function narrowByWorld(listings: UnifiedCatalogListing[], world?: string): UnifiedCatalogListing[] {
  if (!world || world === "all") {
    return listings;
  }
  return listings.filter((listing) => listing.world === world);
}

function defaultWorldForDraft(draft: ListingDraft): ListingWorld {
  const w = draft.world;
  if (w === "base" || w === "electronics" || w === "autos" || w === "agriculture" || w === "real_estate" || w === "jobs" || w === "services") {
    return w;
  }
  return "base";
}

function defaultWorldLabel(world: ListingWorld): string {
  const labels: Record<ListingWorld, string> = {
    base: "Все объявления",
    electronics: "Электроника",
    autos: "Автомобили",
    agriculture: "Сельское хозяйство",
    real_estate: "Недвижимость",
    jobs: "Работа",
    services: "Услуги",
  };
  return labels[world] ?? "Все объявления";
}

export const mockListingsService: ListingsService = {
  async getAll(filters) {
    const base = narrowByWorld(getStore(), filters?.world);
    return Promise.resolve(filterAndSortUnifiedListings(base, toFilterInput(filters)));
  },

  async getById(id) {
    const found = getStore().find((listing) => listing.id === id) ?? null;
    return Promise.resolve(found);
  },

  async getByWorld(world) {
    if (!world || world === "all") {
      return Promise.resolve([...getStore()]);
    }
    return Promise.resolve(getStore().filter((listing) => listing.world === world));
  },

  async getFeatured() {
    const sorted = filterAndSortUnifiedListings(getStore(), {
      query: "",
      category: "all",
      location: "all",
      sortBy: "newest",
    });
    return Promise.resolve(sorted.slice(0, 8));
  },

  async create(draft) {
    const id = uid();
    const world = defaultWorldForDraft(draft);
    const row: UnifiedCatalogListing = {
      id,
      title: draft.title,
      price: draft.price,
      priceValue: draft.priceValue,
      location: draft.location ?? "Москва",
      publishedAt: draft.publishedAt ?? "Сегодня",
      postedAtIso: draft.postedAtIso ?? new Date().toISOString(),
      image: draft.image ?? "from-slate-700 via-slate-600 to-slate-300",
      condition: draft.condition ?? "Новое",
      description: draft.description ?? "",
      sellerName: draft.sellerName ?? "Вы",
      sellerPhone: draft.sellerPhone ?? "+7 (900) 000-00-00",
      categoryId: draft.categoryId ?? "services",
      categoryLabel: draft.categoryLabel ?? "Услуги",
      world,
      worldLabel: draft.worldLabel ?? defaultWorldLabel(world),
      detailsHref: draft.detailsHref ?? `/listings/${id}`,
    };
    getStore().unshift(row);
    return Promise.resolve(row);
  },

  async update(id, patch) {
    const store = getStore();
    const index = store.findIndex((listing) => listing.id === id);
    if (index === -1) {
      throw new Error(`ListingsService.update: listing not found: ${id}`);
    }
    const merged = { ...store[index], ...patch } as UnifiedCatalogListing;
    store[index] = merged;
    return Promise.resolve(merged);
  },

  async delete(id) {
    const store = getStore();
    const index = store.findIndex((listing) => listing.id === id);
    if (index !== -1) {
      store.splice(index, 1);
    }
    return Promise.resolve();
  },
};
