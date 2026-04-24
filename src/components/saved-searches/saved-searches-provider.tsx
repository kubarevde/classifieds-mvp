"use client";

import { ReactNode } from "react";

import { useBuyer } from "@/components/buyer/buyer-provider";

export function SavedSearchesProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useSavedSearches() {
  const buyer = useBuyer();
  return {
    searches: [...buyer.savedSearches].sort(
      (a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime(),
    ),
    isHydrated: true,
    addSearch: buyer.addSavedSearch,
    removeSearch: buyer.removeSavedSearch,
    renameSearch: buyer.renameSavedSearch,
    setAlertsEnabled: buyer.setSavedSearchAlerts,
  };
}
