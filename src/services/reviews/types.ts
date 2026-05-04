export type ReviewTargetType = "seller" | "buyer" | "store";
export type ReviewStatus = "published" | "flagged" | "removed";

export interface ReviewReply {
  authorId: string;
  text: string;
  createdAt: string;
}

export interface Review {
  id: string;
  dealId: string;
  authorId: string;
  /** Имя для UI (мок); в проде — из профиля. */
  authorDisplayName?: string;
  targetId: string;
  targetType: ReviewTargetType;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  createdAt: string;
  editedAt?: string;
  reply?: ReviewReply;
  status: ReviewStatus;
  flagReason?: string;
}

export interface ReviewSummary {
  targetId: string;
  targetType: ReviewTargetType;
  avgRating: number;
  totalCount: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  highlights: string[];
}

export interface ReviewEligibility {
  dealId: string;
  actorId: string;
  canReview: boolean;
  reason?:
    | "deal_not_found"
    | "not_participant"
    | "deal_not_completed"
    | "already_reviewed"
    | "target_not_resolved";
  targetId?: string;
  targetType?: ReviewTargetType;
}
