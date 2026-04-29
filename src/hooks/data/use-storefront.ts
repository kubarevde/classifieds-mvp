"use client";

import { useCallback, useEffect, useState } from "react";

import type { SellerStorefront } from "@/entities/seller/model";
import { getStorefrontSellerById } from "@/lib/sellers";

export type UseStorefrontState = {
  data: SellerStorefront | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useStorefront(id: string | null): UseStorefrontState {
  const [data, setData] = useState<SellerStorefront | null>(null);
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
    void Promise.resolve(getStorefrontSellerById(id))
      .then((row) => {
        if (!cancelled) {
          setData(row ?? null);
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
