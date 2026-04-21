import { CatalogWorld, unifiedCatalogListings } from "@/lib/listings";

export type SellerType =
  | "private_seller"
  | "store_business"
  | "agriculture_oriented"
  | "electronics_oriented";

export type SellerListingStatus = "active" | "hidden" | "archived";
export type SellerPlanTier = "free" | "pro" | "business";
export type SellerMarketingAccessTier = "free" | "pro" | "business" | "one_time";

export type SellerTrustBadge = {
  id: string;
  label: string;
};

export type SellerListingRef = {
  listingId: string;
  status: SellerListingStatus;
};

export type SellerDashboardMetrics = {
  viewsLast30d: number;
  messagesLast30d: number;
  activeListingsCount: number;
  rating: number;
  responseSpeedLabel: string;
};

export type SellerContactLinks = {
  website: string;
  telegram: string;
  vk: string;
};

export type SellerStorefront = {
  id: string;
  displayName: string;
  storefrontName: string;
  type: SellerType;
  shortDescription: string;
  city: string;
  region: string;
  memberSinceLabel: string;
  memberSinceYear: number;
  phone: string;
  avatarLabel: string;
  heroGradientClass: string;
  accentClass: string;
  worldHint: "all" | "agriculture" | "electronics";
  responseSpeedLabel: string;
  planTier: SellerPlanTier;
  metrics: SellerDashboardMetrics;
  followersCount: number;
  contactLinks: SellerContactLinks;
  trustBadges: SellerTrustBadge[];
  listingRefs: SellerListingRef[];
};

export type StorefrontListing = (typeof unifiedCatalogListings)[number] & {
  status: SellerListingStatus;
};

export type SellerDashboardListing = StorefrontListing & {
  createdAtIso: string;
  updatedAtIso: string;
  views: number;
  messages: number;
};

export type SellerMarketingTool = {
  id: string;
  title: string;
  description: string;
  tier: SellerMarketingAccessTier;
  ctaLabel: "Узнать больше" | "Подключить";
};

export type SellerPostType = "news" | "promo" | "product" | "video";

export type SellerPost = {
  id: string;
  sellerId: string;
  type: SellerPostType;
  title: string;
  body: string;
  createdAt: string;
  imageUrl?: string;
  pinned?: boolean;
};

export type CouponDiscountType = "fixed" | "percent";
export type CouponStatus = "active" | "expired" | "disabled";
export type CouponScope = "store" | "listings";

export type MarketingCoupon = {
  id: string;
  sellerId: string;
  code: string;
  title: string;
  discountType: CouponDiscountType;
  discountValue: number;
  scope: CouponScope;
  listingIds: string[];
  validUntil: string;
  status: CouponStatus;
  showOnListingCard: boolean;
};

export type ListingPromotionState = {
  sellerId: string;
  listingId: string;
  lastBoostedAt: string | null;
  isSuper: boolean;
  isSponsored: boolean;
};

export type CampaignStatus = "active" | "paused";
export type CampaignPlacement = "catalog" | "thematic";

export type MarketingCampaign = {
  id: string;
  sellerId: string;
  name: string;
  listingIds: string[];
  world: CatalogWorld;
  placements: CampaignPlacement[];
  status: CampaignStatus;
};

export type PriceComparableRelation = "cheaper_than_you" | "more_expensive_than_you" | "close_to_you";

export type PriceComparableRow = {
  id: string;
  title: string;
  price: number;
  relation: PriceComparableRelation;
};

export type PriceAnalyticsSnapshot = {
  sellerId: string;
  world: CatalogWorld;
  categoryId: string | "all";
  marketMin: number;
  marketMedian: number;
  marketMax: number;
  sellerAverage: number;
  comparables: PriceComparableRow[];
};

export type SellerMarketingOverview = {
  extraViewsFromPromotion: number;
  activeCampaignsCount: number;
  activeToolTypesCount: number;
  activeTools: { id: string; label: string; status: string; menuKey: MarketingMenuKey }[];
};

export type ListingMarketingBadgeData = {
  coupon: MarketingCoupon | null;
  isSuper: boolean;
  isSponsored: boolean;
};

export type MarketingMenuKey =
  | "overview"
  | "price_analytics"
  | "mailings"
  | "coupons"
  | "planner"
  | "video"
  | "sponsored"
  | "boosts"
  | "hero_board";

export type HeroBoardTargetType = "storefront" | "listing";
export type HeroBoardScope = "global" | "world";
export type HeroBoardPeriod = "day" | "week" | "month";

export type HeroBoardPlacement = {
  id: string;
  sellerId: string;
  targetType: HeroBoardTargetType;
  listingId?: string;
  scope: HeroBoardScope;
  world?: CatalogWorld;
  period: HeroBoardPeriod;
  startsAt: string;
  endsAt: string;
  mockPrice: number;
  charityPercent: number;
  isActive: boolean;
};

const sellerTypeLabels: Record<SellerType, string> = {
  private_seller: "Частный продавец",
  store_business: "Магазин",
  agriculture_oriented: "Фермерское хозяйство",
  electronics_oriented: "Поставщик электроники",
};

