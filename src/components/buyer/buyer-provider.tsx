"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";

import type { DashboardListing } from "@/components/dashboard/types";
import { useDemoRole } from "@/components/demo-role/demo-role";
import type { ProfilePersistedFields } from "@/components/profile/types";
import { myListingsMock } from "@/lib/dashboard-mock-data";
import type { HeroBannerPeriod, HeroBannerPlacement, HeroBannerScope, HeroBannerWorld } from "@/lib/hero-board";
import { mockConversations, type Conversation } from "@/lib/messages";
import { getDefaultMockNotifications, type Notification } from "@/lib/notifications";
import { defaultProfileFields, profileAccountMock } from "@/lib/profile-mock";
import { buildAutoSearchLabel, defaultSavedSearchFilters, type SavedSearch, type SavedSearchFilters } from "@/lib/saved-searches";
import type { ListingCategory } from "@/lib/types";

type FavoriteEntry = { id: string; addedAt: string };

type BuyerState = {
  myListings: DashboardListing[];
  favorites: FavoriteEntry[];
  savedSearches: SavedSearch[];
  messages: Conversation[];
  notifications: Notification[];
  profile: ProfilePersistedFields;
  promotions: Array<HeroBannerPlacement & { listingId: string; listingTitle: string }>;
};

type BuyerContextValue = BuyerState & {
  unreadCounts: { messages: number; notifications: number };
  addListing: (input: Omit<DashboardListing, "id" | "publishedAt" | "views" | "category"> & { category: string }) => void;
  updateListingStatus: (id: string, status: DashboardListing["status"]) => void;
  removeListing: (id: string) => void;
  addToFavorites: (id: string) => void;
  removeFromFavorites: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getFavoriteAddedAt: (id: string) => string | null;
  addSavedSearch: (filters: SavedSearchFilters, options?: { name?: string; alertsEnabled?: boolean }) => SavedSearch;
  removeSavedSearch: (id: string) => void;
  renameSavedSearch: (id: string, name: string) => void;
  setSavedSearchAlerts: (id: string, enabled: boolean) => void;
  markConversationRead: (id: string) => void;
  ensureConversation: (input: { listingId: string; sellerName?: string | null; listingTitle?: string | null }) => string | null;
  sendMessage: (conversationId: string, text: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: Omit<Notification, "id">) => void;
  saveProfile: (next: ProfilePersistedFields) => void;
  promoteListing: (input: {
    listingId: string;
    listingTitle: string;
    scope: HeroBannerScope;
    period: HeroBannerPeriod;
    worldId?: HeroBannerWorld;
    mockPrice: number;
  }) => void;
};

const BuyerContext = createContext<BuyerContextValue | null>(null);

function uid(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatPublishedAtLabel() {
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());
}

function toDashboardCategory(category: string): ListingCategory {
  if (category === "auto" || category === "electronics" || category === "real_estate" || category === "services") {
    return category;
  }
  return "services";
}

function makeInitialState(isBuyerRole: boolean): BuyerState {
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
    messages: isBuyerRole ? structuredClone(mockConversations) : [],
    notifications: isBuyerRole ? getDefaultMockNotifications() : [],
    profile: { ...defaultProfileFields },
    promotions: [],
  };
}

export function BuyerProvider({ children }: { children: ReactNode }) {
  const { role, currentSellerId } = useDemoRole();
  const isBuyerRole = role === "buyer" || role === "all";
  const sessionKey = `${role}:${currentSellerId ?? "none"}:${isBuyerRole ? "buyer" : "other"}`;
  return (
    <BuyerStateProvider key={sessionKey} isBuyerRole={isBuyerRole}>
      {children}
    </BuyerStateProvider>
  );
}

