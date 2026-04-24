import { agricultureCategories } from "@/lib/agriculture";
import { electronicsCategories } from "@/lib/electronics";
import { categories } from "@/lib/mock-data";
import type { Listing, ListingCategory } from "@/lib/types";

import {
  agricultureCatalogListings,
  allListings,
  autosCatalogListings,
  categoryLabels,
  electronicsCatalogListings,
  electronicsSubcategories,
  jobsCatalogListings,
  mapElectronicsCategoryToWorldCategory,
  realEstateCatalogListings,
  servicesCatalogListings,
  unifiedCatalogListings,
  worldCategoryCatalog,
  worldOptions,
} from "./listings.data";
import type {
  CatalogWorld,
  ListingBadge,
  SortOption,
  UnifiedCatalogListing,
  UnifiedCategoryOption,
} from "./listings.types";

type FilterSortFields = {
  priceValue: number;
  postedAtIso: string;
  location: string;
};

type CatalogFilterInput = {
  query: string;
  category: "all" | string;
  location: "all" | string;
  sortBy: SortOption;
};

function sortByPriceAndDate<T extends FilterSortFields>(items: T[], sortBy: SortOption): T[] {
  return [...items].sort((a, b) => {
    if (sortBy === "price_asc") {
      return a.priceValue - b.priceValue;
    }

    if (sortBy === "price_desc") {
      return b.priceValue - a.priceValue;
    }

    return new Date(b.postedAtIso).getTime() - new Date(a.postedAtIso).getTime();
  });
}

function filterAndSortCatalog<T extends FilterSortFields>(
  listings: T[],
  filters: CatalogFilterInput,
  options: {
    textMatchesQuery: (listing: T, normalizedQuery: string) => boolean;
    categoryMatches: (listing: T, category: "all" | string) => boolean;
  },
): T[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  const filtered = listings.filter((listing) => {
    const matchesQuery = normalizedQuery === "" || options.textMatchesQuery(listing, normalizedQuery);
    const matchesCategory = options.categoryMatches(listing, filters.category);
    const matchesLocation = filters.location === "all" || listing.location === filters.location;
    return matchesQuery && matchesCategory && matchesLocation;
  });

  return sortByPriceAndDate(filtered, filters.sortBy);
}

type ListingFilterInput = {
  query: string;
  category: "all" | ListingCategory;
  location: "all" | string;
  sortBy: SortOption;
};

export function getWorldLabel(world: CatalogWorld) {
  return worldOptions.find((item) => item.id === world)?.label ?? "Все";
}

export function getUniqueLocations(listings: Listing[]) {
  return [...new Set(listings.map((listing) => listing.location))].sort((a, b) =>
    a.localeCompare(b, "ru"),
  );
}

export function filterAndSortListings(listings: Listing[], filters: ListingFilterInput) {
  return filterAndSortCatalog(listings, filters, {
    textMatchesQuery: (listing, normalizedQuery) => listing.title.toLowerCase().includes(normalizedQuery),
    categoryMatches: (listing, category) => category === "all" || listing.category === category,
  });
}

export function getWorldScopedListings(world: CatalogWorld) {
  if (world === "electronics") {
    return electronicsCatalogListings;
  }
  if (world === "autos") {
    return autosCatalogListings;
  }
  if (world === "agriculture") {
    return agricultureCatalogListings;
  }
  if (world === "real_estate") {
    return realEstateCatalogListings;
  }
  if (world === "jobs") {
    return jobsCatalogListings;
  }
  if (world === "services") {
    return servicesCatalogListings;
  }

  return unifiedCatalogListings;
}

export function getCategoryOptionsForWorld(world: CatalogWorld): UnifiedCategoryOption[] {
  if (world !== "all") {
    return worldCategoryCatalog[world];
  }

  const unique = new Map<string, string>();
  categories.forEach((category) => unique.set(category.id, category.label));
  agricultureCategories.forEach((category) => unique.set(category.id, category.label));
  electronicsCategories.forEach((category) => {
    const mapped = mapElectronicsCategoryToWorldCategory(category.id);
    unique.set(mapped.id, mapped.label);
  });
  Object.values(worldCategoryCatalog).forEach((options) =>
    options.forEach((option) => unique.set(option.id, option.label)),
  );
  return [...unique.entries()].map(([id, label]) => ({ id, label }));
}