const sellerPlanTierLabels: Record<SellerPlanTier, string> = {
  free: "Базовый",
  pro: "Про",
  business: "Бизнес",
};

const marketingTierLabels: Record<SellerMarketingAccessTier, string> = {
  free: "Бесплатно",
  pro: "Про",
  business: "Бизнес",
  one_time: "Разовая покупка",
};

type SellerStorefrontSeed = Omit<
  SellerStorefront,
  "planTier" | "metrics" | "followersCount" | "contactLinks"
> & {
  planTier?: SellerPlanTier;
  metrics?: Omit<SellerDashboardMetrics, "activeListingsCount">;
  followersCount?: number;
  contactLinks?: Partial<SellerContactLinks>;
};

const storefrontSellerSeeds: SellerStorefrontSeed[] = [
  {
    id: "alexey-drive",
    displayName: "Алексей",
    storefrontName: "Drive Point",
    type: "private_seller",
    shortDescription: "Подбираю и продаю ухоженные авто с прозрачной историей обслуживания.",
    city: "Москва",
    region: "Москва и область",
    memberSinceLabel: "на платформе с 2024",
    memberSinceYear: 2024,
    phone: "+7 (901) 123-45-67",
    avatarLabel: "АП",
    heroGradientClass: "from-slate-900 via-slate-700 to-blue-500",
    accentClass: "text-blue-100",
    worldHint: "all",
    responseSpeedLabel: "Обычно отвечает за 12 минут",
    trustBadges: [
      { id: "verified", label: "Проверенный продавец" },
      { id: "response", label: "Быстро отвечает" },
      { id: "repeat", label: "Повторные покупатели" },
    ],
    listingRefs: [
      { listingId: "1", status: "active" },
    ],
  },
  {
    id: "marina-tech",
    displayName: "Марина",
    storefrontName: "Marina Select",
    type: "electronics_oriented",
    shortDescription: "Подбираю смартфоны и ноутбуки в состоянии near-new с проверкой перед выдачей.",
    city: "Санкт-Петербург",
    region: "Санкт-Петербург и ЛО",
    memberSinceLabel: "на платформе с 2025",
    memberSinceYear: 2025,
    phone: "+7 (921) 210-88-19",
    avatarLabel: "МС",
    heroGradientClass: "from-slate-900 via-indigo-800 to-cyan-500",
    accentClass: "text-cyan-100",
    worldHint: "electronics",
    responseSpeedLabel: "Обычно отвечает за 9 минут",
    trustBadges: [
      { id: "verified", label: "Проверенный продавец" },
      { id: "tech", label: "Тех-эксперт" },
      { id: "delivery", label: "Быстрая отправка" },
    ],
    listingRefs: [
      { listingId: "2", status: "active" },
    ],
  },
  {
    id: "ildar-estate",
    displayName: "Ильдар",
    storefrontName: "Ключи рядом",
    type: "store_business",
    shortDescription: "Локальная витрина по недвижимости с подборкой семейных и инвестиционных вариантов.",
    city: "Казань",
    region: "Республика Татарстан",
    memberSinceLabel: "на платформе с 2023",
    memberSinceYear: 2023,
    phone: "+7 (987) 654-33-21",
    avatarLabel: "КР",
    heroGradientClass: "from-cyan-900 via-sky-700 to-indigo-500",
    accentClass: "text-sky-100",
    worldHint: "all",
    responseSpeedLabel: "Обычно отвечает за 25 минут",
    trustBadges: [
      { id: "verified", label: "Проверенный продавец" },
      { id: "safe", label: "Чистые документы" },
      { id: "hot", label: "Высокий спрос на объекты" },
    ],
    listingRefs: [
      { listingId: "3", status: "active" },
    ],
  },
  {
    id: "sergey-service",
    displayName: "Сергей",
    storefrontName: "Сервис рядом",
    type: "private_seller",
    shortDescription: "Мастер по сборке мебели и домашнему ремонту с подтвержденными заказами.",
    city: "Екатеринбург",
    region: "Свердловская область",
    memberSinceLabel: "на платформе с 2024",
    memberSinceYear: 2024,
    phone: "+7 (912) 005-44-78",
    avatarLabel: "СР",
    heroGradientClass: "from-amber-900 via-orange-700 to-rose-500",
    accentClass: "text-amber-100",
    worldHint: "all",
    responseSpeedLabel: "Обычно отвечает за 18 минут",
    trustBadges: [
      { id: "verified", label: "Проверенный продавец" },
      { id: "repeat", label: "Постоянные клиенты" },
      { id: "quality", label: "Высокий рейтинг качества" },
    ],
    listingRefs: [
      { listingId: "4", status: "active" },
    ],
  },
  {
    id: "egor-apple",
    displayName: "Егор",
    storefrontName: "Apple Select by Egor",
    type: "electronics_oriented",
    shortDescription: "Продаю ноутбуки Apple в near-new состоянии с гарантией и проверкой при встрече.",
    city: "Новосибирск",
    region: "Новосибирская область",
    memberSinceLabel: "на платформе с 2025",
    memberSinceYear: 2025,
    phone: "+7 (913) 444-77-56",
    avatarLabel: "ЕС",
    heroGradientClass: "from-slate-950 via-slate-700 to-indigo-500",
    accentClass: "text-indigo-100",
    worldHint: "electronics",
    responseSpeedLabel: "Обычно отвечает за 11 минут",
    trustBadges: [
      { id: "verified", label: "Проверенный продавец" },
      { id: "warranty", label: "Техника с гарантией" },
      { id: "careful", label: "Бережная эксплуатация" },
    ],
    listingRefs: [
      { listingId: "5", status: "active" },
      { listingId: "tech-3", status: "active" },
    ],
  },
  {
    id: "olga-rent",
    displayName: "Ольга",
    storefrontName: "Дом рядом",
    type: "private_seller",
    shortDescription: "Собираю витрину по аренде жилья с быстрым заселением и прозрачными условиями.",
    city: "Краснодар",
    region: "Краснодарский край",
    memberSinceLabel: "на платформе с 2024",
    memberSinceYear: 2024,
    phone: "+7 (918) 000-11-12",
    avatarLabel: "ДР",
    heroGradientClass: "from-indigo-900 via-blue-700 to-sky-500",
    accentClass: "text-sky-100",
    worldHint: "all",
    responseSpeedLabel: "Обычно отвечает за 16 минут",
    trustBadges: [
      { id: "verified", label: "Проверенный продавец" },
      { id: "docs", label: "Прозрачные условия аренды" },
      { id: "support", label: "Поддержка после заселения" },
    ],
    listingRefs: [{ listingId: "6", status: "active" }],
  },
  {
    id: "denis-garage",
    displayName: "Денис",
    storefrontName: "Garage Select",
    type: "private_seller",
    shortDescription: "Подбираю автомобили и комплектующие, делаю акцент на технически живые варианты.",
    city: "Нижний Новгород",
    region: "Приволжский федеральный округ",
    memberSinceLabel: "на платформе с 2023",
    memberSinceYear: 2023,
    phone: "+7 (952) 777-44-00",
    avatarLabel: "GS",
    heroGradientClass: "from-slate-950 via-slate-700 to-emerald-500",
    accentClass: "text-emerald-100",
    worldHint: "all",
    responseSpeedLabel: "Обычно отвечает за 13 минут",
    trustBadges: [
      { id: "verified", label: "Проверенный продавец" },
      { id: "service", label: "Техническая проверка" },
      { id: "history", label: "Прозрачная история" },
    ],
    listingRefs: [
      { listingId: "7", status: "active" },
      { listingId: "tech-8", status: "active" },
    ],
  },
  {
    id: "roman-console",
    displayName: "Роман",
    storefrontName: "Console Room",
    type: "electronics_oriented",
    shortDescription: "Мини-витрина по игровым консолям и аксессуарам с проверкой перед продажей.",
    city: "Москва",
    region: "Москва и область",
    memberSinceLabel: "на платформе с 2024",
    memberSinceYear: 2024,
    phone: "+7 (916) 301-22-90",
    avatarLabel: "CR",
    heroGradientClass: "from-indigo-950 via-blue-800 to-cyan-500",
    accentClass: "text-cyan-100",
    worldHint: "electronics",
    responseSpeedLabel: "Обычно отвечает за 8 минут",
    trustBadges: [
      { id: "verified", label: "Проверенный продавец" },
      { id: "gaming", label: "Геймерский профиль" },
      { id: "fast", label: "Быстро отвечает" },
    ],
    listingRefs: [
      { listingId: "8", status: "active" },
      { listingId: "tech-5", status: "active" },
    ],
  },
  {
    id: "alina-english",
    displayName: "Алина",
    storefrontName: "English Upgrade",
    type: "store_business",
    shortDescription: "Обучающие форматы для взрослых: разговорный английский, собеседования и релокация.",
    city: "Казань",
    region: "Республика Татарстан",
    memberSinceLabel: "на платформе с 2024",
    memberSinceYear: 2024,
    phone: "+7 (927) 111-60-61",
    avatarLabel: "EU",
    heroGradientClass: "from-emerald-900 via-teal-700 to-cyan-500",
    accentClass: "text-teal-100",
    worldHint: "all",
    responseSpeedLabel: "Обычно отвечает за 22 минуты",
    trustBadges: [
      { id: "verified", label: "Проверенный продавец" },
      { id: "results", label: "Подтвержденные кейсы" },
      { id: "repeat", label: "Постоянные ученики" },
    ],
    listingRefs: [{ listingId: "9", status: "active" }],
  },
  {
    id: "nikita-home",
    displayName: "Никита",
    storefrontName: "Family Homes",
    type: "store_business",
    shortDescription: "Подборка семейных квартир в современных домах с проверкой документов.",
    city: "Санкт-Петербург",
    region: "Северо-Запад",
    memberSinceLabel: "на платформе с 2023",
    memberSinceYear: 2023,
    phone: "+7 (911) 402-32-77",
    avatarLabel: "FH",
    heroGradientClass: "from-cyan-950 via-blue-700 to-indigo-500",
    accentClass: "text-blue-100",
    worldHint: "all",
    responseSpeedLabel: "Обычно отвечает за 19 минут",
    trustBadges: [
      { id: "verified", label: "Проверенный продавец" },
      { id: "docs", label: "Проверка документов" },
      { id: "demand", label: "Высокий интерес покупателей" },
    ],
    listingRefs: [{ listingId: "10", status: "active" }],
  },
  {
    id: "agro-don",
    displayName: "Агрокомплекс Дон",
    storefrontName: "Agro Don Market",
    type: "agriculture_oriented",
    shortDescription: "Фермерская витрина с поставками овощей и готовой продукции для retail и HoReCa.",
    city: "Ростов-на-Дону",
    region: "Южный федеральный округ",
    memberSinceLabel: "на платформе с 2024",
    memberSinceYear: 2024,
    phone: "+7 (863) 205-44-31",
    avatarLabel: "AD",
    heroGradientClass: "from-emerald-950 via-green-800 to-lime-500",
    accentClass: "text-emerald-100",
    worldHint: "agriculture",
    responseSpeedLabel: "Обычно отвечает за 14 минут",
    trustBadges: [
      { id: "verified", label: "Проверенный продавец" },
      { id: "agri", label: "Проверено для агро-опта" },
      { id: "logistics", label: "Стабильная логистика" },
    ],
    listingRefs: [
      { listingId: "agri-1", status: "active" },
      { listingId: "agri-2", status: "active" },
      { listingId: "agri-4", status: "active" },
      { listingId: "agri-9", status: "archived" },
    ],
  },
  {
    id: "agro-tech",
    displayName: "АгроТехТорг",
    storefrontName: "АгроТех Торговый двор",
    type: "agriculture_oriented",
    shortDescription: "Поставка агротехники и навесного оборудования с сервисной проверкой.",
    city: "Воронеж",
    region: "Центральный федеральный округ",
    memberSinceLabel: "на платформе с 2023",
    memberSinceYear: 2023,
    phone: "+7 (473) 440-83-01",
    avatarLabel: "АТ",
    heroGradientClass: "from-emerald-900 via-amber-700 to-orange-500",
    accentClass: "text-amber-100",
    worldHint: "agriculture",
    responseSpeedLabel: "Обычно отвечает за 20 минут",
    trustBadges: [
      { id: "verified", label: "Проверенный продавец" },
      { id: "service", label: "Сервис после продажи" },
      { id: "docs", label: "Документы в комплекте" },
    ],
    listingRefs: [
      { listingId: "agri-5", status: "active" },
      { listingId: "agri-6", status: "active" },
      { listingId: "agri-7", status: "active" },
      { listingId: "agri-8", status: "archived" },
      { listingId: "agri-10", status: "active" },
    ],
  },
  {
    id: "pc-lab",
    displayName: "PC Lab",
    storefrontName: "PC Lab",
    type: "store_business",
    shortDescription: "Собираем игровые и рабочие конфигурации, продаем комплектующие и консоли.",
    city: "Екатеринбург",
    region: "Урал",
    memberSinceLabel: "на платформе с 2022",
    memberSinceYear: 2022,
    phone: "+7 (902) 221-63-19",
    avatarLabel: "PL",
    heroGradientClass: "from-slate-950 via-indigo-800 to-blue-500",
    accentClass: "text-indigo-100",
    worldHint: "electronics",
    responseSpeedLabel: "Обычно отвечает за 7 минут",
    trustBadges: [
      { id: "verified", label: "Проверенный продавец" },
      { id: "fast", label: "Быстрый ответ" },
      { id: "warranty", label: "Гарантия на технику" },
    ],
    listingRefs: [
      { listingId: "tech-4", status: "active" },
      { listingId: "tech-5", status: "active" },
      { listingId: "tech-8", status: "active" },
    ],
  },
];

