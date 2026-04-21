"use client";

import { useMemo, useState } from "react";

import { FiltersBar } from "@/components/listings/filters-bar";
import { ListingsGrid } from "@/components/listings/listings-grid";
import {
  allListings,
  filterAndSortListings,
  getUniqueLocations,
  ListingsView,
  SortOption,
} from "@/lib/listings";
import { ListingCategory } from "@/lib/types";

export function ListingsPageClient() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | ListingCategory>("all");
  const [location, setLocation] = useState<"all" | string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [view, setView] = useState<ListingsView>("grid");

  const locations = useMemo(() => getUniqueLocations(allListings), []);

  const visibleListings = useMemo(
    () => filterAndSortListings(allListings, { query, category, location, sortBy }),
    [query, category, location, sortBy],
  );

  return (
    <div className="space-y-4">
      <FiltersBar
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
        location={location}
        onLocationChange={setLocation}
        locations={locations}
        sortBy={sortBy}
        onSortChange={setSortBy}
        view={view}
        onViewChange={setView}
      />

      <p className="text-sm text-slate-500">
        Найдено объявлений: <span className="font-semibold text-slate-700">{visibleListings.length}</span>
      </p>
      <ListingsGrid listings={visibleListings} view={view} />
    </div>
  );
}
