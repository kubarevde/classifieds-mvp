import { categories, popularListings } from "@/lib/mock-data";
import { agricultureCategories, agricultureListings } from "@/lib/agriculture";
import { electronicsCategories, electronicsListings } from "@/lib/electronics";
import { Listing, ListingCategory } from "@/lib/types";

export type SortOption = "newest" | "price_asc" | "price_desc";
export type ListingsView = "grid" | "list";
export type CatalogWorld = "all" | "agriculture" | "electronics";
export type ListingWorld = "base" | "agriculture" | "electronics";

export type UnifiedCatalogListing = {
  id: string;
  title: string;
  price: string;
  priceValue: number;
  location: string;
  publishedAt: string;
  postedAtIso: string;
  image: string;
  condition: string;
  description: string;
  sellerName: string;
  sellerPhone: string;
  categoryId: string;
  categoryLabel: string;
  world: ListingWorld;
  worldLabel: string;
  detailsHref?: string;
};

export type UnifiedCategoryOption = {
  id: string;
  label: string;
};

export type WorldQuickFilter = {
  id: string;
  label: string;
  query: string;
  categoryId?: string;
};

export type CreateListingSubcategoryOption = {
  id: string;
  label: string;
};

export type ListingBadge = {
  id: string;
  label: string;
  tone: "agriculture" | "electronics";
};

export const sortOptions: Record<SortOption, string> = {
  newest: "Сначала новые",
  price_asc: "Сначала дешевле",
  price_desc: "Сначала дороже",
};

export const categoryLabels: Record<ListingCategory, string> = Object.fromEntries(
  categories.map((category) => [category.id, category.label]),
) as Record<ListingCategory, string>;

export const allListings = popularListings;

const baseCatalogListings: UnifiedCatalogListing[] = allListings.map((listing) => ({
  id: listing.id,
  title: listing.title,
  price: listing.price,
  priceValue: listing.priceValue,
  location: listing.location,
  publishedAt: listing.publishedAt,
  postedAtIso: listing.postedAtIso,
  image: listing.image,
  condition: listing.condition,
  description: listing.description,
  sellerName: listing.sellerName,
  sellerPhone: listing.sellerPhone,
  categoryId: listing.category,
  categoryLabel: categoryLabels[listing.category],
  world: "base",
  worldLabel: "Все объявления",
  detailsHref: `/listings/${listing.id}`,
}));

const agricultureCatalogListings: UnifiedCatalogListing[] = agricultureListings.map((listing) => ({
  id: listing.id,
  title: listing.title,
  price: listing.price,
  priceValue: listing.priceValue,
  location: listing.location,
  publishedAt: listing.publishedAt,
  postedAtIso: listing.postedAtIso,
  image: listing.image,
  condition: listing.condition,
  description: listing.description,
  sellerName: listing.sellerName,
  sellerPhone: listing.sellerPhone,
  categoryId: listing.categoryId,
  categoryLabel: listing.categoryLabel,
  world: "agriculture",
  worldLabel: "Сельское хозяйство",
}));

const electronicsCatalogListings: UnifiedCatalogListing[] = electronicsListings.map((listing) => ({
  id: listing.id,
  title: listing.title,
  price: listing.price,
  priceValue: listing.priceValue,
  location: listing.location,
  publishedAt: listing.publishedAt,
  postedAtIso: listing.postedAtIso,
  image: listing.image,
  condition: listing.condition,
  description: listing.description,
  sellerName: listing.sellerName,
  sellerPhone: listing.sellerPhone,
  categoryId: listing.categoryId,
  categoryLabel: listing.categoryLabel,
  world: "electronics",
  worldLabel: "Электроника",
}));

export const unifiedCatalogListings: UnifiedCatalogListing[] = [
  ...baseCatalogListings,
  ...agricultureCatalogListings,
  ...electronicsCatalogListings,
];

export const worldOptions: { id: CatalogWorld; label: string; description: string }[] = [
  { id: "all", label: "Все", description: "Единый поток объявлений со всей платформы" },
  {
    id: "agriculture",
    label: "Сельское хозяйство",
    description: "Продукция, техника, земля и агро-бизнес в одном контексте",
  },
  {
    id: "electronics",
    label: "Электроника",
    description: "Смартфоны, ноутбуки, консоли, комплектующие и смарт-устройства",
  },
];

