"use client";

import { ReactNode } from "react";

import { useBuyer, useBuyerProfileMeta } from "@/components/buyer/buyer-provider";

export function ProfileProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useProfile() {
  const buyer = useBuyer();
  const meta = useBuyerProfileMeta();
  return {
    ...buyer.profile,
    ...meta,
    isHydrated: true,
    saveProfile: buyer.saveProfile,
  };
}
