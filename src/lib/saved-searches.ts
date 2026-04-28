import type { SearchFilters, SearchIntent, SearchInputMode, SearchTarget } from "@/entities/search/model";
import { categoryLabels, getWorldLabel, type CatalogWorld, type ListingsView, type SortOption } from "@/lib/listings";
import type { ListingCategory } from "@/lib/types";
import type { AuctionSaleMode } from "@/entities/auction/model";

export type SavedSearchFilters = {
  world: CatalogWorld;
  query: string;
  category: "all" | string;
  location: "all" | string;
  saleMode: AuctionSaleMode;
  sortBy: SortOption;
  view: ListingsView;
  priceMin?: number | null;
  priceMax?: number | null;
};

export type StoreSearchFilters = {
  query: string;
  location: "all" | string;
  specialization: "all" | string;
  verifiedOnly: boolean;
  storeType: "all" | string;
  sortBy: "rating_desc" | "listings_desc" | "newest_desc";
};

export type SavedSearch = {
  id: string;
  name: string;
  createdAtIso: string;
  alertsEnabled: boolean;
  filters: SavedSearchFilters;
};

export const SAVED_SEARCHES_STORAGE_KEY = "classifieds-mvp:saved-searches";
export const SAVED_SEARCHES_CHANGE_EVENT = "classifieds-saved-searches-change";

const SORT_OPTIONS: SortOption[] = ["newest", "price_asc", "price_desc"];
const VIEWS: ListingsView[] = ["grid", "list"];

export const defaultSavedSearchFilters: SavedSearchFilters = {
  world: "all",
  query: "",
  category: "all",
  location: "all",
  saleMode: "all",
  sortBy: "newest",
  view: "grid",
  priceMin: null,
  priceMax: null,
};

function isCatalogWorld(value: string): value is CatalogWorld {
  return (
    value === "all" ||
    value === "electronics" ||
    value === "autos" ||
    value === "agriculture" ||
    value === "real_estate" ||
    value === "jobs" ||
    value === "services"
  );
}

function isSortOption(value: string): value is SortOption {
  return SORT_OPTIONS.includes(value as SortOption);
}

function isListingsView(value: string): value is ListingsView {
  return VIEWS.includes(value as ListingsView);
}

const URL_KEYS = ["target", "world", "q", "category", "location", "saleMode", "sort", "view", "mode", "specialization", "verifiedOnly", "storeType"] as const;

function isSaleMode(value: string): value is AuctionSaleMode {
  return value === "all" || value === "fixed" || value === "auction" || value === "free";
}

export function hasSavedSearchUrlParams(searchParams: URLSearchParams) {
  return URL_KEYS.some((key) => searchParams.has(key));
}

export function parseFiltersFromSearchParams(searchParams: URLSearchParams): SavedSearchFilters | null {
  if (!hasSavedSearchUrlParams(searchParams)) {
    return null;
  }

  const query = searchParams.get("q") ?? "";
  const worldRaw = searchParams.get("world");
  const world = worldRaw && isCatalogWorld(worldRaw) ? worldRaw : defaultSavedSearchFilters.world;

  const categoryRaw = searchParams.get("category");
  const category = categoryRaw && categoryRaw !== "all" ? categoryRaw : "all";

  const locationRaw = searchParams.get("location");
  const location =
    locationRaw && locationRaw !== "all"
      ? (() => {
          try {
            return decodeURIComponent(locationRaw);
          } catch {
            return locationRaw;
          }
        })()
      : "all";

  const sortRaw = searchParams.get("sort");
  const sortBy = sortRaw && isSortOption(sortRaw) ? sortRaw : defaultSavedSearchFilters.sortBy;
  const saleModeRaw = searchParams.get("saleMode");
  const saleMode = saleModeRaw && isSaleMode(saleModeRaw) ? saleModeRaw : defaultSavedSearchFilters.saleMode;

  const viewRaw = searchParams.get("view");
  const view = viewRaw && isListingsView(viewRaw) ? viewRaw : defaultSavedSearchFilters.view;
  const priceMinRaw = searchParams.get("priceMin");
  const priceMaxRaw = searchParams.get("priceMax");
  const priceMin = priceMinRaw ? Number(priceMinRaw) : null;
  const priceMax = priceMaxRaw ? Number(priceMaxRaw) : null;

  return {
    world,
    query,
    category: category === "all" ? "all" : category,
    location: location === "all" ? "all" : location,
    saleMode,
    sortBy,
    view,
    ...(Number.isFinite(priceMin) ? { priceMin } : {}),
    ...(Number.isFinite(priceMax) ? { priceMax } : {}),
  };
}

