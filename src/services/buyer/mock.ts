import type { Dispatch, SetStateAction } from "react";

import type { ProfilePersistedFields } from "@/components/profile/types";
import type { ListingCategory } from "@/lib/types";
import { buildAutoSearchLabel, defaultSavedSearchFilters, type SavedSearch, type SavedSearchFilters } from "@/lib/saved-searches";
import { myListingsMock } from "@/lib/dashboard-mock-data";
import type { Notification } from "@/lib/notifications";
import { getDefaultProfileFieldsSync } from "@/services/auth";
import { getBuyerNotificationsSync } from "@/services/notifications";

import type { AddListingInput, BuyerService } from "./contracts";
import type { BuyerState, PromoteListingInput } from "./types";

export function uid(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatPublishedAtLabel() {
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());
}

export function toDashboardCategory(category: string): ListingCategory {
  if (category === "auto" || category === "electronics" || category === "real_estate" || category === "services") {
    return category;
  }
  return "services";
}

export function makeInitialBuyerState(isBuyerRole: boolean): BuyerState {
  return {
    myListings: isBuyerRole ? [...myListingsMock] : [],
    favorites: isBuyerRole ? [{ id: "2", addedAt: new Date().toISOString() }] : [],
    savedSearches: isBuyerRole
      ? [
          {
            id: uid("ss"),
            name: "Смартфоны до 100 000",
            createdAtIso: new Date().toISOString(),
            alertsEnabled: true,
            filters: { ...defaultSavedSearchFilters, category: "electronics", query: "iPhone", location: "Москва" },
          },
        ]
      : [],
    notifications: isBuyerRole ? getBuyerNotificationsSync() : [],
    profile: getDefaultProfileFieldsSync(),
    promotions: [],
  };
}

export function createMockBuyerService(
  setState: Dispatch<SetStateAction<BuyerState>>,
  options?: {
    canUseFeature?: (feature: import("@/entities/billing/model").Feature) => boolean;
  },
): BuyerService {
  return {
    addListing(input: AddListingInput) {
      const newId = input.id ?? uid("my");
      setState((prev) => ({
        ...prev,
        myListings: [
          {
            id: newId,
            publishedAt: formatPublishedAtLabel(),
            views: 0,
            ...input,
            category: toDashboardCategory(input.category),
          },
          ...prev.myListings,
        ],
      }));
      return newId;
    },

    updateListingStatus(id, status) {
      setState((prev) => ({
        ...prev,
        myListings: prev.myListings.map((item) => (item.id === id ? { ...item, status } : item)),
      }));
    },

    removeListing(id) {
      setState((prev) => ({ ...prev, myListings: prev.myListings.filter((item) => item.id !== id) }));
    },

    addToFavorites(id) {
      setState((prev) => {
        if (prev.favorites.some((item) => item.id === id)) {
          return prev;
        }
        return { ...prev, favorites: [...prev.favorites, { id, addedAt: new Date().toISOString() }] };
      });
    },

    removeFromFavorites(id) {
      setState((prev) => ({ ...prev, favorites: prev.favorites.filter((item) => item.id !== id) }));
    },

    toggleFavorite(id) {
      setState((prev) => {
        if (prev.favorites.some((item) => item.id === id)) {
          return { ...prev, favorites: prev.favorites.filter((item) => item.id !== id) };
        }
        return { ...prev, favorites: [...prev.favorites, { id, addedAt: new Date().toISOString() }] };
      });
    },

    addSavedSearch(filters: SavedSearchFilters, options) {
      let created!: SavedSearch;
      setState((prev) => {
        const entry: SavedSearch = {
          id: uid("ss"),
          name: (options?.name?.trim() || buildAutoSearchLabel(filters)).slice(0, 120),
          createdAtIso: new Date().toISOString(),
          alertsEnabled: options?.alertsEnabled ?? false,
          filters: { ...defaultSavedSearchFilters, ...filters },
        };
        created = entry;
        return { ...prev, savedSearches: [entry, ...prev.savedSearches] };
      });
      return created;
    },

    removeSavedSearch(id) {
      setState((prev) => ({ ...prev, savedSearches: prev.savedSearches.filter((item) => item.id !== id) }));
    },

    renameSavedSearch(id, name) {
      setState((prev) => ({
        ...prev,
        savedSearches: prev.savedSearches.map((item) =>
          item.id === id ? { ...item, name: name.trim().slice(0, 120) || item.name } : item,
        ),
      }));
    },

    setSavedSearchAlerts(id, enabled) {
      if (enabled && options?.canUseFeature && !options.canUseFeature("saved_searches_alerts")) {
        throw new Error("Feature saved_searches_alerts is not available");
      }
      setState((prev) => ({
        ...prev,
        savedSearches: prev.savedSearches.map((item) => (item.id === id ? { ...item, alertsEnabled: enabled } : item)),
      }));
    },

    markNotificationRead(id) {
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
      }));
    },

    markAllNotificationsRead() {
      setState((prev) => ({ ...prev, notifications: prev.notifications.map((item) => ({ ...item, isRead: true })) }));
    },

    addNotification(notification: Omit<Notification, "id">) {
      setState((prev) => ({
        ...prev,
        notifications: [{ ...notification, id: uid("n") }, ...prev.notifications],
      }));
    },

    saveProfile(next: ProfilePersistedFields) {
      setState((prev) => ({ ...prev, profile: { ...next } }));
    },

    promoteListing(input: PromoteListingInput) {
      if (options?.canUseFeature && !options.canUseFeature("listing_promote")) {
        throw new Error("Feature listing_promote is not available");
      }
      const now = new Date();
      setState((prev) => ({
        ...prev,
        promotions: [
          {
            id: uid("promo"),
            sellerId: "alexey-drive",
            scope: input.scope,
            worldId: input.scope === "world" ? input.worldId : undefined,
            period: input.period,
            title: `Продвижение: ${input.listingTitle}`,
            subtitle: "Герой доски частника",
            ctaLabel: "Открыть кабинет",
            ctaHref: "/dashboard",
            isActive: true,
            startsAt: now.toISOString(),
            endsAt: new Date(
              now.getTime() +
                (input.period === "day" ? 1 : input.period === "week" ? 7 : 30) * 24 * 60 * 60 * 1000,
            ).toISOString(),
            mockPrice: input.mockPrice,
            listingId: input.listingId,
            listingTitle: input.listingTitle,
          },
          ...prev.promotions.map((item) => ({ ...item, isActive: false })),
        ],
      }));
    },
  };
}

export const createBuyerService = createMockBuyerService;
