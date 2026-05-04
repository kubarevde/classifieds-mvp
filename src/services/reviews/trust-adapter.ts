import type { Review as TrustReview } from "@/entities/trust/model";
import type { ReviewFilters, ReviewStats } from "@/services/trust";

import type { Review as ServiceReview, ReviewTargetType } from "./types";

/** Витрина и trust-виджеты: store slug или id покупателя. */
export function inferReviewTargetType(targetId: string): ReviewTargetType {
  if (targetId.startsWith("buyer-") || targetId.startsWith("buyer-account:")) {
    return "buyer";
  }
  return "store";
}

export function serviceReviewToTrustReview(r: ServiceReview): TrustReview | null {
  if (r.status === "removed") return null;
  const authorName = r.authorDisplayName ?? r.authorId;
  const targetKey = r.targetType === "store" ? r.targetId : normalizeBuyerPublicId(r.targetId);
  return {
    id: r.id,
    authorId: r.authorId,
    authorName,
    authorAvatar: undefined,
    targetId: targetKey,
    listingId: undefined,
    rating: r.rating,
    text: r.text,
    pros: undefined,
    cons: undefined,
    photos: undefined,
    sellerReply: r.reply?.text,
    createdAt: new Date(r.createdAt),
    verified: r.status === "published",
    helpful: 0,
  };
}

function normalizeBuyerPublicId(id: string): string {
  return id.startsWith("buyer-account:") ? id.slice("buyer-account:".length) : id;
}

export function mergeServiceReviewsForTrust(
  targetId: string,
  serviceRows: ServiceReview[],
  filters?: ReviewFilters,
): TrustReview[] {
  const normalizedTarget = inferReviewTargetType(targetId) === "buyer" ? normalizeBuyerPublicId(targetId) : targetId;
  let mapped = serviceRows
    .filter((r) => {
      if (r.status !== "published") return false;
      if (r.targetType === "store") return r.targetId === normalizedTarget;
      return normalizeBuyerPublicId(r.targetId) === normalizeBuyerPublicId(normalizedTarget);
    })
    .map(serviceReviewToTrustReview)
    .filter((x): x is TrustReview => x != null);

  if (filters?.rating) {
    mapped = mapped.filter((rev) => rev.rating === filters.rating);
  }
  if (filters?.verifiedOnly) {
    mapped = mapped.filter((rev) => rev.verified);
  }
  if (filters?.sort === "helpful") {
    mapped.sort((a, b) => b.helpful - a.helpful || b.createdAt.getTime() - a.createdAt.getTime());
  } else if (filters?.sort === "critical") {
    mapped.sort((a, b) => a.rating - b.rating || b.createdAt.getTime() - a.createdAt.getTime());
  } else {
    mapped.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  return mapped;
}

export function serviceSummaryToStatsPartial(
  avg: number,
  total: number,
  distribution: Record<1 | 2 | 3 | 4 | 5, number>,
): Pick<ReviewStats, "overallRating" | "total" | "distribution"> {
  return {
    overallRating: total ? Number(avg.toFixed(1)) : 0,
    total,
    distribution: ([5, 4, 3, 2, 1] as const).map((rating) => ({
      rating,
      count: distribution[rating],
    })),
  };
}
