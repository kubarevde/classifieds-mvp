"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { BuyerRequest } from "@/entities/requests/model";
import { getBuyerRequests, type BuyerRequestFilters } from "@/services/requests";

export type UseBuyerRequestsState = {
  data: BuyerRequest[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useBuyerRequests(filters?: BuyerRequestFilters): UseBuyerRequestsState {
  const [data, setData] = useState<BuyerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  const filtersKey = useMemo(() => JSON.stringify(filters ?? {}), [filters]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void getBuyerRequests(filters)
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
