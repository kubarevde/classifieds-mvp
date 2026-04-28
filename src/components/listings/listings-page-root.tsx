"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { ListingsPageClient } from "@/components/listings/listings-page-client";
import {
  defaultSavedSearchFilters,
  hasSavedSearchUrlParams,
  parseIntentFromSearchParams,
  parseFiltersFromSearchParams,
} from "@/lib/saved-searches";

export function ListingsPageRoot() {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const initialFilters = useMemo(() => {
    const params = new URLSearchParams(queryString);
    if (!hasSavedSearchUrlParams(params)) {
      return defaultSavedSearchFilters;
    }

    return parseFiltersFromSearchParams(params) ?? defaultSavedSearchFilters;
  }, [queryString]);
  const initialIntent = useMemo(() => {
    const params = new URLSearchParams(queryString);
    return parseIntentFromSearchParams(params);
  }, [queryString]);

  return <ListingsPageClient initialFilters={initialFilters} initialIntent={initialIntent} />;
}