export const worldQuickFilters: Record<CatalogWorld, WorldQuickFilter[]> = {
  all: [
    { id: "all-new", label: "Новые сегодня", query: "сегодня" },
    { id: "all-budget", label: "Бюджетные предложения", query: "от" },
  ],
  agriculture: [
    { id: "agri-berries", label: "Ягоды", query: "ягод", categoryId: "ready_products" },
    { id: "agri-machinery", label: "Техника", query: "трактор", categoryId: "tractors" },
    { id: "agri-land", label: "Земля", query: "земля", categoryId: "land" },
  ],
  electronics: [
    { id: "tech-smartphones", label: "Смартфоны", query: "iphone", categoryId: "smartphones" },
    { id: "tech-gaming", label: "Игровые", query: "игров", categoryId: "consoles" },
    { id: "tech-work", label: "Для работы", query: "macbook", categoryId: "laptops_pc" },
  ],
};

export function getWorldLabel(world: CatalogWorld) {
  return worldOptions.find((item) => item.id === world)?.label ?? "Все";
}

export function getUniqueLocations(listings: Listing[]) {
  return [...new Set(listings.map((listing) => listing.location))].sort((a, b) =>
    a.localeCompare(b, "ru"),
  );
}

type FilterInput = {
  query: string;
  category: "all" | ListingCategory;
  location: "all" | string;
  sortBy: SortOption;
};

export function filterAndSortListings(listings: Listing[], filters: FilterInput) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  const filtered = listings.filter((listing) => {
    const matchesQuery = normalizedQuery
      ? listing.title.toLowerCase().includes(normalizedQuery)
      : true;
    const matchesCategory = filters.category === "all" || listing.category === filters.category;
    const matchesLocation = filters.location === "all" || listing.location === filters.location;

    return matchesQuery && matchesCategory && matchesLocation;
  });

  return filtered.sort((a, b) => {
    if (filters.sortBy === "price_asc") {
      return a.priceValue - b.priceValue;
    }

    if (filters.sortBy === "price_desc") {
      return b.priceValue - a.priceValue;
    }

    return new Date(b.postedAtIso).getTime() - new Date(a.postedAtIso).getTime();
  });
}

export function getWorldScopedListings(world: CatalogWorld) {
  if (world === "agriculture") {
    return agricultureCatalogListings;
  }

  if (world === "electronics") {
    return electronicsCatalogListings;
  }

  return unifiedCatalogListings;
}

export function getCategoryOptionsForWorld(world: CatalogWorld): UnifiedCategoryOption[] {
  if (world === "agriculture") {
    return agricultureCategories.map((category) => ({ id: category.id, label: category.label }));
  }

  if (world === "electronics") {
    return electronicsCategories.map((category) => ({ id: category.id, label: category.label }));
  }

  const unique = new Map<string, string>();
  categories.forEach((category) => unique.set(category.id, category.label));
  agricultureCategories.forEach((category) => unique.set(category.id, category.label));
  electronicsCategories.forEach((category) => unique.set(category.id, category.label));
  return [...unique.entries()].map(([id, label]) => ({ id, label }));
}

const electronicsSubcategories: Record<string, CreateListingSubcategoryOption[]> = {
  smartphones: [
    { id: "android", label: "Android" },
    { id: "iphone", label: "iPhone" },
    { id: "accessories", label: "Аксессуары" },
  ],
  laptops_pc: [
    { id: "laptops", label: "Ноутбуки" },
    { id: "desktop", label: "ПК и моноблоки" },
    { id: "monitors", label: "Мониторы" },
  ],
  consoles: [
    { id: "playstation", label: "PlayStation" },
    { id: "xbox", label: "Xbox" },
    { id: "nintendo", label: "Nintendo" },
  ],
  photo_audio: [
    { id: "camera", label: "Камеры" },
    { id: "audio", label: "Аудио" },
    { id: "microphones", label: "Микрофоны" },
  ],
  smart_home: [
    { id: "security", label: "Безопасность" },
    { id: "lighting", label: "Освещение" },
    { id: "sensors", label: "Датчики" },
  ],
  components: [
    { id: "gpu", label: "Видеокарты" },
    { id: "storage", label: "SSD и накопители" },
    { id: "memory", label: "ОЗУ и комплектующие" },
  ],
};

