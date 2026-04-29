"use client";

import { getVerificationProfile } from "@/services/verification";
import { VerificationBadge } from "./VerificationBadge";

export function VerificationBadgeForListing({ storeId }: { storeId: string }) {
  const storeProfile = getVerificationProfile(storeId, "store");
  const sellerProfile = getVerificationProfile(storeId, "seller");
  if (!storeProfile || !sellerProfile) {
    return <VerificationBadge status="not_started" level="basic" size="sm" variant="compact" />;
  }

  const storeVerified = storeProfile.status === "verified" && storeProfile.level === "business";
  if (storeVerified) {
    return <VerificationBadge status={storeProfile.status} level={storeProfile.level} size="sm" variant="compact" />;
  }

  if (sellerProfile.status === "verified" && sellerProfile.level === "identity") {
    return <VerificationBadge status={sellerProfile.status} level={sellerProfile.level} size="sm" variant="compact" />;
  }

  // fallback: show store flow status (usually pending in demo)
  return <VerificationBadge status={storeProfile.status} level={storeProfile.level} size="sm" variant="compact" />;
}