const defaultContacts: SellerContactLinks = {
  website: "",
  telegram: "",
  vk: "",
};

const marketingToolsMock: SellerMarketingTool[] = [
  {
    id: "competitor-analytics",
    title: "Аналитика конкурентов",
    description: "Сравнивайте цены и динамику похожих объявлений в вашей нише.",
    tier: "pro",
    ctaLabel: "Подключить",
  },
  {
    id: "target-campaigns",
    title: "Таргетированные рассылки",
    description: "Отправляйте предложения сегментам аудитории по интересам и миру объявлений.",
    tier: "business",
    ctaLabel: "Подключить",
  },
  {
    id: "promo-coupons",
    title: "Промо-купоны и скидки",
    description: "Создавайте купоны для новых клиентов и повышайте конверсию в отклик.",
    tier: "pro",
    ctaLabel: "Узнать больше",
  },
  {
    id: "publication-planner",
    title: "Планировщик публикаций",
    description: "Планируйте выход объявлений по расписанию и удерживайте витрину свежей.",
    tier: "business",
    ctaLabel: "Подключить",
  },
  {
    id: "store-short-videos",
    title: "ПлатоШорты и прямые эфиры",
    description: "Привлекайте аудиторию короткими видео и лайв-обзорами товаров.",
    tier: "business",
    ctaLabel: "Узнать больше",
  },
  {
    id: "sponsored-feed",
    title: "Спонсорские позиции в ленте",
    description: "Выводите объявления в приоритетные слоты каталога и тематических потоков.",
    tier: "one_time",
    ctaLabel: "Подключить",
  },
  {
    id: "listing-boost",
    title: "Поднятие объявления",
    description: "Разово поднимайте карточку в выдаче в часы пикового спроса.",
    tier: "one_time",
    ctaLabel: "Подключить",
  },
  {
    id: "super-listing",
    title: "Суперобъявление",
    description: "Выделяйте объявление визуально и получайте больше заметности в каталоге.",
    tier: "business",
    ctaLabel: "Подключить",
  },
];

