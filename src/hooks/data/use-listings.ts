"use client";

import { useCallback, useEffect, useState } from "react";

import type { ListingFilters } from "@/services/listings";
import { getListings } from "@/services/listings";
import type { UnifiedCatalogListing } from "@/lib/listings.types";

export type UseListingsState = {
  data: UnifiedCatalogListing[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useListings(filters?: ListingFilters): UseListingsState {
  const [data, setData] = useState<UnifiedCatalogListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  const filtersKey = JSON.stringify(filters ?? {});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void getListings(filters)
      .then((rows) => {
        if (!cancelled) {
          setData(rows);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [filters, filtersKey, tick]);

  return { data, loading, error, refetch };
}
