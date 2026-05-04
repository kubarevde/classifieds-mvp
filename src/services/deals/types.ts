export type OfferStatus = "pending" | "countered" | "accepted" | "declined" | "expired";

export type DealStatus = "active" | "completed" | "cancelled" | "disputed";

export type DealEventType =
  | "offer_created"
  | "offer_countered"
  | "offer_accepted"
  | "offer_declined"
  | "deal_created"
  | "deal_completed"
  | "deal_cancelled"
  | "deal_disputed"
  | "buyer_marked_complete"
  | "seller_marked_complete"
  | "system_expired";

export interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: OfferStatus;
  message?: string;
  counterAmount?: number;
  expiresAt?: string;
  createdAt: string;
}

export interface DealEvent {
  id: string;
  type: DealEventType;
  actorId: string;
  timestamp: string;
  note?: string;
}

export interface Deal {
  id: string;
  offerId: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: DealStatus;
  completedAt?: string;
  cancelReason?: string;
  reviewEligible: boolean;
  buyerCompleted: boolean;
  sellerCompleted: boolean;
  timeline: DealEvent[];
}