const sellerPostsMock: SellerPost[] = [
  {
    id: "post-alexey-1",
    sellerId: "alexey-drive",
    type: "news",
    title: "Новые авто с прозрачной историей уже в подборке",
    body: "Добавили 4 проверенных автомобиля с полной сервисной историей и осмотром перед сделкой.",
    createdAt: "2026-04-18T09:00:00.000Z",
    pinned: true,
  },
  {
    id: "post-alexey-2",
    sellerId: "alexey-drive",
    type: "promo",
    title: "Скидка на подбор до конца недели",
    body: "Для новых клиентов действует специальный тариф на подбор автомобиля и сопровождение сделки.",
    createdAt: "2026-04-16T14:30:00.000Z",
  },
  {
    id: "post-marina-1",
    sellerId: "marina-tech",
    type: "product",
    title: "MacBook Air M2 в near-new состоянии",
    body: "Новая партия ноутбуков с диагностикой и чеком проверки перед выдачей покупателю.",
    createdAt: "2026-04-19T11:20:00.000Z",
    imageUrl:
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "post-marina-2",
    sellerId: "marina-tech",
    type: "video",
    title: "Видео-обзор актуальных смартфонов",
    body: "Собрали короткий обзор моделей с лучшим балансом цены и состояния на этой неделе.",
    createdAt: "2026-04-14T18:10:00.000Z",
  },
  {
    id: "post-pclab-1",
    sellerId: "pc-lab",
    type: "promo",
    title: "Комплект сборки ПК со скидкой",
    body: "До пятницы действуют пакетные предложения на игровые сборки и периферию.",
    createdAt: "2026-04-17T12:00:00.000Z",
  },
  {
    id: "post-pclab-2",
    sellerId: "pc-lab",
    type: "news",
    title: "Пополнение по видеокартам",
    body: "Доступны свежие поставки RTX и Radeon с проверкой и гарантийным периодом магазина.",
    createdAt: "2026-04-12T10:00:00.000Z",
  },
  {
    id: "post-agro-don-1",
    sellerId: "agro-don",
    type: "news",
    title: "Новый урожай в каталоге",
    body: "Открыли предзаказ на сезонные позиции для розницы и HoReCa с гибкой логистикой.",
    createdAt: "2026-04-15T08:40:00.000Z",
  },
];