export function getSubcategoryOptionsForWorld(world: CatalogWorld, categoryId: string) {
  if (!categoryId) {
    return [];
  }

  if (world === "agriculture") {
    return (
      agricultureCategories.find((category) => category.id === categoryId)?.children?.map((child) => ({
        id: child,
        label: child[0].toUpperCase() + child.slice(1),
      })) ?? []
    );
  }

  if (world === "electronics") {
    return electronicsSubcategories[categoryId] ?? [];
  }

  return [];
}

export function getListingBadges(listing: UnifiedCatalogListing): ListingBadge[] {
  const badges: ListingBadge[] = [];
  const title = listing.title.toLowerCase();
  const condition = listing.condition.toLowerCase();

  if (listing.world === "agriculture") {
    if (listing.priceValue < 500000) {
      badges.push({ id: "agri-price", label: "Популярно у фермеров", tone: "agriculture" });
    } else {
      badges.push({ id: "agri-season", label: "Сезонное", tone: "agriculture" });
    }

    if (["москва", "краснодар", "ростов-на-дону"].includes(listing.location.toLowerCase())) {
      badges.push({ id: "agri-near", label: "Рядом с вами", tone: "agriculture" });
    }
  }

  if (listing.world === "electronics") {
    if (listing.priceValue <= 70000) {
      badges.push({ id: "tech-price", label: "Лучшая цена", tone: "electronics" });
    }

    if (condition.includes("как новый") || condition.includes("гарант")) {
      badges.push({ id: "tech-condition", label: "Как новый", tone: "electronics" });
    } else if (title.includes("игров") || title.includes("playstation")) {
      badges.push({ id: "tech-gaming", label: "Игровой", tone: "electronics" });
    }
  }

  return badges.slice(0, 2);
}

type UnifiedFilterInput = {
  query: string;
  category: "all" | string;
  location: "all" | string;
  sortBy: SortOption;
};

export function filterAndSortUnifiedListings(
  listings: UnifiedCatalogListing[],
  filters: UnifiedFilterInput,
) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  const filtered = listings.filter((listing) => {
    const matchesQuery = normalizedQuery
      ? `${listing.title} ${listing.description} ${listing.categoryLabel}`
          .toLowerCase()
          .includes(normalizedQuery)
      : true;
    const matchesCategory = filters.category === "all" || listing.categoryId === filters.category;
    const matchesLocation = filters.location === "all" || listing.location === filters.location;
    return matchesQuery && matchesCategory && matchesLocation;
  });

  return filtered.sort((a, b) => {
    if (filters.sortBy === "price_asc") {
      return a.priceValue - b.priceValue;
    }

    if (filters.sortBy === "price_desc") {
      return b.priceValue - a.priceValue;
    }

    return new Date(b.postedAtIso).getTime() - new Date(a.postedAtIso).getTime();
  });
}

export function getUniqueLocationsForUnified(listings: UnifiedCatalogListing[]) {
  return [...new Set(listings.map((listing) => listing.location))].sort((a, b) =>
    a.localeCompare(b, "ru"),
  );
}

export function toUnifiedCatalogListing(listing: Listing): UnifiedCatalogListing {
  return {
    id: listing.id,
    title: listing.title,
    price: listing.price,
    priceValue: listing.priceValue,
    location: listing.location,
    publishedAt: listing.publishedAt,
    postedAtIso: listing.postedAtIso,
    image: listing.image,
    condition: listing.condition,
    description: listing.description,
    sellerName: listing.sellerName,
    sellerPhone: listing.sellerPhone,
    categoryId: listing.category,
    categoryLabel: categoryLabels[listing.category],
    world: "base",
    worldLabel: "Все объявления",
    detailsHref: `/listings/${listing.id}`,
  };
}

export function getRelatedListings(listing: Listing, limit = 4) {
  const byCategory = allListings.filter(
    (currentListing) => currentListing.id !== listing.id && currentListing.category === listing.category,
  );
  const fromOtherCategories = allListings.filter(
    (currentListing) => currentListing.id !== listing.id && currentListing.category !== listing.category,
  );

  return [...byCategory, ...fromOtherCategories].slice(0, limit);
}

export function getRelatedUnifiedListings(listing: Listing, limit = 4) {
  return getRelatedListings(listing, limit).map(toUnifiedCatalogListing);
}

export function formatPostedAt(isoDate: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoDate));
}
