import type { DashboardListing } from "@/components/dashboard/types";
import type { ProfilePersistedFields } from "@/components/profile/types";
import type { HeroBannerPeriod, HeroBannerPlacement, HeroBannerScope, HeroBannerWorld } from "@/lib/hero-board";
import type { Conversation } from "@/lib/messages";
import type { Notification } from "@/lib/notifications";
import type { SavedSearch } from "@/lib/saved-searches";

export type FavoriteEntry = { id: string; addedAt: string };

export type BuyerState = {
  myListings: DashboardListing[];
  favorites: FavoriteEntry[];
  savedSearches: SavedSearch[];
  messages: Conversation[];
  notifications: Notification[];
  profile: ProfilePersistedFields;
  promotions: Array<HeroBannerPlacement & { listingId: string; listingTitle: string }>;
};

export type PromoteListingInput = {
  listingId: string;
  listingTitle: string;
  scope: HeroBannerScope;
  period: HeroBannerPeriod;
  worldId?: HeroBannerWorld;
  mockPrice: number;
};
