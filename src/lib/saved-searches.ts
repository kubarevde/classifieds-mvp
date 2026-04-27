import { CatalogWorld, categoryLabels, getWorldLabel, ListingsView, SortOption } from "@/lib/listings";
import { ListingCategory } from "@/lib/types";
import type { AuctionSaleMode } from "@/entities/auction/model";

export type SavedSearchFilters = {
  world: CatalogWorld;
  query: string;
  category: "all" | string;
  location: "all" | string;
  saleMode: AuctionSaleMode;
  sortBy: SortOption;
  view: ListingsView;
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

const URL_KEYS = ["world", "q", "category", "location", "saleMode", "sort", "view"] as const;

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

  return {
    world,
    query,
    category: category === "all" ? "all" : category,
    location: location === "all" ? "all" : location,
    saleMode,
    sortBy,
    view,
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

  return params;
}

export function buildListingsHref(filters: SavedSearchFilters) {
  const qs = serializeFiltersToSearchParams(filters).toString();
  return qs ? `/listings?${qs}` : "/listings";
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

  return lines.join(" · ");
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