const sellerCouponsMock: MarketingCoupon[] = [
  {
    id: "coupon-alexey-1",
    sellerId: "alexey-drive",
    code: "DRIVE5",
    title: "Скидка на подбор",
    discountType: "percent",
    discountValue: 5,
    scope: "store",
    listingIds: [],
    validUntil: "2026-05-10T23:59:00.000Z",
    status: "active",
    showOnListingCard: true,
  },
  {
    id: "coupon-marina-1",
    sellerId: "marina-tech",
    code: "TECH3000",
    title: "Скидка на ноутбуки",
    discountType: "fixed",
    discountValue: 3000,
    scope: "listings",
    listingIds: ["2"],
    validUntil: "2026-05-22T23:59:00.000Z",
    status: "active",
    showOnListingCard: true,
  },
  {
    id: "coupon-pclab-1",
    sellerId: "pc-lab",
    code: "LAB7",
    title: "Сборка недели",
    discountType: "percent",
    discountValue: 7,
    scope: "listings",
    listingIds: ["tech-4", "tech-8"],
    validUntil: "2026-05-15T23:59:00.000Z",
    status: "active",
    showOnListingCard: true,
  },
  {
    id: "coupon-agro-don-1",
    sellerId: "agro-don",
    code: "HARVEST",
    title: "Сезонная скидка",
    discountType: "percent",
    discountValue: 4,
    scope: "store",
    listingIds: [],
    validUntil: "2026-04-05T23:59:00.000Z",
    status: "expired",
    showOnListingCard: false,
  },
];