export function serializeFiltersToSearchParams(filters: SavedSearchFilters) {
  const params = new URLSearchParams();

  if (filters.query.trim()) {
    params.set("q", filters.query.trim());
  }

  if (filters.world !== defaultSavedSearchFilters.world) {
    params.set("world", filters.world);
  }

  if (filters.category !== "all") {
    params.set("category", filters.category);
  }

  if (filters.location !== "all") {
    params.set("location", encodeURIComponent(filters.location));
  }
  if (filters.saleMode !== defaultSavedSearchFilters.saleMode) {
    params.set("saleMode", filters.saleMode);
  }

  if (filters.sortBy !== defaultSavedSearchFilters.sortBy) {
    params.set("sort", filters.sortBy);
  }

  if (filters.view !== defaultSavedSearchFilters.view) {
    params.set("view", filters.view);
  }
  if (typeof filters.priceMin === "number") {
    params.set("priceMin", String(filters.priceMin));
  }
  if (typeof filters.priceMax === "number") {
    params.set("priceMax", String(filters.priceMax));
  }

  return params;
}

export function serializeStoreFiltersToSearchParams(filters: StoreSearchFilters) {
  const params = new URLSearchParams();
  if (filters.query.trim()) {
    params.set("q", filters.query.trim());
  }
  if (filters.location !== "all") {
    params.set("location", encodeURIComponent(filters.location));
  }
  if (filters.specialization !== "all") {
    params.set("specialization", filters.specialization);
  }
  if (filters.verifiedOnly) {
    params.set("verifiedOnly", "1");
  }
  if (filters.storeType !== "all") {
    params.set("storeType", filters.storeType);
  }
  if (filters.sortBy !== "rating_desc") {
    params.set("sort", filters.sortBy);
  }
  return params;
}

export function buildListingsHref(filters: SavedSearchFilters) {
  const qs = serializeFiltersToSearchParams(filters).toString();
  return qs ? `/listings?${qs}` : "/listings";
}

export function buildStoresHref(filters: StoreSearchFilters) {
  const qs = serializeStoreFiltersToSearchParams(filters).toString();
  return qs ? `/stores?${qs}` : "/stores";
}

export function buildAutoSearchLabel(filters: SavedSearchFilters) {
  const chunks: string[] = [];

  const trimmed = filters.query.trim();
  if (trimmed) {
    const short = trimmed.length > 36 ? `${trimmed.slice(0, 36)}…` : trimmed;
    chunks.push(`«${short}»`);
  }

  if (filters.category !== "all") {
    chunks.push(categoryLabels[filters.category as ListingCategory] ?? filters.category);
  }

  if (filters.location !== "all") {
    chunks.push(filters.location);
  }

  if (chunks.length === 0) {
    return "Сохранённый поиск";
  }

  return chunks.join(" · ");
}

