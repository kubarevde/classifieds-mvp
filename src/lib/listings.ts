import { categories, popularListings } from "@/lib/mock-data";
import { agricultureCategories, agricultureListings } from "@/lib/agriculture";
import { electronicsCategories, electronicsListings } from "@/lib/electronics";
import { Listing, ListingCategory } from "@/lib/types";

export type SortOption = "newest" | "price_asc" | "price_desc";
export type ListingsView = "grid" | "list";
export type CatalogWorld =
  | "all"
  | "electronics"
  | "autos"
  | "agriculture"
  | "real_estate"
  | "jobs"
  | "services";
export type ListingWorld =
  | "base"
  | "electronics"
  | "autos"
  | "agriculture"
  | "real_estate"
  | "jobs"
  | "services";

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

const worldCategoryCatalog: Record<Exclude<CatalogWorld, "all">, UnifiedCategoryOption[]> = {
  electronics: [
    { id: "phones", label: "Телефоны" },
    { id: "audio_video", label: "Аудио и видео" },
    { id: "computer_goods", label: "Товары для компьютера" },
    { id: "games_software", label: "Игры, приставки и программы" },
    { id: "laptops", label: "Ноутбуки" },
    { id: "desktop_computers", label: "Настольные компьютеры" },
    { id: "photo", label: "Фототехника" },
    { id: "tablets_ebooks", label: "Планшеты и электронные книги" },
    { id: "office_equipment", label: "Оргтехника и расходники" },
  ],
  autos: [
    { id: "passenger_cars", label: "Легковые авто" },
    { id: "new_cars", label: "Новые авто" },
    { id: "select", label: "Селект" },
    { id: "trucks_special", label: "Грузовики и спецтехника" },
    { id: "motorcycles", label: "Мотоциклы и мототехника" },
    { id: "car_rent", label: "Аренда авто" },
    { id: "equipment_rent", label: "Аренда техники" },
    { id: "parts", label: "Запчасти" },
  ],
  agriculture: agricultureCategories.map((category) => ({ id: category.id, label: category.label })),
  real_estate: [
    { id: "new_buildings", label: "Новостройки" },
    { id: "secondary", label: "Вторичка" },
    { id: "houses", label: "Дома, дачи, коттеджи" },
    { id: "rent_apartments", label: "Квартиры в аренду" },
    { id: "commercial", label: "Коммерческая недвижимость" },
  ],
  jobs: [
    { id: "resume", label: "Резюме" },
    { id: "vacancies", label: "Вакансии" },
  ],
  services: [
    { id: "cargo_transportation", label: "Грузовые перевозки" },
    { id: "repair_finishing", label: "Ремонт и отделка" },
    { id: "beauty", label: "Красота" },
    { id: "construction", label: "Стройка" },
    { id: "business_services", label: "Деловые услуги" },
  ],
};

function mapElectronicsCategoryToWorldCategory(categoryId: string): UnifiedCategoryOption {
  if (categoryId === "smartphones") {
    return { id: "phones", label: "Телефоны" };
  }
  if (categoryId === "laptops_pc") {
    return { id: "laptops", label: "Ноутбуки" };
  }
  if (categoryId === "consoles") {
    return { id: "games_software", label: "Игры, приставки и программы" };
  }
  if (categoryId === "photo_audio") {
    return { id: "audio_video", label: "Аудио и видео" };
  }
  if (categoryId === "smart_home") {
    return { id: "office_equipment", label: "Оргтехника и расходники" };
  }
  if (categoryId === "components") {
    return { id: "computer_goods", label: "Товары для компьютера" };
  }
  return { id: "computer_goods", label: "Товары для компьютера" };
}

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

