"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { useDemoRole } from "@/components/demo-role/demo-role";
import { useSubscription } from "@/components/subscription/subscription-provider";
import { resolveActorIdsForRole } from "@/lib/messages-actors";
import { getProfileAccountSync } from "@/services/auth";
import { createFeatureGateService } from "@/services/feature-gate";
import { messagesService } from "@/services/messages";
import type { BuyerService } from "@/services/buyer/contracts";
import { createBuyerService, makeInitialBuyerState } from "@/services/buyer";
import type { BuyerState } from "@/services/buyer/types";

type BuyerContextValue = BuyerState & {
  unreadCounts: { messages: number; notifications: number };
  addListing: BuyerService["addListing"];
  updateListingStatus: BuyerService["updateListingStatus"];
  removeListing: BuyerService["removeListing"];
  addToFavorites: BuyerService["addToFavorites"];
  removeFromFavorites: BuyerService["removeFromFavorites"];
  toggleFavorite: BuyerService["toggleFavorite"];
  getFavoriteAddedAt: (id: string) => string | null;
  addSavedSearch: BuyerService["addSavedSearch"];
  removeSavedSearch: BuyerService["removeSavedSearch"];
  renameSavedSearch: BuyerService["renameSavedSearch"];
  setSavedSearchAlerts: BuyerService["setSavedSearchAlerts"];
  markNotificationRead: BuyerService["markNotificationRead"];
  markAllNotificationsRead: BuyerService["markAllNotificationsRead"];
  addNotification: BuyerService["addNotification"];
  saveProfile: BuyerService["saveProfile"];
  promoteListing: BuyerService["promoteListing"];
};

const BuyerContext = createContext<BuyerContextValue | null>(null);
const BuyerServiceContext = createContext<BuyerService | null>(null);

export function BuyerProvider({ children }: { children: ReactNode }) {
  const { role, currentSellerId } = useDemoRole();
  const subscription = useSubscription();
  const isBuyerRole = role === "buyer" || role === "all";
  const sessionKey = `${role}:${currentSellerId ?? "none"}:${isBuyerRole ? "buyer" : "other"}:${subscription.planName}:${subscription.storePlan}`;
  return (
    <BuyerStateProvider
      key={sessionKey}
      isBuyerRole={isBuyerRole}
      role={role}
      currentSellerId={currentSellerId}
      subscriptionSnapshot={{
        isPro: subscription.isPro,
        planName: subscription.planName,
        storePlan: subscription.storePlan,
      }}
    >
      {children}
    </BuyerStateProvider>
  );
}

function BuyerStateProvider({
  children,
  isBuyerRole,
  role,
  currentSellerId,
  subscriptionSnapshot,
}: {
  children: ReactNode;
  isBuyerRole: boolean;
  role: ReturnType<typeof useDemoRole>["role"];
  currentSellerId: string | null;
  subscriptionSnapshot: {
    isPro: boolean;
    planName: ReturnType<typeof useSubscription>["planName"];
    storePlan: ReturnType<typeof useSubscription>["storePlan"];
  };
}) {
  const [state, setState] = useState<BuyerState>(() => makeInitialBuyerState(isBuyerRole));
  const [messagesUnread, setMessagesUnread] = useState(0);
  const actorIds = useMemo(() => resolveActorIdsForRole(role, currentSellerId), [role, currentSellerId]);

  const buyerService = useMemo(() => {
    const gate = createFeatureGateService(subscriptionSnapshot, role);
    return createBuyerService(setState, {
      canUseFeature: (feature) => gate.canUse(feature),
    });
  }, [role, subscriptionSnapshot]);

  useEffect(() => {
    if (actorIds.length === 0) {
      return;
    }
    let alive = true;
    void Promise.all(actorIds.map((id) => messagesService.getUnreadCount(id))).then((counts) => {
      if (!alive) return;
      setMessagesUnread(counts.reduce((sum, x) => sum + x, 0));
    });
    return () => {
      alive = false;
    };
  }, [actorIds]);

  const value = useMemo<BuyerContextValue>(() => {
    const unreadCounts = {
      messages: actorIds.length === 0 ? 0 : messagesUnread,
      notifications: state.notifications.reduce((sum, item) => sum + (item.isRead ? 0 : 1), 0),
    };

    return {
      ...state,
      unreadCounts,
      addListing: (input) => buyerService.addListing(input),
      updateListingStatus: (id, status) => buyerService.updateListingStatus(id, status),
      removeListing: (id) => buyerService.removeListing(id),
      addToFavorites: (id) => buyerService.addToFavorites(id),
      removeFromFavorites: (id) => buyerService.removeFromFavorites(id),
      toggleFavorite: (id) => buyerService.toggleFavorite(id),
      getFavoriteAddedAt: (id) => state.favorites.find((item) => item.id === id)?.addedAt ?? null,
      addSavedSearch: (filters, options) => buyerService.addSavedSearch(filters, options),
      removeSavedSearch: (id) => buyerService.removeSavedSearch(id),
      renameSavedSearch: (id, name) => buyerService.renameSavedSearch(id, name),
      setSavedSearchAlerts: (id, enabled) => buyerService.setSavedSearchAlerts(id, enabled),
      markNotificationRead: (id) => buyerService.markNotificationRead(id),
      markAllNotificationsRead: () => buyerService.markAllNotificationsRead(),
      addNotification: (notification) => buyerService.addNotification(notification),
      saveProfile: (next) => buyerService.saveProfile(next),
      promoteListing: (input) => buyerService.promoteListing(input),
    };
  }, [state, buyerService, messagesUnread, actorIds.length]);

  return (
    <BuyerServiceContext.Provider value={buyerService}>
      <BuyerContext.Provider value={value}>{children}</BuyerContext.Provider>
    </BuyerServiceContext.Provider>
  );
}

export function useBuyer() {
  const context = useContext(BuyerContext);
  if (!context) {
    throw new Error("useBuyer must be used within BuyerProvider");
  }
  return context;
}

export function useBuyerService(): BuyerService {
  const service = useContext(BuyerServiceContext);
  if (!service) {
    throw new Error("useBuyerService must be used within BuyerProvider");
  }
  return service;
}

export function useBuyerProfileMeta() {
  const profileAccount = getProfileAccountSync();
  return {
    email: profileAccount.email,
    registeredAtIso: profileAccount.registeredAt,
    registeredAtLabel: new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(profileAccount.registeredAt)),
  };
}
