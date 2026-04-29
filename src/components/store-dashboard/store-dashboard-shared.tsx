import { LayoutList, Eye, MessageCircle, Star, TrendingUp } from "lucide-react";

import type { HeroBannerPlacement } from "@/lib/hero-board";
import { CatalogWorld, ListingWorld } from "@/lib/listings";
import type {
  MarketingCampaign,
  MarketingCoupon,
  MarketingMenuKey,
  PriceAnalyticsSnapshot,
  SellerDashboardListing,
  SellerListingStatus,
  SellerPost,
  SellerPostType,
  SellerStorefront,
  SellerType,
} from "@/lib/sellers";
import { getSellerPlanTierLabel } from "@/lib/sellers";
import { auctionCreatePolicy, storeFeatureMinTier } from "@/services/entitlements/config";

export type StoreDashboardPageClientProps = {
  seller: SellerStorefront;
  initialListings: SellerDashboardListing[];
  initialPosts: SellerPost[];
  initialCoupons: MarketingCoupon[];
  initialPromotionState: {
    sellerId: string;
    listingId: string;
    lastBoostedAt: string | null;
    isSuper: boolean;
    isSponsored: boolean;
  }[];
  initialCampaigns: MarketingCampaign[];
  initialPriceAnalytics: PriceAnalyticsSnapshot[];
  initialHeroBoardPlacements: HeroBannerPlacement[];
  initialMarketingScreen?: MarketingMenuKey;
  initialSection?: "messages" | "notifications";
};

export type ListingFilter = "all" | "active" | "paused" | "sold";
export type DashboardTourStep = "hero" | "listings" | "marketing" | "content" | "settings";

export type StoreSettingsForm = {
  storefrontName: string;
  sellerType: SellerType;
  shortDescription: string;
  city: string;
  region: string;
  phone: string;
  website: string;
  telegram: string;
  vk: string;
};

export type PostFormState = {
  type: SellerPostType;
  title: string;
  body: string;
  imageUrl: string;
  pinned: boolean;
};

export type PlanFeatureRow = {
  id: string;
  label: string;
  free: boolean;
  pro: boolean;
  business: boolean;
  oneTime?: boolean;
};

export type StoreSubscriptionTierId = "basic" | "pro" | "business";

function isEnabledForPro(minTier: StoreSubscriptionTierId) {
  return minTier === "basic" || minTier === "pro";
}

export function MetricIcon({ id }: { id: string }) {
  const className = "h-4 w-4";
  if (id === "active") {
    return <LayoutList className={className} strokeWidth={1.5} />;
  }
  if (id === "views") {
    return <Eye className={className} strokeWidth={1.5} />;
  }
  if (id === "responses") {
    return <MessageCircle className={className} strokeWidth={1.5} />;
  }
  if (id === "conversion") {
    return <TrendingUp className={className} strokeWidth={1.5} />;
  }
  return <Star className={className} strokeWidth={1.5} />;
}

export const listingFilterLabels: Record<ListingFilter, string> = {
  all: "Все",
  active: "Активные",
  paused: "Пауза",
  sold: "Продано",
};

export const listingStatusLabels: Record<SellerListingStatus, string> = {
  active: "Активно",
  hidden: "Скрыто",
  archived: "Архив",
};

export const worldLabels: Record<ListingWorld, string> = {
  base: "Каталог",
  autos: "Автомобили",
  agriculture: "Сельское хозяйство",
  electronics: "Электроника",
  real_estate: "Недвижимость",
  jobs: "Работа",
  services: "Услуги",
};

export const postTypeLabels: Record<SellerPostType, string> = {
  news: "Новость",
  promo: "Акция",
  product: "Товар",
  video: "Видео",
};

export const onboardingSteps: {
  id: DashboardTourStep;
  sectionId: string;
  title: string;
  description: string;
}[] = [
  {
    id: "hero",
    sectionId: "dashboard-store-hero",
    title: "Сводка магазина",
    description: "Здесь — ключевые метрики, текущий тариф и быстрые действия по storefront.",
  },
  {
    id: "listings",
    sectionId: "dashboard-store-listings",
    title: "Мои объявления",
    description: "Здесь вы управляете статусом, видимостью и выделением своих объявлений.",
  },
  {
    id: "marketing",
    sectionId: "dashboard-store-marketing",
    title: "Маркетинг и продвижение",
    description: "Купоны, аналитика, спонсорские позиции и продвижение витрины.",
  },
  {
    id: "content",
    sectionId: "dashboard-store-content",
    title: "Контент и аудитория",
    description: "Лента магазина, публикации и работа с подписчиками как в mini‑медиа.",
  },
  {
    id: "settings",
    sectionId: "dashboard-store-settings",
    title: "Настройки магазина",
    description: "Основные данные магазина, контакты и соцсети для storefront.",
  },
];