export function getSubcategoryOptionsForWorld(world: CatalogWorld, categoryId: string) {
  if (!categoryId) {
    return [];
  }

  if (world === "agriculture") {
    return (
      agricultureCategories.find((category) => category.id === categoryId)?.children?.map((child) => ({
        id: child,
        label: child[0].toUpperCase() + child.slice(1),
      })) ?? []
    );
  }

  if (world === "electronics") {
    return electronicsSubcategories[categoryId] ?? [];
  }

  if (world !== "all") {
    return [];
  }

  return [];
}

export function getListingBadges(listing: UnifiedCatalogListing): ListingBadge[] {
  const badges: ListingBadge[] = [];
  const title = listing.title.toLowerCase();
  const condition = listing.condition.toLowerCase();

  if (listing.world === "agriculture") {
    if (listing.priceValue < 500000) {
      badges.push({ id: "agri-price", label: "Популярно у фермеров", tone: "agriculture" });
    } else {
      badges.push({ id: "agri-season", label: "Сезонное", tone: "agriculture" });
    }

    if (["москва", "краснодар", "ростов-на-дону"].includes(listing.location.toLowerCase())) {
      badges.push({ id: "agri-near", label: "Рядом с вами", tone: "agriculture" });
    }
  }

  if (listing.world === "electronics") {
    if (listing.priceValue <= 70000) {
      badges.push({ id: "tech-price", label: "Лучшая цена", tone: "electronics" });
    }

    if (condition.includes("как новый") || condition.includes("гарант")) {
      badges.push({ id: "tech-condition", label: "Как новый", tone: "electronics" });
    } else if (title.includes("игров") || title.includes("playstation")) {
      badges.push({ id: "tech-gaming", label: "Игровой", tone: "electronics" });
    }
  }

  return badges.slice(0, 2);
}

export function filterAndSortUnifiedListings(
  listings: UnifiedCatalogListing[],
  filters: CatalogFilterInput,
) {
  return filterAndSortCatalog(listings, filters, {
    textMatchesQuery: (listing, normalizedQuery) =>
      `${listing.title} ${listing.description} ${listing.categoryLabel}`.toLowerCase().includes(normalizedQuery),
    categoryMatches: (listing, category) => category === "all" || listing.categoryId === category,
  });
}

export function getUniqueLocationsForUnified(listings: UnifiedCatalogListing[]) {
  return [...new Set(listings.map((listing) => listing.location))].sort((a, b) =>
    a.localeCompare(b, "ru"),
  );
}

export function toUnifiedCatalogListing(listing: Listing): UnifiedCatalogListing {
  return {
    id: listing.id,
    title: listing.title,
    price: listing.price,
    priceValue: listing.priceValue,
    location: listing.location,
    publishedAt: listing.publishedAt,
    postedAtIso: listing.postedAtIso,
    image: listing.image,
    condition: listing.condition,
    description: listing.description,
    sellerName: listing.sellerName,
    sellerPhone: listing.sellerPhone,
    categoryId: listing.category,
    categoryLabel: categoryLabels[listing.category],
    world: "base",
    worldLabel: "Все объявления",
    detailsHref: `/listings/${listing.id}`,
  };
}

export function getRelatedListings(listing: Listing, limit = 4) {
  const byCategory = allListings.filter(
    (currentListing) => currentListing.id !== listing.id && currentListing.category === listing.category,
  );
  const fromOtherCategories = allListings.filter(
    (currentListing) => currentListing.id !== listing.id && currentListing.category !== listing.category,
  );

  return [...byCategory, ...fromOtherCategories].slice(0, limit);
}

export function getRelatedUnifiedListings(listing: Listing, limit = 4) {
  return getRelatedListings(listing, limit).map(toUnifiedCatalogListing);
}

export function formatPostedAt(isoDate: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoDate));
}
