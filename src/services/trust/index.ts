import type { Review, TrustScore } from "@/entities/trust/model";

export interface ReviewFilters {
  rating?: 1 | 2 | 3 | 4 | 5;
  verifiedOnly?: boolean;
  sort?: "newest" | "helpful" | "critical";
}

export interface ReviewStats {
  overallRating: number;
  total: number;
  distribution: { rating: 1 | 2 | 3 | 4 | 5; count: number }[];
  verifiedCount: number;
}

export interface NewReviewInput {
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  targetId: string;
  listingId?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  pros?: string;
  cons?: string;
  photos?: string[];
  verified?: boolean;
}

export interface TrustService {
  getScore(targetId: string): Promise<TrustScore | null>;
  getReviews(targetId: string, filters?: ReviewFilters): Promise<Review[]>;
  getReviewStats(targetId: string): Promise<ReviewStats>;
  addReview(input: NewReviewInput): Promise<Review>;
  markHelpful(reviewId: string): Promise<void>;
}

export { mockTrustService } from "./mock";