const sellerPromotionStateMock: ListingPromotionState[] = [
  {
    sellerId: "alexey-drive",
    listingId: "1",
    lastBoostedAt: "2026-04-20T09:30:00.000Z",
    isSuper: false,
    isSponsored: true,
  },
  {
    sellerId: "marina-tech",
    listingId: "2",
    lastBoostedAt: "2026-04-19T15:20:00.000Z",
    isSuper: true,
    isSponsored: true,
  },
  {
    sellerId: "pc-lab",
    listingId: "tech-4",
    lastBoostedAt: "2026-04-18T13:10:00.000Z",
    isSuper: true,
    isSponsored: false,
  },
  {
    sellerId: "pc-lab",
    listingId: "tech-8",
    lastBoostedAt: "2026-04-21T08:05:00.000Z",
    isSuper: false,
    isSponsored: true,
  },
];

const sellerMarketingCampaignsMock: MarketingCampaign[] = [
  {
    id: "campaign-marina-1",
    sellerId: "marina-tech",
    name: "Весенний апгрейд",
    listingIds: ["2"],
    world: "electronics",
    placements: ["catalog", "thematic"],
    status: "active",
  },
  {
    id: "campaign-pclab-1",
    sellerId: "pc-lab",
    name: "Gaming push",
    listingIds: ["tech-4", "tech-8"],
    world: "electronics",
    placements: ["catalog"],
    status: "active",
  },
  {
    id: "campaign-agro-don-1",
    sellerId: "agro-don",
    name: "Сезонные поставки",
    listingIds: ["agri-1", "agri-2"],
    world: "agriculture",
    placements: ["thematic"],
    status: "paused",
  },
];

const priceAnalyticsSnapshotsMock: PriceAnalyticsSnapshot[] = [
  {
    sellerId: "marina-tech",
    world: "electronics",
    categoryId: "all",
    marketMin: 32000,
    marketMedian: 74000,
    marketMax: 168000,
    sellerAverage: 81200,
    comparables: [
      { id: "cmp-tech-1", title: "iPhone 14 Pro 256GB", price: 73000, relation: "cheaper_than_you" },
      { id: "cmp-tech-2", title: "MacBook Air M2 13", price: 86000, relation: "close_to_you" },
      { id: "cmp-tech-3", title: "Galaxy S24 256GB", price: 69000, relation: "cheaper_than_you" },
      { id: "cmp-tech-4", title: "MacBook Pro 14 M3", price: 149000, relation: "more_expensive_than_you" },
    ],
  },
  {
    sellerId: "alexey-drive",
    world: "all",
    categoryId: "auto",
    marketMin: 490000,
    marketMedian: 1240000,
    marketMax: 2990000,
    sellerAverage: 1320000,
    comparables: [
      { id: "cmp-auto-1", title: "Skoda Octavia 2019", price: 1180000, relation: "cheaper_than_you" },
      { id: "cmp-auto-2", title: "Toyota Camry 2020", price: 1410000, relation: "close_to_you" },
      { id: "cmp-auto-3", title: "Kia K5 2021", price: 1360000, relation: "close_to_you" },
      { id: "cmp-auto-4", title: "BMW 3 2020", price: 2140000, relation: "more_expensive_than_you" },
    ],
  },
  {
    sellerId: "agro-don",
    world: "agriculture",
    categoryId: "all",
    marketMin: 24000,
    marketMedian: 98000,
    marketMax: 460000,
    sellerAverage: 106000,
    comparables: [
      { id: "cmp-agri-1", title: "Овощи оптом", price: 82000, relation: "cheaper_than_you" },
      { id: "cmp-agri-2", title: "Ягоды свежие", price: 118000, relation: "close_to_you" },
      { id: "cmp-agri-3", title: "Сезонный микс", price: 126000, relation: "more_expensive_than_you" },
    ],
  },
];

const heroBoardPlacementsMock: HeroBoardPlacement[] = [
  {
    id: "hero-board-1",
    sellerId: "marina-tech",
    targetType: "listing",
    listingId: "2",
    scope: "global",
    period: "week",
    startsAt: "2026-04-20T00:00:00.000Z",
    endsAt: "2026-04-27T00:00:00.000Z",
    mockPrice: 24000,
    charityPercent: 20,
    isActive: true,
  },
  {
    id: "hero-board-2",
    sellerId: "agro-don",
    targetType: "storefront",
    scope: "world",
    world: "agriculture",
    period: "day",
    startsAt: "2026-04-21T00:00:00.000Z",
    endsAt: "2026-04-22T00:00:00.000Z",
    mockPrice: 6500,
    charityPercent: 20,
    isActive: true,
  },
  {
    id: "hero-board-3",
    sellerId: "pc-lab",
    targetType: "listing",
    listingId: "tech-4",
    scope: "world",
    world: "electronics",
    period: "day",
    startsAt: "2026-04-18T00:00:00.000Z",
    endsAt: "2026-04-19T00:00:00.000Z",
    mockPrice: 7200,
    charityPercent: 20,
    isActive: false,
  },
];

function getSuggestedPlanTier(type: SellerType): SellerPlanTier {
  if (type === "electronics_oriented") {
    return "pro";
  }
  if (type === "agriculture_oriented" || type === "store_business") {
    return "business";
  }
  return "free";
}

