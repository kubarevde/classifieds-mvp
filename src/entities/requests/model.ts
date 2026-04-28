import type { SearchIntent } from "@/entities/search/model";

export type BuyerRequestCondition = "any" | "new" | "excellent" | "good";
export type BuyerRequestUrgency = "flexible" | "this_week" | "today";
export type BuyerRequestStatus = "active" | "fulfilled" | "expired" | "cancelled";

export interface BuyerRequest {
  id: string;
  authorId: string;
  authorName: string;
  worldId?: string;
  categoryId: string;
  title: string;
  description: string;
  budget: {
    min?: number;
    max?: number;
    currency: "RUB";
  };
  location: string;
  condition: BuyerRequestCondition;
  urgency: BuyerRequestUrgency;
  status: BuyerRequestStatus;
  responseCount: number;
  viewCount: number;
  createdAt: string;
  expiresAt: string;
  tags: string[];
  searchIntent?: SearchIntent;
}

export type RequestResponseStatus = "pending" | "viewed" | "accepted" | "declined";

export interface RequestResponse {
  id: string;
  requestId: string;
  sellerId: string;
  sellerName: string;
  storeId?: string;
  storeName?: string;
  trustScore?: number;
  listingId?: string;
  message: string;
  price?: number;
  canMeetBudget: boolean;
  createdAt: string;
  status: RequestResponseStatus;
}

