import type { SearchIntent } from "@/entities/search/model";
import type { BuyerRequest, BuyerRequestCondition, BuyerRequestUrgency } from "@/entities/requests/model";
import {
  serializeFiltersToSearchParams,
  createSearchIntentFromFilters,
  defaultSavedSearchFilters,
  intentToSavedSearchFilters,
  type SavedSearchFilters,
} from "@/lib/saved-searches";

export type BuyerRequestDraft = {
  worldId?: string;
  categoryId: string;
  title: string;
  description: string;
  budgetMin?: number;
  budgetMax?: number;
  location: string;
  urgency: BuyerRequestUrgency;
  condition: BuyerRequestCondition;
  tags: string[];
};

function toTitle(query: string, categoryId: string) {
  const trimmed = query.trim();
  if (trimmed) {
    return `Ищу: ${trimmed}`;
  }
  return `Ищу товар в категории ${categoryId}`;
}

export function buyerRequestToSearchIntent(request: BuyerRequest): SearchIntent {
  if (request.searchIntent) {
    return request.searchIntent;
  }
  const filters: SavedSearchFilters = {
    ...defaultSavedSearchFilters,
    world: request.worldId === "base" ? "all" : (request.worldId as SavedSearchFilters["world"]) ?? "all",
    query: request.title,
    category: request.categoryId,
    location: request.location || "all",
    priceMin: request.budget.min ?? null,
    priceMax: request.budget.max ?? null,
  };
  return createSearchIntentFromFilters(filters, "keyword");
}

export function searchIntentToBuyerRequestDraft(intent: SearchIntent): BuyerRequestDraft {
  const filters = intentToSavedSearchFilters(intent);
  const budgetMin = filters.priceMin ?? undefined;
  const budgetMax = filters.priceMax ?? undefined;
  return {
    worldId: filters.world === "all" ? undefined : filters.world,
    categoryId: filters.category === "all" ? "services" : filters.category,
    title: toTitle(filters.query, filters.category),
    description: filters.query.trim()
      ? `Ищу предложение по запросу «${filters.query.trim()}». Готов рассмотреть похожие варианты.`
      : "Нужен релевантный вариант по указанным фильтрам и локации.",
    budgetMin,
    budgetMax,
    location: filters.location === "all" ? "Москва" : filters.location,
    urgency: "flexible",
    condition: "any",
    tags: filters.query
      .split(/\s+/)
      .map((chunk) => chunk.trim().toLowerCase())
      .filter((chunk) => chunk.length >= 3)
      .slice(0, 4),
  };
}

export function buildCreateRequestHrefFromIntent(intent: SearchIntent) {
  const filters = intentToSavedSearchFilters(intent);
  const params = serializeFiltersToSearchParams(filters);
  params.set("target", "listing");
  params.set("mode", intent.mode);
  return `/requests/new?${params.toString()}`;
}

