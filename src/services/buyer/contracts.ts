import type { DashboardListing } from "@/components/dashboard/types";
import type { ProfilePersistedFields } from "@/components/profile/types";
import type { Notification } from "@/lib/notifications";
import type { SavedSearch, SavedSearchFilters } from "@/lib/saved-searches";

import type { PromoteListingInput } from "./types";

export type AddListingInput = Omit<DashboardListing, "id" | "publishedAt" | "views" | "category"> & {
  id?: string;
  category: string;
};

export interface BuyerService {
  addListing(input: AddListingInput): string;
  updateListingStatus(id: string, status: DashboardListing["status"]): void;
  removeListing(id: string): void;
  addToFavorites(id: string): void;
  removeFromFavorites(id: string): void;
  toggleFavorite(id: string): void;
  addSavedSearch(
    filters: SavedSearchFilters,
    options?: { name?: string; alertsEnabled?: boolean },
  ): SavedSearch;
  removeSavedSearch(id: string): void;
  renameSavedSearch(id: string, name: string): void;
  setSavedSearchAlerts(id: string, enabled: boolean): void;
  markNotificationRead(id: string): void;
  markAllNotificationsRead(): void;
  addNotification(notification: Omit<Notification, "id">): void;
  saveProfile(next: ProfilePersistedFields): void;
  promoteListing(input: PromoteListingInput): void;
}