function getDefaultMetrics(seed: SellerStorefrontSeed, index: number): SellerDashboardMetrics {
  const activeListingsCount = seed.listingRefs.filter((item) => item.status === "active").length;
  const baselineViews = 900 + activeListingsCount * 230 + index * 65;
  return {
    viewsLast30d: seed.metrics?.viewsLast30d ?? baselineViews,
    messagesLast30d: seed.metrics?.messagesLast30d ?? Math.round(baselineViews / 11),
    activeListingsCount,
    rating: seed.metrics?.rating ?? Number((4.6 + (index % 4) * 0.1).toFixed(1)),
    responseSpeedLabel: seed.metrics?.responseSpeedLabel ?? seed.responseSpeedLabel,
  };
}

export const storefrontSellers: SellerStorefront[] = storefrontSellerSeeds.map((seed, index) => ({
  ...seed,
  planTier: seed.planTier ?? getSuggestedPlanTier(seed.type),
  followersCount: seed.followersCount ?? 120 + index * 17,
  metrics: getDefaultMetrics(seed, index),
  contactLinks: {
    website: seed.contactLinks?.website ?? defaultContacts.website,
    telegram: seed.contactLinks?.telegram ?? defaultContacts.telegram,
    vk: seed.contactLinks?.vk ?? defaultContacts.vk,
  },
}));

const sellerById = new Map(storefrontSellers.map((seller) => [seller.id, seller]));

const sellerIdByListingId = new Map<string, string>();
storefrontSellers.forEach((seller) => {
  seller.listingRefs.forEach((reference) => {
    sellerIdByListingId.set(reference.listingId, seller.id);
  });
});

export function getSellerTypeLabel(type: SellerType) {
  return sellerTypeLabels[type];
}

export function getSellerPlanTierLabel(tier: SellerPlanTier) {
  return sellerPlanTierLabels[tier];
}

export function getMarketingTierLabel(tier: SellerMarketingAccessTier) {
  return marketingTierLabels[tier];
}

export function getStorefrontSellerById(sellerId: string) {
  return sellerById.get(sellerId);
}

export function getStorefrontSellerByListingId(listingId: string) {
  const sellerId = sellerIdByListingId.get(listingId);
  if (!sellerId) {
    return null;
  }
  return sellerById.get(sellerId) ?? null;
}

export function getStorefrontListingsBySellerId(sellerId: string): StorefrontListing[] {
  const seller = getStorefrontSellerById(sellerId);
  if (!seller) {
    return [];
  }

  return seller.listingRefs
    .map((reference) => {
      const listing = unifiedCatalogListings.find((item) => item.id === reference.listingId);
      if (!listing) {
        return null;
      }
      return { ...listing, status: reference.status };
    })
    .filter((listing): listing is StorefrontListing => listing !== null);
}

export function getSellerListings(sellerId: string): SellerDashboardListing[] {
  const seller = getStorefrontSellerById(sellerId);
  if (!seller) {
    return [];
  }

  const listingRefById = new Map(seller.listingRefs.map((reference) => [reference.listingId, reference]));

  return getStorefrontListingsBySellerId(sellerId).map((listing, index) => {
    const createdAtIso = listing.postedAtIso;
    const updatedAtIso = new Date(
      new Date(createdAtIso).getTime() + Math.max(1, (index + 1) * 2) * 24 * 60 * 60 * 1000,
    ).toISOString();
    const views = 70 + index * 38 + seller.id.length * 5;
    const messages = Math.max(1, Math.round(views / 16));

    return {
      ...listing,
      status: listingRefById.get(listing.id)?.status ?? listing.status,
      createdAtIso,
      updatedAtIso,
      views,
      messages,
    };
  });
}

export function getSellerDashboardData(sellerId: string) {
  const seller = getStorefrontSellerById(sellerId);
  if (!seller) {
    return null;
  }

  const listings = getSellerListings(sellerId);
  const activeListingsCount = listings.filter((listing) => listing.status === "active").length;

  return {
    seller: {
      ...seller,
      metrics: {
        ...seller.metrics,
        activeListingsCount,
      },
    },
    listings,
    marketingTools: getSellerMarketingTools(sellerId),
    posts: getSellerPosts(sellerId),
    pinnedPost: getSellerPinnedPost(sellerId),
    coupons: getSellerCoupons(sellerId),
    promotionState: getSellerPromotionState(sellerId),
    campaigns: getSellerMarketingCampaigns(sellerId),
    priceAnalytics: getSellerPriceAnalyticsSnapshots(sellerId),
    marketingOverview: getSellerMarketingOverview(sellerId),
    heroBoardPlacements: getSellerHeroBoardPlacements(sellerId),
  };
}

export function getSellerMarketingTools(sellerId: string) {
  void sellerId;
  return marketingToolsMock;
}

