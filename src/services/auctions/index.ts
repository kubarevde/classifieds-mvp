import type { AuctionBidderProfile, AuctionEvent, AuctionState, Bid } from "@/entities/auction/model";

export interface PlaceBidInput {
  auctionId: string;
  bidder: AuctionBidderProfile;
  amount: number;
  autoBidMax?: number;
}

export interface CreateAuctionInput {
  listingId: string;
  creator: {
    role: "guest" | "buyer" | "seller" | "all";
    subscription: {
      isPro: boolean;
      planName: "demo" | "pro" | "business";
      storePlan: "basic" | "pro" | "business";
    };
  };
  startPrice: number;
  reservePrice?: number;
  startAt: Date;
  endAt: Date;
  antiSnipingExtension: number;
  minBidIncrement?: number;
}

export interface AuctionService {
  getByListing(listingId: string): Promise<AuctionState | null>;
  getById(auctionId: string): Promise<AuctionState | null>;
  getAll(): Promise<AuctionState[]>;
  getActive(): Promise<AuctionState[]>;
  getByStatus(status: AuctionState["status"]): Promise<AuctionState[]>;
  getBidHistory(auctionId: string): Promise<Bid[]>;
  placeBid(input: PlaceBidInput): Promise<{ auction: AuctionState; events: AuctionEvent[] }>;
  createAuction(input: CreateAuctionInput): Promise<AuctionState>;
}

export { mockAuctionService } from "./mock";
export { getBidIncrement, getMinimumNextBid, isValidBidAmount, resolveProxyBids } from "./rules";
