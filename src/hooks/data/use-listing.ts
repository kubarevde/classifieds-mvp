"use client";

import { useCallback, useEffect, useState } from "react";

import type { UnifiedCatalogListing } from "@/lib/listings.types";
import { getListingById } from "@/services/listings";

export type UseListingState = {
  data: UnifiedCatalogListing | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useListing(id: string | null): UseListingState {
  const [data, setData] = useState<UnifiedCatalogListing | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void getListingById(id)
      .then((row) => {
        if (!cancelled) {
          setData(row);
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
  }, [id, tick]);

  return { data, loading, error, refetch };
}
