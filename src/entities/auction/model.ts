export type AuctionStatus =
  | "draft"
  | "scheduled"
  | "live"
  | "ending_soon"
  | "ended"
  | "cancelled";

export type BidStatus = "active" | "outbid" | "winning" | "won";

export type AuctionEventType =
  | "bid_placed"
  | "outbid"
  | "ending_soon"
  | "extended"
  | "won"
  | "reserve_not_met";

export type AuctionSaleMode = "all" | "fixed" | "auction" | "free";

export type AuctionPaymentReadiness = "unconfirmed" | "confirmed" | "deposit_required";

export type AuctionBidderEligibility =
  | "guest"
  | "unverified"
  | "verified"
  | "funding_required"
  | "eligible_premium";

export interface AuctionBidderProfile {
  bidderId: string;
  bidderName: string;
  bidderEligibility: AuctionBidderEligibility;
  paymentReadiness: AuctionPaymentReadiness;
  depositRequired: boolean;
  requiresFundingApproval: boolean;
  auctionTermsAccepted: boolean;
  autoBidAllowed: boolean;
}

export interface AuctionState {
  id: string;
  listingId: string;
  status: AuctionStatus;
  startPrice: number;
  reservePrice?: number;
  currentBid: number;
  bidCount: number;
  startAt: Date;
  endAt: Date;
  bids: Bid[];
  winnerId?: string;
  antiSnipingExtension: number;
  minBidIncrement?: number;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  isAutoBid: boolean;
  maxAutoBid?: number;
  placedAt: Date;
  status: BidStatus;
}

export interface AuctionEvent {
  type: AuctionEventType;
  auctionId: string;
  payload: unknown;
  timestamp: Date;
}
