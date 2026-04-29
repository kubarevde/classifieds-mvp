import type { BuyerRequest, RequestResponse } from "@/entities/requests/model";

import type { CreateBuyerRequestInput, BuyerRequestFilters, RespondToBuyerRequestInput } from "@/services/requests/types";

/** См. `BuyerRequest` / `BuyerRequestsService`. */
export type BuyerRequestResource = BuyerRequest;
export type BuyerRequestResponseResource = RequestResponse;

export interface GetBuyerRequestsRequest extends BuyerRequestFilters {
  page?: number;
  perPage?: number;
}

export interface GetBuyerRequestsResponse {
  items: BuyerRequestResource[];
  page: number;
  perPage: number;
  total: number;
}

export interface GetBuyerRequestByIdRequest {
  id: string;
  /** Если false — не инкрементировать просмотры (как опции сервиса). */
  incrementView?: boolean;
}

export interface GetBuyerRequestByIdResponse {
  request: BuyerRequestResource | null;
}

export type CreateBuyerRequestBody = CreateBuyerRequestInput;

export interface CreateBuyerRequestResponse {
  request: BuyerRequestResource;
}

export interface UpdateBuyerRequestStatusRequest {
  id: string;
  status: BuyerRequestResource["status"];
}

export interface UpdateBuyerRequestStatusResponse {
  request: BuyerRequestResource | null;
}

export type RespondToBuyerRequestBody = RespondToBuyerRequestInput;

export interface RespondToBuyerRequestResponse {
  response: BuyerRequestResponseResource;
}

export interface GetMatchingRequestsForSellerRequest {
  sellerId: string;
  page?: number;
  perPage?: number;
}

export interface GetMatchingRequestsForSellerResponse {
  items: BuyerRequestResource[];
  page: number;
  perPage: number;
  total: number;
}

export interface GetResponsesForRequestRequest {
  requestId: string;
}

export interface GetResponsesForRequestResponse {
  items: BuyerRequestResponseResource[];
}
