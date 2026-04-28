import type { BuyerRequest, RequestResponse } from "@/entities/requests/model";
import type { RequestMatchResult } from "@/services/requests/matching";

export type BuyerRequestFilters = {
  worldId?: string;
  categoryId?: string;
  location?: string;
  urgency?: BuyerRequest["urgency"];
  minBudget?: number;
  maxBudget?: number;
  authorId?: string;
  sellerId?: string;
  status?: BuyerRequest["status"];
};

export type CreateBuyerRequestInput = Omit<
  BuyerRequest,
  "id" | "createdAt" | "expiresAt" | "responseCount" | "viewCount" | "status"
> & {
  expiresInDays?: number;
};

export type RespondToBuyerRequestInput = Omit<RequestResponse, "id" | "createdAt" | "status">;

export interface BuyerRequestsService {
  getBuyerRequests(filters?: BuyerRequestFilters): Promise<BuyerRequest[]>;
  getBuyerRequestById(id: string, options?: { incrementView?: boolean }): Promise<BuyerRequest | null>;
  createBuyerRequest(input: CreateBuyerRequestInput): Promise<BuyerRequest>;
  updateBuyerRequestStatus(id: string, status: BuyerRequest["status"]): Promise<BuyerRequest | null>;
  respondToBuyerRequest(input: RespondToBuyerRequestInput): Promise<RequestResponse>;
  getMatchingRequestsForSeller(sellerId: string): Promise<BuyerRequest[]>;
  getMatchingRequestsForSellerDetailed(sellerId: string): Promise<RequestMatchResult[]>;
  getResponsesForRequest(requestId: string): Promise<RequestResponse[]>;
}

export { mockBuyerRequestsService } from "./mock";