export const tariffRows: PlanFeatureRow[] = [
  { id: "basic-listings", label: "Управление объявлениями", free: true, pro: true, business: true },
  { id: "price-analytics", label: "Аналитика цен", free: false, pro: isEnabledForPro(storeFeatureMinTier.price_analytics), business: true },
  { id: "coupons", label: "Купоны и скидки", free: false, pro: isEnabledForPro(storeFeatureMinTier.coupons), business: true },
  { id: "auction-create", label: auctionCreatePolicy.label, free: false, pro: isEnabledForPro(auctionCreatePolicy.storeMinPlan), business: true },
  { id: "mailings", label: "Таргетированные рассылки", free: false, pro: false, business: true },
  { id: "planner", label: "Планировщик публикаций", free: false, pro: false, business: true },
  { id: "video", label: "Видео и эфиры", free: false, pro: false, business: true },
  { id: "sponsored", label: "Спонсорские позиции", free: false, pro: false, business: true, oneTime: true },
  { id: "boost", label: "Поднятие объявления", free: false, pro: isEnabledForPro(storeFeatureMinTier.boosts), business: true, oneTime: true },
  { id: "super", label: "Суперобъявление", free: false, pro: false, business: true },
];

export const subscriptionTierPresentation: Record<
  StoreSubscriptionTierId,
  {
    title: string;
    subtitle: string;
    listingsLimit: string;
    collectionsLimit: string;
    rankingHint: string;
    analyticsDepth: string;
    marketingDepth: string;
    aiAccess: string;
  }
> = {
  basic: {
    title: "Базовый",
    subtitle: "Для запуска витрины",
    listingsLimit: "До 12 активных объявлений",
    collectionsLimit: "2 витринные подборки",
    rankingHint: "Демо-правила видимости: базовый уровень в подборках",
    analyticsDepth: "Базовые KPI",
    marketingDepth: "Купоны и публикации",
    aiAccess: "Без AI-помощника",
  },
  pro: {
    title: "Про",
    subtitle: "Для роста магазина",
    listingsLimit: "До 40 активных объявлений",
    collectionsLimit: "3 витринные подборки",
    rankingHint: "Демо-правила видимости: расширенный уровень в подборках",
    analyticsDepth: "KPI + источники трафика",
    marketingDepth: "Закрепления и кампании",
    aiAccess: "Без AI-помощника",
  },
  business: {
    title: "Бизнес",
    subtitle: "Для full mini-store ecosystem",
    listingsLimit: "До 120 активных объявлений",
    collectionsLimit: "Все подборки без лимита",
    rankingHint: "Демо-правила видимости: максимальный уровень в подборках",
    analyticsDepth: "Полная аналитика + growth-рекомендации",
    marketingDepth: "Баннеры, кампании и расширенный промо-слой",
    aiAccess: "AI-помощник при создании объявлений",
  },
};

export const growthToolAccessRows: { id: string; label: string; minTier: StoreSubscriptionTierId }[] = [
  { id: "coupon", label: "Акции и купоны", minTier: storeFeatureMinTier.coupons },
  { id: "pin", label: "Закреплённые товары", minTier: "pro" },
  { id: "campaign", label: "Кампании продвижения", minTier: "pro" },
  { id: "banner", label: "Баннер витрины", minTier: "business" },
];

export function stableSellerHash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = Math.imul(31, h) + input.charCodeAt(i);
  }
  return Math.abs(h);
}

export function mockTrafficSourcesForSeller(sellerId: string) {
  const h = stableSellerHash(sellerId);
  const weights = [
    34 + (h % 22),
    28 + ((h >> 4) % 16),
    20 + ((h >> 9) % 14),
    14 + ((h >> 14) % 12),
  ];
  const sum = weights.reduce((a, b) => a + b, 0);
  const pct = weights.map((w) => Math.round((w / sum) * 100));
  const drift = 100 - pct.reduce((a, b) => a + b, 0);
  pct[0] += drift;
  return [
    { id: "search", label: "Поиск и каталог", pct: pct[0] },
    { id: "store", label: "Витрина / профиль", pct: pct[1] },
    { id: "ads", label: "Реклама на площадке", pct: pct[2] },
    { id: "direct", label: "Прямые и соцсети", pct: pct[3] },
  ];
}

export function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function formatPostDate(isoDate: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export function toCreateListingWorld(world: ListingWorld): CatalogWorld {
  if (world === "autos") {
    return "autos";
  }
  if (world === "agriculture") {
    return "agriculture";
  }
  if (world === "electronics") {
    return "electronics";
  }
  if (world === "real_estate") {
    return "real_estate";
  }
  if (world === "jobs") {
    return "jobs";
  }
  if (world === "services") {
    return "services";
  }
  return "all";
}

export function getNextTier(tier: StoreSubscriptionTierId) {
  if (tier === "basic") {
    return "pro";
  }
  if (tier === "pro") {
    return "business";
  }
  return null;
}

export function getStoreTierLabel(tier: StoreSubscriptionTierId) {
  if (tier === "basic") {
    return "Базовый";
  }
  return getSellerPlanTierLabel(tier);
}
