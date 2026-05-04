import type { Review } from "@/entities/trust/model";
import { trustReviewsMock } from "@/mocks/trust/reviews";
import { trustScoresMock } from "@/mocks/trust/trust-scores";
import { reviewsService } from "@/services/reviews";
import { inferReviewTargetType, mergeServiceReviewsForTrust, serviceSummaryToStatsPartial } from "@/services/reviews/trust-adapter";

import type { NewReviewInput, ReviewFilters, ReviewStats, TrustService } from "./index";

const scoreMemory = trustScoresMock.map((score) => ({
  ...score,
  badges: score.badges.map((badge) => ({ ...badge, since: badge.since ? new Date(badge.since) : undefined })),
}));
let reviewsMemory = trustReviewsMock.map(cloneReview);

function cloneReview(review: Review): Review {
  return {
    ...review,
    createdAt: new Date(review.createdAt),
    photos: review.photos ? [...review.photos] : undefined,
  };
}

function withFilters(reviews: Review[], filters?: ReviewFilters): Review[] {
  let output = [...reviews];
  if (filters?.rating) {
    output = output.filter((review) => review.rating === filters.rating);
  }
  if (filters?.verifiedOnly) {
    output = output.filter((review) => review.verified);
  }
  if (filters?.sort === "helpful") {
    output.sort((a, b) => b.helpful - a.helpful || b.createdAt.getTime() - a.createdAt.getTime());
  } else if (filters?.sort === "critical") {
    output.sort((a, b) => a.rating - b.rating || b.createdAt.getTime() - a.createdAt.getTime());
  } else {
    output.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  return output;
}

function toStats(reviews: Review[]): ReviewStats {
  const total = reviews.length;
  const distribution = ([5, 4, 3, 2, 1] as const).map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
  }));
  const verifiedCount = reviews.filter((review) => review.verified).length;
  const overallRating = total ? Number((reviews.reduce((sum, item) => sum + item.rating, 0) / total).toFixed(1)) : 0;
  return { overallRating, total, distribution, verifiedCount };
}

function emit<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function mergeReviewStats(
  dealBacked: Pick<ReviewStats, "overallRating" | "total" | "distribution">,
  legacy: ReviewStats,
): ReviewStats {
  const total = dealBacked.total + legacy.total;
  if (total === 0) {
    return {
      overallRating: 0,
      total: 0,
      distribution: ([5, 4, 3, 2, 1] as const).map((rating) => ({ rating, count: 0 })),
      verifiedCount: 0,
    };
  }
  const dist = ([5, 4, 3, 2, 1] as const).map((rating) => ({
    rating,
    count:
      (dealBacked.distribution.find((d) => d.rating === rating)?.count ?? 0) +
      (legacy.distribution.find((d) => d.rating === rating)?.count ?? 0),
  }));
  const weighted =
    (dealBacked.overallRating * dealBacked.total + legacy.overallRating * legacy.total) / total;
  return {
    overallRating: Number(weighted.toFixed(1)),
    total,
    distribution: dist,
    verifiedCount: legacy.verifiedCount + dealBacked.total,
  };
}

export const mockTrustService: TrustService = {
  async getScore(targetId) {
    const score = scoreMemory.find((item) => item.userId === targetId) ?? null;
    return emit(
      score
        ? {
            ...score,
            badges: score.badges.map((badge) => ({
              ...badge,
              since: badge.since ? new Date(badge.since) : undefined,
            })),
          }
        : null,
    );
  },
  async getReviews(targetId, filters) {
    const t = inferReviewTargetType(targetId);
    const fromDeal = mergeServiceReviewsForTrust(targetId, reviewsService.getReviewsForTarget(targetId, t), filters);
    const legacy = withFilters(reviewsMemory.filter((review) => review.targetId === targetId), filters).map(cloneReview);
    const merged = [...fromDeal, ...legacy];
    merged.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return emit(merged.map(cloneReview));
  },
  async getReviewStats(targetId) {
    const t = inferReviewTargetType(targetId);
    const sum = reviewsService.getReviewSummary(targetId, t);
    const dealBacked = serviceSummaryToStatsPartial(sum.avgRating, sum.totalCount, sum.distribution);
    const legacy = toStats(reviewsMemory.filter((review) => review.targetId === targetId));
    return emit(mergeReviewStats(dealBacked, legacy));
  },
  async addReview(input: NewReviewInput) {
    const review: Review = {
      id: `review-local-${Date.now()}`,
      authorId: input.authorId,
      authorName: input.authorName,
      authorAvatar: input.authorAvatar,
      targetId: input.targetId,
      listingId: input.listingId,
      rating: input.rating,
      text: input.text,
      pros: input.pros,
      cons: input.cons,
      photos: input.photos,
      sellerReply: undefined,
      createdAt: new Date(),
      verified: Boolean(input.verified),
      helpful: 0,
    };
    reviewsMemory = [review, ...reviewsMemory];
    return emit(cloneReview(review));
  },
  async markHelpful(reviewId) {
    if (reviewId.startsWith("rv-")) {
      return emit(undefined);
    }
    reviewsMemory = reviewsMemory.map((review) =>
      review.id === reviewId ? { ...review, helpful: review.helpful + 1 } : review,
    );
    return emit(undefined);
  },
};
