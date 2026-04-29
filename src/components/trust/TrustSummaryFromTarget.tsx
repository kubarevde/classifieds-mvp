"use client";

import { useEffect, useState } from "react";

import type { TrustScore } from "@/entities/trust/model";
import { mockTrustService, type ReviewStats } from "@/services/trust";

import { TrustSummary } from "./TrustSummary";

type TrustSummaryFromTargetProps = {
  targetId: string;
  variant?: "compact" | "full";
  memberSinceLabel?: string;
  className?: string;
};

export function TrustSummaryFromTarget({
  targetId,
  variant = "compact",
  memberSinceLabel,
  className = "",
}: TrustSummaryFromTargetProps) {
  const [score, setScore] = useState<TrustScore | null | undefined>(undefined);
  const [stats, setStats] = useState<ReviewStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([mockTrustService.getScore(targetId), mockTrustService.getReviewStats(targetId)]).then(
      ([nextScore, nextStats]) => {
        if (cancelled) {
          return;
        }
        setScore(nextScore);
        setStats(nextStats);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [targetId]);

  if (score === undefined) {
    return (
      <div
        className={variant === "compact" ? "h-6 w-40 animate-pulse rounded-full bg-slate-100" : "h-20 animate-pulse rounded-xl bg-slate-100"}
      />
    );
  }

  return (
    <TrustSummary
      variant={variant}
      verified={Boolean(score?.components.verified_identity || score?.components.verified_business)}
      trustScore={score?.overall ?? null}
      rating={stats?.overallRating ?? null}
      reviewsCount={stats?.total ?? null}
      responseRate={score?.components.response_rate ?? null}
      memberSinceLabel={memberSinceLabel}
      className={className}
    />
  );
}
