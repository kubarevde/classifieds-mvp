import { mockBuyerRequestsService } from "./mock";

export type {
  BuyerRequestFilters,
  BuyerRequestsService,
  CreateBuyerRequestInput,
  RespondToBuyerRequestInput,
} from "./types";

export const getBuyerRequests = mockBuyerRequestsService.getBuyerRequests.bind(mockBuyerRequestsService);
export const getBuyerRequestById = mockBuyerRequestsService.getBuyerRequestById.bind(mockBuyerRequestsService);
export const createBuyerRequest = mockBuyerRequestsService.createBuyerRequest.bind(mockBuyerRequestsService);
export const updateBuyerRequestStatus = mockBuyerRequestsService.updateBuyerRequestStatus.bind(mockBuyerRequestsService);
export const respondToBuyerRequest = mockBuyerRequestsService.respondToBuyerRequest.bind(mockBuyerRequestsService);
export const getMatchingRequestsForSeller = mockBuyerRequestsService.getMatchingRequestsForSeller.bind(mockBuyerRequestsService);
export const getMatchingRequestsForSellerDetailed =
  mockBuyerRequestsService.getMatchingRequestsForSellerDetailed.bind(mockBuyerRequestsService);
export const getResponsesForRequest = mockBuyerRequestsService.getResponsesForRequest.bind(mockBuyerRequestsService);

export { mockBuyerRequestsService };

