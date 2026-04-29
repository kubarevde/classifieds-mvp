"use client";

import { ShieldCheck, Star } from "lucide-react";

import { cn } from "@/components/ui/cn";

type TrustSummaryVariant = "compact" | "full";

type TrustSummaryProps = {
  variant?: TrustSummaryVariant;
  verified?: boolean;
  trustScore?: number | null;
  rating?: number | null;
  reviewsCount?: number | null;
  responseRate?: number | null;
  memberSinceLabel?: string;
  className?: string;
};

function formatRating(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function TrustSummary({
  variant = "compact",
  verified = false,
  trustScore = null,
  rating = null,
  reviewsCount = null,
  responseRate = null,
  memberSinceLabel,
  className = "",
}: TrustSummaryProps) {
  const hasRating = typeof rating === "number" && Number.isFinite(rating);
  const hasReviews = typeof reviewsCount === "number" && reviewsCount >= 0;
  const hasTrustScore = typeof trustScore === "number" && Number.isFinite(trustScore);
  const hasResponseRate = typeof responseRate === "number" && Number.isFinite(responseRate);

  if (variant === "compact") {
    return (
      <div className={cn("flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-slate-600", className)}>
        {verified ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.6} />
            Verified
          </span>
        ) : null}
        {hasRating ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={1.5} />
            {formatRating(rating)}
            {hasReviews ? <span className="text-slate-500">({reviewsCount})</span> : null}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-slate-200 bg-slate-50/70 p-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {verified ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.6} />
            Verified
          </span>
        ) : null}
        {hasTrustScore ? (
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
            Trust score: <span className="font-semibold text-slate-900">{Math.round(trustScore)}</span>/100
          </span>
        ) : null}
        {hasRating ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={1.5} />
            {formatRating(rating)}
            {hasReviews ? ` (${reviewsCount} отзывов)` : ""}
          </span>
        ) : null}
        {hasResponseRate ? (
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
            Response rate: {formatPercent(responseRate)}
          </span>
        ) : null}
        {memberSinceLabel ? (
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
            {memberSinceLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
