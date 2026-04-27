"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { WizardCoreValues } from "@/components/create-listing/create-listing-schema";
import type { CatalogWorld } from "@/lib/listings";

export type ListingSaleMode = "fixed" | "auction" | "free";

export type DraftPhoto = {
  id: string;
  dataUrl: string;
  name: string;
};

export type ListingDraftSnapshot = {
  version: 1;
  step: number;
  world: CatalogWorld;
  category: string;
  subCategory: string;
  saleMode: ListingSaleMode;
  title: string;
  description: string;
  price: string;
  condition: string;
  city: string;
  contactMethod: "" | "phone" | "chat" | "both";
  availability: "weekdays" | "weekends" | "evenings" | "flexible";
  sellerName: string;
  phone: string;
  useProfileContacts: boolean;
  isAuthenticated: boolean;
  coverPhotoId: string | null;
  photos: DraftPhoto[];
  wantPromotion: boolean;
  promotePeriod: "day" | "week" | "month";
  promoteScope: "global" | "world";
  auctionStartPrice: string;
  auctionReservePrice: string;
  auctionStartNow: boolean;
  auctionStartAt: string;
  auctionDurationHours: 12 | 24 | 72 | 168;
  auctionAntiSnipingEnabled: boolean;
  auctionMinBidIncrement: string;
};

const defaultDraft: ListingDraftSnapshot = {
  version: 1,
  step: 0,
  world: "electronics",
  category: "",
  subCategory: "",
  saleMode: "fixed",
  title: "",
  description: "",
  price: "",
  condition: "good",
  city: "",
  contactMethod: "",
  availability: "flexible",
  sellerName: "",
  phone: "",
  useProfileContacts: true,
  isAuthenticated: true,
  coverPhotoId: null,
  photos: [],
  wantPromotion: false,
  promotePeriod: "week",
  promoteScope: "global",
  auctionStartPrice: "",
  auctionReservePrice: "",
  auctionStartNow: true,
  auctionStartAt: "",
  auctionDurationHours: 24,
  auctionAntiSnipingEnabled: true,
  auctionMinBidIncrement: "",
};

type ListingDraftState = {
  draft: ListingDraftSnapshot | null;
  lastSavedAt: string | null;
  setDraft: (next: Partial<ListingDraftSnapshot>) => void;
  replaceDraft: (next: ListingDraftSnapshot) => void;
  clearDraft: () => void;
  touchSaved: () => void;
};

export const useListingDraftStore = create<ListingDraftState>()(
  persist(
    (set) => ({
      draft: null,
      lastSavedAt: null,
      setDraft: (patch) =>
        set((state) => ({
          draft: { ...(state.draft ?? defaultDraft), ...patch, version: 1 },
        })),
      replaceDraft: (next) => set({ draft: { ...next, version: 1 } }),
      clearDraft: () => set({ draft: null, lastSavedAt: null }),
      touchSaved: () => set({ lastSavedAt: new Date().toISOString() }),
    }),
    {
      name: "classifieds:listing-draft",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        draft: state.draft,
        lastSavedAt: state.lastSavedAt,
      }),
    },
  ),
);

export function getListingDraftDefaults(overrides?: Partial<ListingDraftSnapshot>): WizardCoreValues {
  const merged: ListingDraftSnapshot = { ...defaultDraft, ...overrides, version: 1 };
  return {
    world: merged.world,
    category: merged.category,
    subCategory: merged.subCategory,
    saleMode: merged.saleMode,
    title: merged.title,
    description: merged.description,
    price: merged.price,
    condition: merged.condition,
    city: merged.city,
    contactMethod: merged.contactMethod,
    availability: merged.availability,
    sellerName: merged.sellerName,
    phone: merged.phone,
    useProfileContacts: merged.useProfileContacts,
    isAuthenticated: merged.isAuthenticated,
    wantPromotion: merged.wantPromotion,
    promotePeriod: merged.promotePeriod,
    promoteScope: merged.promoteScope,
    auctionStartPrice: merged.auctionStartPrice,
    auctionReservePrice: merged.auctionReservePrice,
    auctionStartNow: merged.auctionStartNow,
    auctionStartAt: merged.auctionStartAt,
    auctionDurationHours: merged.auctionDurationHours,
    auctionAntiSnipingEnabled: merged.auctionAntiSnipingEnabled,
    auctionMinBidIncrement: merged.auctionMinBidIncrement,
  };
}
