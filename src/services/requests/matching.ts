import type { BuyerRequest } from "@/entities/requests/model";
import type { SellerStorefront } from "@/entities/seller/model";
import { unifiedCatalogListings } from "@/lib/listings.data";

export type RequestMatchResult = {
  request: BuyerRequest;
  matchScore: number;
  fitLevel: "high" | "medium" | "partial";
  matchReasons: string[];
  relevantListingIds: string[];
};

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[\s,.;:!?()\-_/]+/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length >= 3);
}

function computeKeywordOverlap(request: BuyerRequest, seller: SellerStorefront) {
  const requestWords = new Set([
    ...tokenize(request.title),
    ...tokenize(request.description),
    ...request.tags.map((tag) => tag.toLowerCase()),
  ]);
  const sellerWords = new Set([
    ...tokenize(seller.storefrontName),
    ...tokenize(seller.shortDescription),
    ...seller.trustBadges.map((badge) => badge.label.toLowerCase()),
  ]);
  const overlap = [...requestWords].filter((word) => sellerWords.has(word));
  return overlap;
}

function getRelevantListingIds(request: BuyerRequest, seller: SellerStorefront) {
  const listingRefs = seller.listingRefs.filter((ref) => ref.status === "active").map((ref) => ref.listingId);
  const requestWords = tokenize(`${request.title} ${request.description} ${request.tags.join(" ")}`);
  return listingRefs.filter((id) => {
    const listing = unifiedCatalogListings.find((item) => item.id === id);
    if (!listing) {
      return false;
    }
    const text = `${listing.title} ${listing.description} ${listing.categoryId} ${listing.world}`.toLowerCase();
    return requestWords.some((word) => text.includes(word)) || listing.categoryId === request.categoryId;
  });
}

export function rankSellerForRequest(request: BuyerRequest, seller: SellerStorefront): RequestMatchResult {
  let score = 0;
  const reasons: string[] = [];

  const worldMatched =
    !request.worldId || request.worldId === "all" || seller.worldHint === "all" || seller.worldHint === request.worldId;
  if (worldMatched) {
    score += 24;
    reasons.push("совпадает мир интереса");
  }

  const locationMatched = request.location.toLowerCase() === seller.city.toLowerCase();
  if (locationMatched) {
    score += 20;
    reasons.push("ваш город совпадает с запросом");
  }

  const keywordOverlap = computeKeywordOverlap(request, seller);
  if (keywordOverlap.length > 0) {
    score += Math.min(18, keywordOverlap.length * 6);
    reasons.push(`есть совпадение по теме: ${keywordOverlap.slice(0, 2).join(", ")}`);
  }

  const budgetMax = request.budget.max ?? Number.MAX_SAFE_INTEGER;
  const budgetMin = request.budget.min ?? 0;
  const relevantListingIds = getRelevantListingIds(request, seller);
  const pricedListings = relevantListingIds
    .map((id) => unifiedCatalogListings.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const budgetCompatibleCount = pricedListings.filter(
    (listing) => listing.priceValue >= budgetMin && listing.priceValue <= budgetMax,
  ).length;
  if (budgetCompatibleCount > 0) {
    score += 12;
    reasons.push("есть объявления в бюджете покупателя");
  }

  if (relevantListingIds.length > 0) {
    score += Math.min(14, 4 + relevantListingIds.length * 2);
    reasons.push(`доступно релевантных объявлений: ${relevantListingIds.length}`);
  }

  const trustSignal = Math.round(seller.metrics.rating * 2);
  score += Math.min(12, trustSignal);
  if (seller.metrics.rating >= 4.7) {
    reasons.push("высокий рейтинг магазина");
  }

  const normalized = Math.max(0, Math.min(100, score));
  const fitLevel = normalized >= 70 ? "high" : normalized >= 45 ? "medium" : "partial";

  return {
    request,
    matchScore: normalized,
    fitLevel,
    matchReasons: reasons.slice(0, 3),
    relevantListingIds,
  };
}

