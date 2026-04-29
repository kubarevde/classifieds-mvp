"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";

import { useDemoRole } from "@/components/demo-role/demo-role";
import { useSubscription } from "@/components/subscription/subscription-provider";
import { getProfileAccountSync } from "@/services/auth";
import { createFeatureGateService } from "@/services/feature-gate";
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
  markConversationRead: BuyerService["markConversationRead"];
  ensureConversation: BuyerService["ensureConversation"];
  sendMessage: BuyerService["sendMessage"];
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
  subscriptionSnapshot,
}: {
  children: ReactNode;
  isBuyerRole: boolean;
  role: ReturnType<typeof useDemoRole>["role"];
  subscriptionSnapshot: {
    isPro: boolean;
    planName: ReturnType<typeof useSubscription>["planName"];
    storePlan: ReturnType<typeof useSubscription>["storePlan"];
  };
}) {
  const [state, setState] = useState<BuyerState>(() => makeInitialBuyerState(isBuyerRole));

  const buyerService = useMemo(() => {
    const gate = createFeatureGateService(subscriptionSnapshot, role);
    return createBuyerService(setState, {
      canUseFeature: (feature) => gate.canUse(feature),
    });
  }, [role, subscriptionSnapshot]);

  const value = useMemo<BuyerContextValue>(() => {
    const unreadCounts = {
      messages: state.messages.reduce((sum, conversation) => sum + conversation.unreadCount, 0),
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
      markConversationRead: (id) => buyerService.markConversationRead(id),
      ensureConversation: (input) => buyerService.ensureConversation(input),
      sendMessage: (conversationId, text) => buyerService.sendMessage(conversationId, text),
      markNotificationRead: (id) => buyerService.markNotificationRead(id),
      markAllNotificationsRead: () => buyerService.markAllNotificationsRead(),
      addNotification: (notification) => buyerService.addNotification(notification),
      saveProfile: (next) => buyerService.saveProfile(next),
      promoteListing: (input) => buyerService.promoteListing(input),
    };
  }, [state, buyerService]);

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