export function buildSearchSummary(filters: SavedSearchFilters) {
  const lines: string[] = [];

  lines.push(filters.query.trim() ? `Запрос: ${filters.query.trim()}` : "Запрос: без текста");

  lines.push(`Контекст: ${getWorldLabel(filters.world)}`);

  lines.push(
    filters.category === "all"
      ? "Категория: все"
      : `Категория: ${categoryLabels[filters.category as ListingCategory] ?? filters.category}`,
  );

  lines.push(filters.location === "all" ? "Город: все" : `Город: ${filters.location}`);
  lines.push(
    filters.saleMode === "all"
      ? "Режим: все"
      : filters.saleMode === "auction"
        ? "Режим: аукцион"
        : filters.saleMode === "fixed"
          ? "Режим: продажа"
          : "Режим: бесплатно",
  );

  const sortLabels: Record<SortOption, string> = {
    newest: "Сначала новые",
    price_asc: "Сначала дешевле",
    price_desc: "Сначала дороже",
  };
  lines.push(`Сортировка: ${sortLabels[filters.sortBy]}`);

  lines.push(filters.view === "grid" ? "Вид: сетка" : "Вид: список");
  if (typeof filters.priceMin === "number" || typeof filters.priceMax === "number") {
    lines.push(
      `Цена: ${typeof filters.priceMin === "number" ? `от ${filters.priceMin}` : "от любой"} - ${
        typeof filters.priceMax === "number" ? `до ${filters.priceMax}` : "до любой"
      }`,
    );
  }

  return lines.join(" · ");
}