const agricultureCatalogListingsBase: UnifiedCatalogListing[] = agricultureListings.map((listing) => ({
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

const electronicsCatalogListingsBase: UnifiedCatalogListing[] = electronicsListings.map((listing) => ({
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
  categoryId: mapElectronicsCategoryToWorldCategory(listing.categoryId).id,
  categoryLabel: mapElectronicsCategoryToWorldCategory(listing.categoryId).label,
  world: "electronics",
  worldLabel: "Электроника",
}));

const electronicsFromBaseCatalogListings: UnifiedCatalogListing[] = baseCatalogListings
  .filter((listing) => listing.categoryId === "electronics")
  .map((listing, index) => ({
    ...listing,
    id: `electronics-base-${listing.id}-${index}`,
    categoryId: "phones",
    categoryLabel: "Телефоны",
    world: "electronics",
    worldLabel: "Электроника",
  }));

const electronicsCatalogListings: UnifiedCatalogListing[] = [
  ...electronicsCatalogListingsBase,
  ...electronicsFromBaseCatalogListings,
];

const autosCatalogListings: UnifiedCatalogListing[] = baseCatalogListings
  .filter((listing) => listing.categoryId === "auto")
  .map((listing, index) => ({
    ...listing,
    id: `autos-${listing.id}-${index}`,
    categoryId: "passenger_cars",
    categoryLabel: "Легковые авто",
    world: "autos",
    worldLabel: "Автомобили",
  }));

const realEstateCatalogListings: UnifiedCatalogListing[] = baseCatalogListings
  .filter((listing) => listing.categoryId === "real_estate")
  .map((listing, index) => ({
    ...listing,
    id: `estate-${listing.id}-${index}`,
    categoryId: listing.title.toLowerCase().includes("аренда") ? "rent_apartments" : "secondary",
    categoryLabel: listing.title.toLowerCase().includes("аренда") ? "Квартиры в аренду" : "Вторичка",
    world: "real_estate",
    worldLabel: "Недвижимость",
  }));

const servicesCatalogListings: UnifiedCatalogListing[] = baseCatalogListings
  .filter((listing) => listing.categoryId === "services")
  .map((listing, index) => ({
    ...listing,
    id: `services-${listing.id}-${index}`,
    categoryId: "repair_finishing",
    categoryLabel: "Ремонт и отделка",
    world: "services",
    worldLabel: "Услуги",
  }));

const jobsCatalogListings: UnifiedCatalogListing[] = [
  {
    id: "jobs-1",
    title: "Менеджер по продажам в магазин электроники",
    price: "от 90 000 ₽ / мес",
    priceValue: 90000,
    location: "Москва",
    publishedAt: "Сегодня",
    postedAtIso: "2026-04-20T09:10:00+03:00",
    image: "from-indigo-800 via-violet-600 to-blue-200",
    condition: "Полная занятость, гибрид",
    description: "Команда storefront-направления ищет менеджера для продаж и коммуникации с клиентами.",
    sellerName: "Marina Select",
    sellerPhone: "+7 (921) 210-88-19",
    categoryId: "vacancies",
    categoryLabel: "Вакансии",
    world: "jobs",
    worldLabel: "Работа",
  },
  {
    id: "jobs-2",
    title: "Резюме: Специалист по digital-продвижению",
    price: "ожидание 110 000 ₽ / мес",
    priceValue: 110000,
    location: "Санкт-Петербург",
    publishedAt: "Вчера",
    postedAtIso: "2026-04-19T17:10:00+03:00",
    image: "from-sky-800 via-indigo-600 to-violet-200",
    condition: "Опыт 4 года, e-commerce",
    description: "Специалист с опытом в performance и CRM-каналах, готов развивать маркетинг магазинов.",
    sellerName: "Частный профиль",
    sellerPhone: "+7 (999) 000-00-00",
    categoryId: "resume",
    categoryLabel: "Резюме",
    world: "jobs",
    worldLabel: "Работа",
  },
];

const agricultureCatalogListings = agricultureCatalogListingsBase.map((listing) => ({
  ...listing,
  world: "agriculture" as const,
  worldLabel: "Сельское хозяйство",
}));

export const unifiedCatalogListings: UnifiedCatalogListing[] = [
  ...baseCatalogListings,
  ...agricultureCatalogListings,
  ...electronicsCatalogListings,
  ...jobsCatalogListings,
];

export const worldOptions: { id: CatalogWorld; label: string; description: string }[] = [
  { id: "all", label: "Все", description: "Единый поток объявлений со всей платформы" },
  {
    id: "electronics",
    label: "Электроника",
    description: "Телефоны, ноутбуки, консоли, комплектующие и smart-устройства",
  },
  {
    id: "autos",
    label: "Автомобили",
    description: "Легковые авто, спецтехника, аренда и запчасти",
  },
  {
    id: "agriculture",
    label: "Сельское хозяйство",
    description: "Продукция, техника, земля и агро-бизнес в одном контексте",
  },
  {
    id: "real_estate",
    label: "Недвижимость",
    description: "Новостройки, вторичка, аренда и коммерческие объекты",
  },
  {
    id: "jobs",
    label: "Работа",
    description: "Вакансии и резюме в отдельном деловом контексте",
  },
  {
    id: "services",
    label: "Услуги",
    description: "Бытовые, строительные и деловые услуги",
  },
];

export const worldQuickFilters: Record<CatalogWorld, WorldQuickFilter[]> = {
  all: [
    { id: "all-new", label: "Новые сегодня", query: "сегодня" },
    { id: "all-budget", label: "Бюджетные предложения", query: "от" },
  ],
  electronics: [
    { id: "tech-phones", label: "Телефоны", query: "iphone", categoryId: "phones" },
    { id: "tech-laptops", label: "Ноутбуки", query: "macbook", categoryId: "laptops" },
    { id: "tech-games", label: "Игры и консоли", query: "playstation", categoryId: "games_software" },
  ],
  autos: [
    { id: "auto-cars", label: "Легковые", query: "camry", categoryId: "passenger_cars" },
    { id: "auto-rent", label: "Аренда", query: "аренда", categoryId: "car_rent" },
    { id: "auto-parts", label: "Запчасти", query: "запчаст", categoryId: "parts" },
  ],
  agriculture: [
    { id: "agri-berries", label: "Ягоды", query: "ягод", categoryId: "ready_products" },
    { id: "agri-machinery", label: "Техника", query: "трактор", categoryId: "tractors" },
    { id: "agri-land", label: "Земля", query: "земля", categoryId: "land" },
  ],
  real_estate: [
    { id: "estate-new", label: "Новостройки", query: "жк", categoryId: "new_buildings" },
    { id: "estate-rent", label: "Аренда", query: "аренда", categoryId: "rent_apartments" },
    { id: "estate-commercial", label: "Коммерция", query: "коммерч", categoryId: "commercial" },
  ],
  jobs: [
    { id: "jobs-vacancy", label: "Вакансии", query: "менеджер", categoryId: "vacancies" },
    { id: "jobs-resume", label: "Резюме", query: "резюме", categoryId: "resume" },
  ],
  services: [
    { id: "services-repair", label: "Ремонт", query: "ремонт", categoryId: "repair_finishing" },
    { id: "services-cargo", label: "Перевозки", query: "перевоз", categoryId: "cargo_transportation" },
    { id: "services-business", label: "Деловые услуги", query: "делов", categoryId: "business_services" },
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
  if (world === "electronics") {
    return electronicsCatalogListings;
  }
  if (world === "autos") {
    return autosCatalogListings;
  }
  if (world === "agriculture") {
    return agricultureCatalogListings;
  }
  if (world === "real_estate") {
    return realEstateCatalogListings;
  }
  if (world === "jobs") {
    return jobsCatalogListings;
  }
  if (world === "services") {
    return servicesCatalogListings;
  }

  return unifiedCatalogListings;
}

export function getCategoryOptionsForWorld(world: CatalogWorld): UnifiedCategoryOption[] {
  if (world !== "all") {
    return worldCategoryCatalog[world];
  }

  const unique = new Map<string, string>();
  categories.forEach((category) => unique.set(category.id, category.label));
  agricultureCategories.forEach((category) => unique.set(category.id, category.label));
  electronicsCategories.forEach((category) => {
    const mapped = mapElectronicsCategoryToWorldCategory(category.id);
    unique.set(mapped.id, mapped.label);
  });
  Object.values(worldCategoryCatalog).forEach((options) =>
    options.forEach((option) => unique.set(option.id, option.label)),
  );
  return [...unique.entries()].map(([id, label]) => ({ id, label }));
}

const electronicsSubcategories: Record<string, CreateListingSubcategoryOption[]> = {
  phones: [
    { id: "android", label: "Android" },
    { id: "iphone", label: "iPhone" },
    { id: "accessories", label: "Аксессуары" },
  ],
  laptops: [
    { id: "laptops", label: "Ноутбуки" },
    { id: "desktop", label: "ПК и моноблоки" },
    { id: "monitors", label: "Мониторы" },
  ],
  games_software: [
    { id: "playstation", label: "PlayStation" },
    { id: "xbox", label: "Xbox" },
    { id: "nintendo", label: "Nintendo" },
  ],
  audio_video: [
    { id: "camera", label: "Камеры" },
    { id: "audio", label: "Аудио" },
    { id: "microphones", label: "Микрофоны" },
  ],
  office_equipment: [
    { id: "security", label: "Безопасность" },
    { id: "lighting", label: "Освещение" },
    { id: "sensors", label: "Датчики" },
  ],
  computer_goods: [
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

  if (world !== "all") {
    return [];
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
