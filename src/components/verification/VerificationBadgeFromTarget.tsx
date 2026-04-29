"use client";

import type { VerificationSubjectType } from "@/services/verification/types";
import { getVerificationDerivedTrustedPlus, getVerificationProfile } from "@/services/verification";

import { VerificationBadge } from "./VerificationBadge";

export function VerificationBadgeFromTarget({
  targetId,
  subjectType,
  size = "sm",
  variant,
}: {
  targetId: string;
  subjectType: VerificationSubjectType;
  size?: "sm" | "md" | "lg";
  variant: "compact" | "full";
}) {
  const profile = getVerificationProfile(targetId, subjectType);
  if (!profile) {
    return <VerificationBadge status="not_started" level="basic" size={size} variant={variant} />;
  }
  const derived = getVerificationDerivedTrustedPlus(profile);

  return <VerificationBadge status={derived.status} level={derived.level} size={size} variant={variant} />;
}

