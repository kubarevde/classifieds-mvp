"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Listing } from "@/lib/types";

type PublishedMap = Record<string, Listing>;

type PublishedListingState = {
  listings: PublishedMap;
  putListing: (id: string, listing: Listing) => void;
  removeListing: (id: string) => void;
};

const MAX_ENTRIES = 24;

function pruneListings(listings: PublishedMap): PublishedMap {
  const entries = Object.entries(listings);
  if (entries.length <= MAX_ENTRIES) {
    return listings;
  }
  const slice = entries.slice(entries.length - MAX_ENTRIES);
  return Object.fromEntries(slice);
}

export const usePublishedListingStore = create<PublishedListingState>()(
  persist(
    (set) => ({
      listings: {},
      putListing: (id, listing) =>
        set((state) => ({
          listings: pruneListings({ ...state.listings, [id]: listing }),
        })),
      removeListing: (id) =>
        set((state) => {
          const next = { ...state.listings };
          delete next[id];
          return { listings: next };
        }),
    }),
    {
      name: "classifieds:published-listings",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ listings: state.listings }),
    },
  ),
);
