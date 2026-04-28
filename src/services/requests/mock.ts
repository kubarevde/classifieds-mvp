import type { BuyerRequest, RequestResponse } from "@/entities/requests/model";
import { buyerRequestsMock, requestResponsesMock } from "@/mocks/requests";
import { getStorefrontSellerById } from "@/lib/sellers";
import { createSearchIntentFromFilters, defaultSavedSearchFilters } from "@/lib/saved-searches";
import { rankSellerForRequest } from "@/services/requests/matching";

import type {
  BuyerRequestFilters,
  BuyerRequestsService,
} from "./index";

let requestsStore: BuyerRequest[] = buyerRequestsMock.map((row) => ({ ...row }));
let responsesStore: RequestResponse[] = requestResponsesMock.map((row) => ({ ...row }));

function uid(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function toRequestWithIntent(request: BuyerRequest): BuyerRequest {
  if (request.searchIntent) {
    return request;
  }
  return {
    ...request,
    searchIntent: createSearchIntentFromFilters({
      ...defaultSavedSearchFilters,
      world: (request.worldId as (typeof defaultSavedSearchFilters)["world"]) ?? "all",
      query: request.title,
      category: request.categoryId,
      location: request.location || "all",
      priceMin: request.budget.min ?? null,
      priceMax: request.budget.max ?? null,
    }),
  };
}

function applyFilters(rows: BuyerRequest[], filters?: BuyerRequestFilters): BuyerRequest[] {
  if (!filters) {
    return rows;
  }
  return rows.filter((row) => {
    if (filters.status && row.status !== filters.status) return false;
    if (filters.worldId && row.worldId !== filters.worldId) return false;
    if (filters.categoryId && row.categoryId !== filters.categoryId) return false;
    if (filters.urgency && row.urgency !== filters.urgency) return false;
    if (filters.authorId && row.authorId !== filters.authorId) return false;
    if (filters.location && row.location.toLowerCase() !== filters.location.toLowerCase()) return false;
    const maxBudget = row.budget.max ?? Number.MAX_SAFE_INTEGER;
    const minBudget = row.budget.min ?? 0;
    if (typeof filters.minBudget === "number" && maxBudget < filters.minBudget) return false;
    if (typeof filters.maxBudget === "number" && minBudget > filters.maxBudget) return false;
    return true;
  });
}

function matchesSeller(row: BuyerRequest, sellerId: string) {
  const seller = getStorefrontSellerById(sellerId);
  if (!seller) return false;
  const rank = rankSellerForRequest(row, seller);
  return rank.matchScore >= 35;
}

export const mockBuyerRequestsService: BuyerRequestsService = {
  async getBuyerRequests(filters) {
    const filtered = applyFilters(requestsStore, filters)
      .filter((item) => (filters?.status ? item.status === filters.status : true))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((item) => toRequestWithIntent(item));
    return Promise.resolve(filtered);
  },

  async getBuyerRequestById(id, options) {
    const found = requestsStore.find((item) => item.id === id);
    if (!found) {
      return Promise.resolve(null);
    }
    if (options?.incrementView !== false) {
      found.viewCount += 1;
    }
    return Promise.resolve(toRequestWithIntent({ ...found }));
  },

  async createBuyerRequest(input) {
    const now = Date.now();
    const request: BuyerRequest = toRequestWithIntent({
      ...input,
      id: uid("req"),
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + (input.expiresInDays ?? 10) * 24 * 60 * 60 * 1000).toISOString(),
      responseCount: 0,
      viewCount: 0,
      status: "active",
    });
    requestsStore = [request, ...requestsStore];
    return Promise.resolve(request);
  },

  async updateBuyerRequestStatus(id, status) {
    const index = requestsStore.findIndex((item) => item.id === id);
    if (index === -1) {
      return Promise.resolve(null);
    }
    const updated = { ...requestsStore[index], status };
    requestsStore[index] = updated;
    return Promise.resolve(toRequestWithIntent(updated));
  },

  async respondToBuyerRequest(input) {
    const response: RequestResponse = {
      ...input,
      id: uid("resp"),
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    responsesStore = [response, ...responsesStore];
    requestsStore = requestsStore.map((request) =>
      request.id === input.requestId ? { ...request, responseCount: request.responseCount + 1 } : request,
    );
    return Promise.resolve(response);
  },

  async getMatchingRequestsForSeller(sellerId) {
    const rows = requestsStore
      .filter((row) => row.status === "active")
      .filter((row) => matchesSeller(row, sellerId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((row) => toRequestWithIntent(row));
    return Promise.resolve(rows);
  },

  async getMatchingRequestsForSellerDetailed(sellerId) {
    const seller = getStorefrontSellerById(sellerId);
    if (!seller) {
      return Promise.resolve([]);
    }
    const rows = requestsStore
      .filter((row) => row.status === "active")
      .map((row) => rankSellerForRequest(toRequestWithIntent(row), seller))
      .filter((row) => row.matchScore >= 35)
      .sort((a, b) => b.matchScore - a.matchScore || new Date(b.request.createdAt).getTime() - new Date(a.request.createdAt).getTime());
    return Promise.resolve(rows);
  },

  async getResponsesForRequest(requestId) {
    const rows = responsesStore
      .filter((row) => row.requestId === requestId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return Promise.resolve(rows);
  },
};