function uid(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function normalizeQuery(query: string) {
  return query.toLowerCase().replace(/\s+/g, " ").trim();
}

function buildListingIntentChips(filters: SavedSearchFilters): Array<{ key: string; label: string; value?: string }> {
  const chips: Array<{ key: string; label: string; value?: string }> = [];
  if (filters.query.trim()) chips.push({ key: "query", label: "Запрос", value: filters.query.trim() });
  if (filters.category !== "all") chips.push({ key: "category", label: "Категория", value: filters.category });
  if (filters.location !== "all") chips.push({ key: "location", label: "Город", value: filters.location });
  if (filters.saleMode !== "all") chips.push({ key: "saleMode", label: "Режим", value: filters.saleMode });
  if (typeof filters.priceMin === "number") chips.push({ key: "priceMin", label: "Цена от", value: String(filters.priceMin) });
  if (typeof filters.priceMax === "number") chips.push({ key: "priceMax", label: "Цена до", value: String(filters.priceMax) });
  return chips;
}

function buildStoreIntentChips(filters: StoreSearchFilters): Array<{ key: string; label: string; value?: string }> {
  const chips: Array<{ key: string; label: string; value?: string }> = [];
  if (filters.query.trim()) chips.push({ key: "query", label: "Запрос", value: filters.query.trim() });
  if (filters.location !== "all") chips.push({ key: "location", label: "Город", value: filters.location });
  if (filters.specialization !== "all")
    chips.push({ key: "specialization", label: "Специализация", value: filters.specialization });
  if (filters.verifiedOnly) chips.push({ key: "verifiedOnly", label: "Только проверенные", value: "Да" });
  if (filters.storeType !== "all") chips.push({ key: "storeType", label: "Тип магазина", value: filters.storeType });
  return chips;
}

function toSearchFilters(filters: SavedSearchFilters): SearchFilters {
  return {
    query: filters.query || undefined,
    categoryId: filters.category === "all" ? null : filters.category,
    location: filters.location === "all" ? null : filters.location,
    priceMin: typeof filters.priceMin === "number" ? filters.priceMin : null,
    priceMax: typeof filters.priceMax === "number" ? filters.priceMax : null,
    attributes: {
      world: filters.world,
      saleMode: filters.saleMode,
      view: filters.view,
    },
  };
}

export function createSearchIntentFromFilters(
  filters: SavedSearchFilters,
  mode: SearchInputMode = "keyword",
): SearchIntent {
  return {
    id: uid("intent"),
    target: "listing",
    mode,
    rawQuery: filters.query,
    normalizedQuery: normalizeQuery(filters.query),
    filters: toSearchFilters(filters),
    chips: buildListingIntentChips(filters),
    autoTitle: buildAutoSearchLabel(filters),
    sort: filters.sortBy,
    aiMeta: {
      interpretedFromNaturalLanguage: mode === "natural_language",
    },
  };
}

export function createStoreSearchIntentFromFilters(
  filters: StoreSearchFilters,
  mode: SearchInputMode = "keyword",
): SearchIntent {
  return {
    id: uid("intent"),
    target: "store",
    mode,
    rawQuery: filters.query,
    normalizedQuery: normalizeQuery(filters.query),
    filters: {
      query: filters.query || undefined,
      location: filters.location === "all" ? null : filters.location,
      attributes: {
        specialization: filters.specialization,
        verifiedOnly: filters.verifiedOnly ? "1" : "0",
        storeType: filters.storeType,
      },
    },
    chips: buildStoreIntentChips(filters),
    autoTitle: filters.query.trim() ? `Магазины: «${filters.query.trim()}»` : "Поиск магазинов",
    sort: filters.sortBy,
    aiMeta: {
      interpretedFromNaturalLanguage: mode === "natural_language",
    },
  };
}

function extractNaturalLanguagePrice(raw: string): { priceMin: number | null; priceMax: number | null } {
  const normalized = raw.toLowerCase();
  const underMatch = normalized.match(/до\s+(\d+)(к|k|тыс)?/);
  if (!underMatch) {
    return { priceMin: null, priceMax: null };
  }
  const value = Number(underMatch[1]);
  const multiplier = underMatch[2] ? 1000 : 1;
  return { priceMin: null, priceMax: value * multiplier };
}

export function createSearchIntentFromNaturalLanguage(rawQuery: string): SearchIntent {
  const normalized = normalizeQuery(rawQuery);
  const extractedAttributes: string[] = [];
  const colors = ["красный", "белый", "черный", "синий", "зеленый"];
  const detectedColor = colors.find((item) => normalized.includes(item));
  if (detectedColor) extractedAttributes.push(`color:${detectedColor}`);
  const location = normalized.includes("москва") ? "Москва" : null;
  if (location) extractedAttributes.push("location:Москва");
  const price = extractNaturalLanguagePrice(normalized);
  const query = normalized
    .replace(/хочу/g, "")
    .replace(/до\s+\d+(к|k|тыс)?/g, "")
    .replace(/москва/g, "")
    .trim();
  const filters: SavedSearchFilters = {
    ...defaultSavedSearchFilters,
    query,
    location: location ?? "all",
    priceMax: price.priceMax,
  };
  return {
    ...createSearchIntentFromFilters(filters, "natural_language"),
    rawQuery,
    aiMeta: {
      interpretedFromNaturalLanguage: true,
      extractedAttributes,
    },
  };
}

export function createSearchIntentFromImageSearch(input: {
  imageUrl?: string;
  inferredCategory?: string;
  traits?: string[];
  normalizedQuery?: string;
}): SearchIntent {
  const query = input.normalizedQuery ?? [input.inferredCategory, ...(input.traits ?? [])].filter(Boolean).join(" ");
  const filters: SavedSearchFilters = {
    ...defaultSavedSearchFilters,
    query,
    category: input.inferredCategory ?? "all",
  };
  return {
    ...createSearchIntentFromFilters(filters, "image"),
    imageSearchMeta: {
      imageUrl: input.imageUrl,
      dominantTraits: input.traits ?? [],
    },
  };
}

export function serializeIntentKey(intent: SearchIntent): string {
  const keyPayload = {
    target: intent.target,
    mode: intent.mode,
    normalizedQuery: intent.normalizedQuery,
    filters: intent.filters,
    sort: intent.sort ?? "newest",
  };
  return JSON.stringify(keyPayload);
}

export function areIntentsEqual(left: SearchIntent, right: SearchIntent): boolean {
  return serializeIntentKey(left) === serializeIntentKey(right);
}

export function intentToSavedSearchFilters(intent: SearchIntent): SavedSearchFilters {
  const attrs = intent.filters.attributes ?? {};
  const world = typeof attrs.world === "string" && isCatalogWorld(attrs.world) ? attrs.world : "all";
  const saleMode = typeof attrs.saleMode === "string" && isSaleMode(attrs.saleMode) ? attrs.saleMode : "all";
  const view = typeof attrs.view === "string" && isListingsView(attrs.view) ? attrs.view : "grid";
  return {
    world,
    query: intent.filters.query ?? intent.rawQuery,
    category: intent.filters.categoryId ?? "all",
    location: intent.filters.location ?? "all",
    saleMode,
    sortBy: isSortOption(intent.sort ?? "") ? (intent.sort as SortOption) : "newest",
    view,
    priceMin: intent.filters.priceMin ?? null,
    priceMax: intent.filters.priceMax ?? null,
  };
}

export function buildListingsHrefFromIntent(intent: SearchIntent) {
  const params = serializeFiltersToSearchParams(intentToSavedSearchFilters(intent));
  params.set("target", "listing");
  params.set("mode", intent.mode);
  const qs = params.toString();
  return qs ? `/listings?${qs}` : "/listings";
}

export function intentToStoreSearchFilters(intent: SearchIntent): StoreSearchFilters {
  const attrs = intent.filters.attributes ?? {};
  const specialization =
    typeof attrs.specialization === "string" && attrs.specialization.length > 0
      ? attrs.specialization
      : "all";
  const storeType = typeof attrs.storeType === "string" && attrs.storeType.length > 0 ? attrs.storeType : "all";
  const verifiedOnly = attrs.verifiedOnly === "1";
  const sortBy =
    intent.sort === "listings_desc" || intent.sort === "newest_desc" || intent.sort === "rating_desc"
      ? intent.sort
      : "rating_desc";
  return {
    query: intent.filters.query ?? intent.rawQuery,
    location: intent.filters.location ?? "all",
    specialization,
    verifiedOnly,
    storeType,
    sortBy,
  };
}

export function buildStoresHrefFromIntent(intent: SearchIntent) {
  const params = serializeStoreFiltersToSearchParams(intentToStoreSearchFilters(intent));
  params.set("target", "store");
  params.set("mode", intent.mode);
  const qs = params.toString();
  return qs ? `/stores?${qs}` : "/stores";
}

export function buildSearchHrefFromIntent(intent: SearchIntent) {
  return intent.target === "store" ? buildStoresHrefFromIntent(intent) : buildListingsHrefFromIntent(intent);
}

export function parseIntentFromSearchParams(searchParams: URLSearchParams): SearchIntent | null {
  const targetRaw = searchParams.get("target");
  const target: SearchTarget = targetRaw === "store" ? "store" : "listing";
  const modeRaw = searchParams.get("mode");
  const mode: SearchInputMode =
    modeRaw === "natural_language" || modeRaw === "image" || modeRaw === "keyword" ? modeRaw : "keyword";
  if (target === "store") {
    const storeFilters: StoreSearchFilters = {
      query: searchParams.get("q") ?? "",
      location: searchParams.get("location") ? decodeURIComponent(searchParams.get("location") as string) : "all",
      specialization: searchParams.get("specialization") ?? "all",
      verifiedOnly: searchParams.get("verifiedOnly") === "1",
      storeType: searchParams.get("storeType") ?? "all",
      sortBy:
        searchParams.get("sort") === "listings_desc" || searchParams.get("sort") === "newest_desc"
          ? (searchParams.get("sort") as StoreSearchFilters["sortBy"])
          : "rating_desc",
    };
    return createStoreSearchIntentFromFilters(storeFilters, mode);
  }
  const filters = parseFiltersFromSearchParams(searchParams);
  if (!filters) {
    return null;
  }
  return createSearchIntentFromFilters(filters, mode);
}

export function formatSavedSearchCreatedAt(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
