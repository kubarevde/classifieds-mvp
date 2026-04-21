import { categories, popularListings } from "@/lib/mock-data";
import { Listing, ListingCategory } from "@/lib/types";

export type SortOption = "newest" | "price_asc" | "price_desc";
export type ListingsView = "grid" | "list";

export const sortOptions: Record<SortOption, string> = {
  newest: "Сначала новые",
  price_asc: "Сначала дешевле",
  price_desc: "Сначала дороже",
};

export const categoryLabels: Record<ListingCategory, string> = Object.fromEntries(
  categories.map((category) => [category.id, category.label]),
) as Record<ListingCategory, string>;

export const allListings = popularListings;

export function getUniqueLocations(listings: Listing[]) {
  return [...new Set(listings.map((listing) => listing.location))].sort((a, b) =>
    a.localeCompare(b, "ru"),
  );
}

type FilterInput = {
  query: string;
  category: "all" | ListingCategory;
  location: "all" | string;
  sortBy: SortOption;
};

export function filterAndSortListings(listings: Listing[], filters: FilterInput) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  const filtered = listings.filter((listing) => {
    const matchesQuery = normalizedQuery
      ? listing.title.toLowerCase().includes(normalizedQuery)
      : true;
    const matchesCategory = filters.category === "all" || listing.category === filters.category;
    const matchesLocation = filters.location === "all" || listing.location === filters.location;

    return matchesQuery && matchesCategory && matchesLocation;
  });

  return filtered.sort((a, b) => {
    if (filters.sortBy === "price_asc") {
      return a.priceValue - b.priceValue;
    }

    if (filters.sortBy === "price_desc") {
      return b.priceValue - a.priceValue;
    }

    return new Date(b.postedAtIso).getTime() - new Date(a.postedAtIso).getTime();
  });
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

export function formatPostedAt(isoDate: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoDate));
}
