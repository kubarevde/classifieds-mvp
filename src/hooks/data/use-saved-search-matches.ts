"use client";

import { useEffect, useMemo, useState } from "react";

import type { SavedSearch } from "@/entities/search/model";
import { serializeIntentKey } from "@/lib/saved-searches";
import {
  getMatchSummariesForSavedSearches,
  getMatchSummaryForSavedSearch,
  type SavedSearchMatchSummary,
} from "@/services/saved-searches";

export function useSavedSearchMatchSummary(search: SavedSearch | null) {
  const [summary, setSummary] = useState<SavedSearchMatchSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const revision = useMemo(
    () =>
      search
        ? `${search.id}:${search.lastViewedAt ?? ""}:${serializeIntentKey(search.intent)}`
        : "",
    [search],
  );

  useEffect(() => {
    if (!search) {
      setSummary(null);
      setLoading(false);
      setError(null);
      return;
    }
    const snapshot = search;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void getMatchSummaryForSavedSearch(snapshot)
      .then((row) => {
        if (!cancelled) {
          setSummary(row);
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
  }, [revision, search]);

  return { summary, loading, error };
}

export function useSavedSearchesNewMatchesTotal(searches: SavedSearch[]) {
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const revision = useMemo(() => searches.map((s) => `${s.id}:${s.lastViewedAt ?? ""}`).join("|"), [searches]);

  useEffect(() => {
    if (searches.length === 0) {
      setTotal(0);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void getMatchSummariesForSavedSearches(searches)
      .then((map) => {
        if (cancelled) {
          return;
        }
        const sum = Object.values(map).reduce((acc, item) => acc + item.newMatches, 0);
        setTotal(sum);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [revision, searches]);

  return { total, loading };
}
