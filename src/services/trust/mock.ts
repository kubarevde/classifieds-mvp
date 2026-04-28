import type { Review } from "@/entities/trust/model";
import { trustReviewsMock } from "@/mocks/trust/reviews";
import { trustScoresMock } from "@/mocks/trust/trust-scores";

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
    return emit(withFilters(reviewsMemory.filter((review) => review.targetId === targetId), filters).map(cloneReview));
  },
  async getReviewStats(targetId) {
    return emit(toStats(reviewsMemory.filter((review) => review.targetId === targetId)));
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
    reviewsMemory = reviewsMemory.map((review) =>
      review.id === reviewId ? { ...review, helpful: review.helpful + 1 } : review,
    );
    return emit(undefined);
  },
};
