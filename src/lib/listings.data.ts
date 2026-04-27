import { agricultureCategories, agricultureListings } from "@/lib/agriculture";
import { electronicsListings } from "@/lib/electronics";
import { categories, popularListings } from "@/lib/mock-data";
import type { ListingCategory } from "@/lib/types";

import type {
  CatalogWorld,
  CreateListingSubcategoryOption,
  SortOption,
  UnifiedCatalogListing,
  UnifiedCategoryOption,
  WorldQuickFilter,
} from "./listings.types";

export const sortOptions: Record<SortOption, string> = {
  newest: "Сначала новые",
  price_asc: "Сначала дешевле",
  price_desc: "Сначала дороже",
};

export const categoryLabels: Record<ListingCategory, string> = Object.fromEntries(
  categories.map((category) => [category.id, category.label]),
) as Record<ListingCategory, string>;

export const allListings = popularListings;

export function mapElectronicsCategoryToWorldCategory(categoryId: string): UnifiedCategoryOption {
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

export const worldCategoryCatalog: Record<Exclude<CatalogWorld, "all">, UnifiedCategoryOption[]> = {
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

const baseCatalogListings: UnifiedCatalogListing[] = allListings.map((listing) => ({
  id: listing.id,
  listingSaleMode: listing.listingSaleMode ?? "fixed",
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
  listingSaleMode: "fixed",
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

const electronicsCatalogListingsBase: UnifiedCatalogListing[] = electronicsListings.map((listing) => {
  const mapped = mapElectronicsCategoryToWorldCategory(listing.categoryId);
  return {
    id: listing.id,
    listingSaleMode: "fixed",
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
    categoryId: mapped.id,
    categoryLabel: mapped.label,
    world: "electronics" as const,
    worldLabel: "Электроника",
  };
});

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

export const electronicsCatalogListings: UnifiedCatalogListing[] = [
  ...electronicsCatalogListingsBase,
  ...electronicsFromBaseCatalogListings,
];

export const autosCatalogListings: UnifiedCatalogListing[] = baseCatalogListings
  .filter((listing) => listing.categoryId === "auto")
  .map((listing, index) => ({
    ...listing,
    id: `autos-${listing.id}-${index}`,
    categoryId: "passenger_cars",
    categoryLabel: "Легковые авто",
    world: "autos",
    worldLabel: "Автомобили",
  }));

export const realEstateCatalogListings: UnifiedCatalogListing[] = baseCatalogListings
  .filter((listing) => listing.categoryId === "real_estate")
  .map((listing, index) => ({
    ...listing,
    id: `estate-${listing.id}-${index}`,
    categoryId: listing.title.toLowerCase().includes("аренда") ? "rent_apartments" : "secondary",
    categoryLabel: listing.title.toLowerCase().includes("аренда") ? "Квартиры в аренду" : "Вторичка",
    world: "real_estate",
    worldLabel: "Недвижимость",
  }));

export const servicesCatalogListings: UnifiedCatalogListing[] = baseCatalogListings
  .filter((listing) => listing.categoryId === "services")
  .map((listing, index) => ({
    ...listing,
    id: `services-${listing.id}-${index}`,
    categoryId: "repair_finishing",
    categoryLabel: "Ремонт и отделка",
    world: "services",
    worldLabel: "Услуги",
  }));

export const jobsCatalogListings: UnifiedCatalogListing[] = [
  {
    id: "jobs-1",
    listingSaleMode: "fixed",
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
    listingSaleMode: "fixed",
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

export const agricultureCatalogListings = agricultureCatalogListingsBase.map((listing) => ({
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

export const electronicsSubcategories: Record<string, CreateListingSubcategoryOption[]> = {
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
