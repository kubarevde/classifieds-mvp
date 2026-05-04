/**
 * Отзывы по завершённым сделкам (P33). Реализация по умолчанию — `mock.ts`;
 * для продакшена замените wiring на HTTP-клиент (`http.ts`) с тем же контрактом.
 */
import { createMockReviewsService } from "./mock";

import type { Review, ReviewEligibility, ReviewSummary, ReviewTargetType } from "./types";

export type { Review, ReviewEligibility, ReviewReply, ReviewStatus, ReviewSummary, ReviewTargetType } from "./types";

export interface ReviewsService {
  getReviewById(id: string): Review | undefined;
  getReviewsForTarget(targetId: string, targetType: ReviewTargetType): Review[];
  getReviewsAuthoredByUser(userId: string): Review[];
  /** Отзывы, привязанные к сделкам по объявлению (для админки). */
  getReviewsForListing(listingId: string): Review[];
  getReviewSummary(targetId: string, targetType: ReviewTargetType): ReviewSummary;
  getFlaggedReviews(): Review[];
  getPendingReplyReviewsForSeller(sellerId: string): Review[];
  getReviewEligibility(dealId: string, actorId: string): ReviewEligibility;

  createReview(params: { dealId: string; authorId: string; rating: 1 | 2 | 3 | 4 | 5; text: string }): Promise<Review>;
  replyToReview(reviewId: string, authorId: string, text: string): Promise<Review>;
  flagReview(reviewId: string, actorId: string, reason: string): Promise<Review>;
  approveReview(reviewId: string, actorId: string): Promise<Review>;
  removeReview(reviewId: string, actorId: string, reason?: string): Promise<Review>;
}

export const reviewsService: ReviewsService = createMockReviewsService();

export { createMockReviewsService } from "./mock";
