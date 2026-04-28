"use client";

import type { SavedSearch } from "@/entities/search/model";

import { EmptySavedSearchesState } from "./empty-saved-searches-state";
import { SavedSearchCard } from "./saved-search-card";

type SavedSearchListProps = {
  searches: SavedSearch[];
};

export function SavedSearchList({ searches }: SavedSearchListProps) {
  if (searches.length === 0) {
    return <EmptySavedSearchesState />;
  }

  return (
    <div className="space-y-4">
      {searches.map((search) => (
        <SavedSearchCard key={search.id} search={search} />
      ))}
    </div>
  );
}