export function getSellerPosts(sellerId: string) {
  return sellerPostsMock
    .filter((post) => post.sellerId === sellerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getSellerPinnedPost(sellerId: string) {
  return getSellerPosts(sellerId).find((post) => post.pinned) ?? null;
}

export function getSellerCoupons(sellerId: string) {
  return sellerCouponsMock
    .filter((coupon) => coupon.sellerId === sellerId)
    .sort((a, b) => new Date(b.validUntil).getTime() - new Date(a.validUntil).getTime());
}

export function getSellerPromotionState(sellerId: string) {
  return sellerPromotionStateMock.filter((state) => state.sellerId === sellerId);
}

export function getSellerMarketingCampaigns(sellerId: string) {
  return sellerMarketingCampaignsMock.filter((campaign) => campaign.sellerId === sellerId);
}

export function getSellerHeroBoardPlacements(sellerId: string) {
  return heroBoardPlacementsMock
    .filter((placement) => placement.sellerId === sellerId)
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
}

export function getCurrentHeroBoardPlacement() {
  return heroBoardPlacementsMock.find((placement) => placement.isActive && placement.scope === "global") ?? null;
}

export function getHeroBoardPlacementForWorld(world: CatalogWorld) {
  return (
    heroBoardPlacementsMock.find(
      (placement) => placement.isActive && placement.scope === "world" && placement.world === world,
    ) ?? null
  );
}

export function getSellerPriceAnalyticsSnapshots(sellerId: string) {
  return priceAnalyticsSnapshotsMock.filter((snapshot) => snapshot.sellerId === sellerId);
}

export function getPriceAnalyticsSnapshot(
  sellerId: string,
  world: CatalogWorld,
  categoryId: string | "all",
) {
  const snapshots = getSellerPriceAnalyticsSnapshots(sellerId);

  return (
    snapshots.find((snapshot) => snapshot.world === world && snapshot.categoryId === categoryId) ??
    snapshots.find((snapshot) => snapshot.world === world && snapshot.categoryId === "all") ??
    snapshots[0] ??
    null
  );
}

export function getListingMarketingBadgeData(listingId: string): ListingMarketingBadgeData {
  const seller = getStorefrontSellerByListingId(listingId);
  if (!seller) {
    return { coupon: null, isSuper: false, isSponsored: false };
  }

  const promotion = getSellerPromotionState(seller.id).find((state) => state.listingId === listingId);
  const coupon =
    getSellerCoupons(seller.id).find((item) => {
      if (item.status !== "active" || !item.showOnListingCard) {
        return false;
      }
      if (item.scope === "store") {
        return true;
      }
      return item.listingIds.includes(listingId);
    }) ?? null;

  return {
    coupon,
    isSuper: Boolean(promotion?.isSuper),
    isSponsored: Boolean(promotion?.isSponsored),
  };
}

export function getSellerMarketingOverview(sellerId: string): SellerMarketingOverview {
  const promotionStates = getSellerPromotionState(sellerId);
  const campaigns = getSellerMarketingCampaigns(sellerId);
  const coupons = getSellerCoupons(sellerId);
  const heroBoardPlacements = getSellerHeroBoardPlacements(sellerId);

  const activeCampaignsCount = campaigns.filter((campaign) => campaign.status === "active").length;
  const activeCoupons = coupons.filter((coupon) => coupon.status === "active");
  const boostedCount = promotionStates.filter((state) => state.lastBoostedAt).length;
  const superCount = promotionStates.filter((state) => state.isSuper).length;
  const sponsoredCount = promotionStates.filter((state) => state.isSponsored).length;
  const activeHeroBoard = heroBoardPlacements.filter((placement) => placement.isActive).length;

  const activeToolTypes = [
    activeCampaignsCount > 0,
    activeCoupons.length > 0,
    boostedCount > 0,
    superCount > 0,
    sponsoredCount > 0,
    activeHeroBoard > 0,
  ].filter(Boolean).length;

  const extraViewsFromPromotion =
    activeCampaignsCount * 240 +
    sponsoredCount * 120 +
    superCount * 160 +
    boostedCount * 75 +
    activeHeroBoard * 360;

  return {
    extraViewsFromPromotion,
    activeCampaignsCount,
    activeToolTypesCount: activeToolTypes,
    activeTools: [
      {
        id: "sponsored",
        label: "Спонсорские позиции",
        status: activeCampaignsCount > 0 ? "активны" : "не запущены",
        menuKey: "sponsored",
      },
      {
        id: "coupons",
        label: "Купоны",
        status:
          activeCoupons.length > 0
            ? `${activeCoupons.length} ${activeCoupons.length === 1 ? "действует" : "действуют"}`
            : "нет активных",
        menuKey: "coupons",
      },
      {
        id: "boost",
        label: "Поднятие",
        status: boostedCount > 0 ? `${boostedCount} недавно` : "не использовалось",
        menuKey: "boosts",
      },
      {
        id: "super",
        label: "Суперобъявление",
        status: superCount > 0 ? `${superCount} активно` : "не активно",
        menuKey: "boosts",
      },
      {
        id: "hero-board",
        label: "Герой доски",
        status: activeHeroBoard > 0 ? `${activeHeroBoard} активен` : "не подключен",
        menuKey: "hero_board",
      },
    ],
  };
}