function BuyerStateProvider({ children, isBuyerRole }: { children: ReactNode; isBuyerRole: boolean }) {
  const [state, setState] = useState<BuyerState>(() => makeInitialState(isBuyerRole));
  const value = useMemo<BuyerContextValue>(() => {
    const unreadCounts = {
      messages: state.messages.reduce((sum, conversation) => sum + conversation.unreadCount, 0),
      notifications: state.notifications.reduce((sum, item) => sum + (item.isRead ? 0 : 1), 0),
    };

    return {
      ...state,
      unreadCounts,
      addListing: (input) =>
        setState((prev) => ({
          ...prev,
          myListings: [
            {
              id: uid("my"),
              publishedAt: formatPublishedAtLabel(),
              views: 0,
              ...input,
              category: toDashboardCategory(input.category),
            },
            ...prev.myListings,
          ],
        })),
      updateListingStatus: (id, status) =>
        setState((prev) => ({
          ...prev,
          myListings: prev.myListings.map((item) => (item.id === id ? { ...item, status } : item)),
        })),
      removeListing: (id) =>
        setState((prev) => ({ ...prev, myListings: prev.myListings.filter((item) => item.id !== id) })),
      addToFavorites: (id) =>
        setState((prev) => {
          if (prev.favorites.some((item) => item.id === id)) {
            return prev;
          }
          return { ...prev, favorites: [...prev.favorites, { id, addedAt: new Date().toISOString() }] };
        }),
      removeFromFavorites: (id) =>
        setState((prev) => ({ ...prev, favorites: prev.favorites.filter((item) => item.id !== id) })),
      toggleFavorite: (id) =>
        setState((prev) => {
          if (prev.favorites.some((item) => item.id === id)) {
            return { ...prev, favorites: prev.favorites.filter((item) => item.id !== id) };
          }
          return { ...prev, favorites: [...prev.favorites, { id, addedAt: new Date().toISOString() }] };
        }),
      getFavoriteAddedAt: (id) => state.favorites.find((item) => item.id === id)?.addedAt ?? null,
      addSavedSearch: (filters, options) => {
        const entry: SavedSearch = {
          id: uid("ss"),
          name: (options?.name?.trim() || buildAutoSearchLabel(filters)).slice(0, 120),
          createdAtIso: new Date().toISOString(),
          alertsEnabled: options?.alertsEnabled ?? false,
          filters: { ...defaultSavedSearchFilters, ...filters },
        };
        setState((prev) => ({ ...prev, savedSearches: [entry, ...prev.savedSearches] }));
        return entry;
      },
      removeSavedSearch: (id) =>
        setState((prev) => ({ ...prev, savedSearches: prev.savedSearches.filter((item) => item.id !== id) })),
      renameSavedSearch: (id, name) =>
        setState((prev) => ({
          ...prev,
          savedSearches: prev.savedSearches.map((item) =>
            item.id === id ? { ...item, name: name.trim().slice(0, 120) || item.name } : item,
          ),
        })),
      setSavedSearchAlerts: (id, enabled) =>
        setState((prev) => ({
          ...prev,
          savedSearches: prev.savedSearches.map((item) => (item.id === id ? { ...item, alertsEnabled: enabled } : item)),
        })),
      markConversationRead: (id) =>
        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((conversation) =>
            conversation.id === id ? { ...conversation, unreadCount: 0 } : conversation,
          ),
        })),
      ensureConversation: ({ listingId, sellerName, listingTitle }) => {
        const existing = state.messages.find((item) => item.listingId === listingId);
        if (existing) {
          return existing.id;
        }
        if (!sellerName && !listingTitle) {
          return null;
        }
        const id = uid("conv");
        setState((prev) => ({
          ...prev,
          messages: [
            {
              id,
              listingId,
              participantName: sellerName ?? "Пользователь",
              participantRole: "Продавец",
              unreadCount: 0,
              messages: [
                {
                  id: uid("m"),
                  author: "other",
                  text: `Здравствуйте! По объявлению "${listingTitle ?? "товар"}" на связи.`,
                  sentAtIso: new Date().toISOString(),
                },
              ],
            },
            ...prev.messages,
          ],
        }));
        return id;
      },
      sendMessage: (conversationId, text) =>
        setState((prev) => ({
          ...prev,
          messages: [...prev.messages]
            .map((conversation) =>
              conversation.id === conversationId
                ? {
                    ...conversation,
                    unreadCount: 0,
                    messages: [
                      ...conversation.messages,
                      { id: uid("m"), author: "me" as const, text: text.trim(), sentAtIso: new Date().toISOString() },
                    ],
                  }
                : conversation,
            )
            .sort((left, right) => {
              const leftTime = new Date(left.messages[left.messages.length - 1]?.sentAtIso ?? 0).getTime();
              const rightTime = new Date(right.messages[right.messages.length - 1]?.sentAtIso ?? 0).getTime();
              return rightTime - leftTime;
            }),
        })),
      markNotificationRead: (id) =>
        setState((prev) => ({
          ...prev,
          notifications: prev.notifications.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
        })),
      markAllNotificationsRead: () =>
        setState((prev) => ({ ...prev, notifications: prev.notifications.map((item) => ({ ...item, isRead: true })) })),
      addNotification: (notification) =>
        setState((prev) => ({
          ...prev,
          notifications: [{ ...notification, id: uid("n") }, ...prev.notifications],
        })),
      saveProfile: (next) => setState((prev) => ({ ...prev, profile: { ...next } })),
      promoteListing: (input) => {
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
  }, [state]);

  return <BuyerContext.Provider value={value}>{children}</BuyerContext.Provider>;
}

export function useBuyer() {
  const context = useContext(BuyerContext);
  if (!context) {
    throw new Error("useBuyer must be used within BuyerProvider");
  }
  return context;
}

export function useBuyerProfileMeta() {
  return {
    email: profileAccountMock.email,
    registeredAtIso: profileAccountMock.registeredAt,
    registeredAtLabel: new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(profileAccountMock.registeredAt)),
  };
}
