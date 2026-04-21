"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { ListingsPageClient } from "@/components/listings/listings-page-client";
import {
  defaultSavedSearchFilters,
  hasSavedSearchUrlParams,
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

  return <ListingsPageClient key={queryString || "__catalog__"} initialFilters={initialFilters} />;
}
