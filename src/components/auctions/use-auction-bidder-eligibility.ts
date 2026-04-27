"use client";

import { useMemo, useState } from "react";

import { useDemoRole } from "@/components/demo-role/demo-role";
import { useFeatureGate } from "@/hooks/useFeatureGate";

import type { AuctionBidderEligibility, AuctionBidderProfile, AuctionPaymentReadiness } from "@/entities/auction/model";

function deriveEligibility(role: ReturnType<typeof useDemoRole>["role"]): AuctionBidderEligibility {
  if (role === "guest") {
    return "guest";
  }
  if (role === "buyer") {
    return "unverified";
  }
  if (role === "seller") {
    return "funding_required";
  }
  return "eligible_premium";
}

function derivePaymentReadiness(eligibility: AuctionBidderEligibility): AuctionPaymentReadiness {
  if (eligibility === "funding_required") {
    return "deposit_required";
  }
  if (eligibility === "verified" || eligibility === "eligible_premium") {
    return "confirmed";
  }
  return "unconfirmed";
}

export function useAuctionBidderEligibility() {
  const { role } = useDemoRole();
  const autoBidGate = useFeatureGate("auction_auto_bid");
  const [auctionTermsAccepted, setAuctionTermsAccepted] = useState(role !== "guest");
  const [manuallyVerified, setManuallyVerified] = useState(role === "all");
  const [fundingApproved, setFundingApproved] = useState(role === "all");

  const bidder = useMemo<AuctionBidderProfile>(() => {
    const base = deriveEligibility(role);
    const eligibility: AuctionBidderEligibility =
      base === "unverified" && manuallyVerified ? "verified" : base === "funding_required" && fundingApproved ? "verified" : base;

    const paymentReadiness = derivePaymentReadiness(eligibility);
    return {
      bidderId: "viewer-001",
      bidderName: "Вы",
      bidderEligibility: autoBidGate.allowed && eligibility === "verified" ? "eligible_premium" : eligibility,
      paymentReadiness,
      depositRequired: eligibility === "funding_required",
      requiresFundingApproval: eligibility === "funding_required",
      auctionTermsAccepted,
      autoBidAllowed: autoBidGate.allowed,
    };
  }, [role, autoBidGate.allowed, manuallyVerified, fundingApproved, auctionTermsAccepted]);

  return {
    bidder,
    controls: {
      auctionTermsAccepted,
      setAuctionTermsAccepted,
      manuallyVerified,
      setManuallyVerified,
      fundingApproved,
      setFundingApproved,
    },
  };
}
