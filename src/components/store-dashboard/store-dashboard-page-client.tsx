"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleHelp,
  Eye,
  LayoutList,
  Lock,
  MessageCircle,
  Star,
  TrendingUp,
  X,
} from "lucide-react";

import { StoreMarketingWorkspace } from "@/components/store-dashboard/store-marketing-workspace";
import { HeroBannerPlacement } from "@/lib/hero-board";
import { CatalogWorld, ListingWorld } from "@/lib/listings";
import {
  MarketingCampaign,
  MarketingCoupon,
  MarketingMenuKey,
  PriceAnalyticsSnapshot,
  SellerDashboardListing,
  SellerListingStatus,
  SellerPlanTier,
  SellerPost,
  SellerPostType,
  SellerStorefront,
  SellerType,
  getSellerPlanTierLabel,
  getSellerTypeLabel,
} from "@/lib/sellers";

type StoreDashboardPageClientProps = {
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
  placementFlowFromSponsorBoard?: boolean;
};

type ListingFilter = "all" | "active" | "inactive";
type DashboardTourStep = "hero" | "listings" | "marketing" | "content" | "settings";

type StoreSettingsForm = {
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

type PostFormState = {
  type: SellerPostType;
  title: string;
  body: string;
  imageUrl: string;
  pinned: boolean;
};

type PlanFeatureRow = {
  id: string;
  label: string;
  free: boolean;
  pro: boolean;
  business: boolean;
  oneTime?: boolean;
};

type StoreSubscriptionTierId = "free" | "pro" | "business";

function MetricIcon({ id }: { id: string }) {
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

const listingFilterLabels: Record<ListingFilter, string> = {
  all: "Все",
  active: "Активные",
  inactive: "Скрытые / Архив",
};

const listingStatusLabels: Record<SellerListingStatus, string> = {
  active: "Активно",
  hidden: "Скрыто",
  archived: "Архив",
};

const worldLabels: Record<ListingWorld, string> = {
  base: "Каталог",
  autos: "Автомобили",
  agriculture: "Сельское хозяйство",
  electronics: "Электроника",
  real_estate: "Недвижимость",
  jobs: "Работа",
  services: "Услуги",
};

const postTypeLabels: Record<SellerPostType, string> = {
  news: "Новость",
  promo: "Акция",
  product: "Товар",
  video: "Видео",
};

const onboardingSteps: {
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

const tariffRows: PlanFeatureRow[] = [
  { id: "basic-listings", label: "Управление объявлениями", free: true, pro: true, business: true },
  { id: "price-analytics", label: "Аналитика цен", free: false, pro: true, business: true },
  { id: "coupons", label: "Купоны и скидки", free: false, pro: true, business: true },
  { id: "mailings", label: "Таргетированные рассылки", free: false, pro: false, business: true },
  { id: "planner", label: "Планировщик публикаций", free: false, pro: false, business: true },
  { id: "video", label: "Видео и эфиры", free: false, pro: false, business: true },
  { id: "sponsored", label: "Спонсорские позиции", free: false, pro: false, business: true, oneTime: true },
  { id: "boost", label: "Поднятие объявления", free: false, pro: true, business: true, oneTime: true },
  { id: "super", label: "Суперобъявление", free: false, pro: false, business: true },
];

const subscriptionTierPresentation: Record<
  StoreSubscriptionTierId,
  {
    title: string;
    subtitle: string;
    listingsLimit: string;
    collectionsLimit: string;
    rankingHint: string;
    analyticsDepth: string;
    marketingDepth: string;
  }
> = {
  free: {
    title: "Базовый",
    subtitle: "Для запуска витрины",
    listingsLimit: "До 12 активных объявлений",
    collectionsLimit: "2 витринные подборки",
    rankingHint: "Демо-правила видимости: базовый уровень в подборках",
    analyticsDepth: "Базовые KPI",
    marketingDepth: "Купоны и публикации",
  },
  pro: {
    title: "Про",
    subtitle: "Для роста магазина",
    listingsLimit: "До 40 активных объявлений",
    collectionsLimit: "3 витринные подборки",
    rankingHint: "Демо-правила видимости: расширенный уровень в подборках",
    analyticsDepth: "KPI + источники трафика",
    marketingDepth: "Закрепления и кампании",
  },
  business: {
    title: "Бизнес",
    subtitle: "Для full mini-store ecosystem",
    listingsLimit: "До 120 активных объявлений",
    collectionsLimit: "Все подборки без лимита",
    rankingHint: "Демо-правила видимости: максимальный уровень в подборках",
    analyticsDepth: "Полная аналитика + growth-рекомендации",
    marketingDepth: "Баннеры, кампании и расширенный промо-слой",
  },
};

const growthToolAccessRows: { id: string; label: string; minTier: StoreSubscriptionTierId }[] = [
  { id: "coupon", label: "Акции и купоны", minTier: "free" },
  { id: "pin", label: "Закреплённые товары", minTier: "pro" },
  { id: "campaign", label: "Кампании продвижения", minTier: "pro" },
  { id: "banner", label: "Баннер витрины", minTier: "business" },
];

function stableSellerHash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = Math.imul(31, h) + input.charCodeAt(i);
  }
  return Math.abs(h);
}

function mockTrafficSourcesForSeller(sellerId: string) {
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

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

function formatPostDate(isoDate: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

function toCreateListingWorld(world: ListingWorld): CatalogWorld {
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

function getNextTier(tier: StoreSubscriptionTierId) {
  if (tier === "free") {
    return "pro";
  }
  if (tier === "pro") {
    return "business";
  }
  return null;
}

export function StoreDashboardPageClient({
  seller,
  initialListings,
  initialPosts,
  initialCoupons,
  initialPromotionState,
  initialCampaigns,
  initialPriceAnalytics,
  initialHeroBoardPlacements,
  initialMarketingScreen,
  placementFlowFromSponsorBoard,
}: StoreDashboardPageClientProps) {
  const [listings, setListings] = useState<SellerDashboardListing[]>(initialListings);
  const [posts, setPosts] = useState<SellerPost[]>(initialPosts);
  const [filter, setFilter] = useState<ListingFilter>("all");
  const [message, setMessage] = useState<string | null>(null);
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const [selectedPlanTier, setSelectedPlanTier] = useState<SellerPlanTier>(seller.planTier);
  const [isTourOpen, setIsTourOpen] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    const hasSeenTour = window.sessionStorage.getItem(`store-dashboard-tour-${seller.id}`);
    return !hasSeenTour;
  });
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [isPostFormVisible, setIsPostFormVisible] = useState(false);
  const [postForm, setPostForm] = useState<PostFormState>({
    type: "news",
    title: "",
    body: "",
    imageUrl: "",
    pinned: false,
  });
  const [settings, setSettings] = useState<StoreSettingsForm>({
    storefrontName: seller.storefrontName,
    sellerType: seller.type,
    shortDescription: seller.shortDescription,
    city: seller.city,
    region: seller.region,
    phone: seller.phone,
    website: seller.contactLinks.website,
    telegram: seller.contactLinks.telegram,
    vk: seller.contactLinks.vk,
  });

  const activeTourStep = onboardingSteps[tourStepIndex] ?? onboardingSteps[0];
  const currentSubscriptionTier = selectedPlanTier as StoreSubscriptionTierId;
  const currentTierPresentation = subscriptionTierPresentation[currentSubscriptionTier];
  const nextSubscriptionTier = getNextTier(currentSubscriptionTier);
  const effectiveSeller = useMemo(
    () => ({ ...seller, planTier: selectedPlanTier }),
    [seller, selectedPlanTier],
  );

  const counts = useMemo(
    () => ({
      all: listings.length,
      active: listings.filter((listing) => listing.status === "active").length,
      inactive: listings.filter((listing) => listing.status === "hidden" || listing.status === "archived")
        .length,
    }),
    [listings],
  );

  const visibleListings = useMemo(
    () =>
      listings.filter((listing) => {
        if (filter === "active") {
          return listing.status === "active";
        }
        if (filter === "inactive") {
          return listing.status === "hidden" || listing.status === "archived";
        }
        return true;
      }),
    [filter, listings],
  );

  const conversionEstimatePercent = useMemo(() => {
    const ratio = seller.metrics.messagesLast30d / Math.max(1, seller.metrics.viewsLast30d);
    return Math.min(100, ratio * 100);
  }, [seller.metrics.messagesLast30d, seller.metrics.viewsLast30d]);

  const heroMetrics = useMemo(
    () => [
      {
        id: "active",
        label: "Активные объявления",
        value: String(counts.active),
      },
      {
        id: "views",
        label: "Просмотры за 30 дней",
        value: seller.metrics.viewsLast30d.toLocaleString("ru-RU"),
      },
      {
        id: "responses",
        label: "Отклики за 30 дней",
        value: seller.metrics.messagesLast30d.toLocaleString("ru-RU"),
      },
      {
        id: "conversion",
        label: "Конверсия в отклик (оценка)",
        value: `${conversionEstimatePercent.toFixed(1)}%`,
      },
    ],
    [counts.active, conversionEstimatePercent, seller.metrics.messagesLast30d, seller.metrics.viewsLast30d],
  );

  const mockTrafficSources = useMemo(() => mockTrafficSourcesForSeller(seller.id), [seller.id]);
  const loyaltyStats = useMemo(() => {
    const seed = stableSellerHash(`${seller.id}-loyalty`);
    const followersTrend = seed % 2 === 0 ? "up" : "down";
    const favoritesTrend = (seed >> 1) % 2 === 0 ? "up" : "down";
    return {
      followers: seller.followersCount,
      favorites: Math.max(18, Math.round(seller.followersCount * (0.48 + (seed % 7) * 0.01))),
      followersTrendLabel: followersTrend === "up" ? `↑ +${2 + (seed % 5)}%` : `↓ -${1 + (seed % 4)}%`,
      favoritesTrendLabel: favoritesTrend === "up" ? `↑ +${1 + ((seed >> 2) % 5)}%` : `↓ -${1 + ((seed >> 3) % 3)}%`,
      followersTrendUp: followersTrend === "up",
      favoritesTrendUp: favoritesTrend === "up",
    };
  }, [seller.followersCount, seller.id]);

  const availableGrowthTools = useMemo(
    () =>
      growthToolAccessRows.filter((tool) =>
        currentSubscriptionTier === "business"
          ? true
          : currentSubscriptionTier === "pro"
            ? tool.minTier !== "business"
            : tool.minTier === "free",
      ),
    [currentSubscriptionTier],
  );
  const lockedGrowthTools = useMemo(
    () =>
      growthToolAccessRows.filter((tool) =>
        currentSubscriptionTier === "business"
          ? false
          : currentSubscriptionTier === "pro"
            ? tool.minTier === "business"
            : tool.minTier !== "free",
      ),
    [currentSubscriptionTier],
  );

  const topPerformingListings = useMemo(
    () =>
      [...listings]
        .filter((listing) => listing.status === "active")
        .sort((a, b) => b.views + b.messages * 3 - (a.views + a.messages * 3))
        .slice(0, 3),
    [listings],
  );

  const risingListings = useMemo(() => {
    const h = stableSellerHash(`${seller.id}-rising`);
    return [...listings]
      .filter((listing) => listing.status === "active")
      .sort(
        (a, b) => b.messages / Math.max(1, b.views) - a.messages / Math.max(1, a.views),
      )
      .slice(0, 3)
      .map((listing, index) => ({
        listing,
        viewsDeltaLabel: `+${8 + ((h >> index) % 11)}% просмотров к прошлой неделе (mock)`,
      }));
  }, [listings, seller.id]);

  const improvementNotes = useMemo(() => {
    const notes: string[] = [];
    if (counts.inactive > 0) {
      notes.push(
        `В каталоге скрыто или в архиве: ${counts.inactive} — верните сильные позиции, чтобы витрина не выглядела пустой.`,
      );
    }
    const lowViews = listings.filter((listing) => listing.status === "active" && listing.views < 90);
    if (lowViews.length) {
      notes.push(
        `${lowViews.length} активных карточек с низкими просмотрами: обновите обложку и первую строку описания.`,
      );
    }
    const cold = listings.filter((listing) => listing.status === "active" && listing.messages < 2);
    if (cold.length) {
      notes.push(
        `${cold.length} объявлений почти без откликов — сравните цену с медианой рынка в разделе маркетинга.`,
      );
    }
    if (notes.length === 0) {
      notes.push("Добавьте публикацию в ленту магазина — подписчики чаще возвращаются к живым обновлениям.");
    }
    return notes.slice(0, 4);
  }, [counts.inactive, listings]);

  const assistantTips = useMemo(() => {
    const tips: { title: string; body: string }[] = [
      {
        title: "Мини‑магазин внутри маркетплейса",
        body: "Держите в первом экране «Лучшее», новинки и выгодный сегмент — так витрина воспринимается как curated store, а не просто список.",
      },
      {
        title: "Разведите Follow и «В любимых»",
        body: "Follow продвигает обновления и акции, а «любимые магазины» усиливают возврат и персональные рекомендации покупателей.",
      },
    ];
    if (counts.active < 5) {
      tips.push({
        title: "Расширьте активный каталог",
        body: "На демо-данных магазины с 6+ активными карточками получают больше повторных заходов из поиска.",
      });
    }
    if (initialCoupons.filter((coupon) => coupon.status === "active").length === 0) {
      tips.push({
        title: "Запустите короткую акцию",
        body: "Даже купон на 48 часов заметно повышает кликабельность в блоке промо на витрине.",
      });
    }
    tips.push({
      title: "Закрепите одного лидера",
      body: "Суперобъявление + баннер купона в шапке витрины дают ощущение «главного товара недели».",
    });
    if (currentSubscriptionTier !== "business") {
      tips.push({
        title: "Используйте следующий уровень тарифа",
        body: `На уровне ${nextSubscriptionTier ? subscriptionTierPresentation[nextSubscriptionTier].title : "выше"} доступно больше growth-инструментов и глубина аналитики.`,
      });
    }
    tips.push({
      title: "Активируйте оффер для подписчиков",
      body: "Короткая акция для аудитории follow повышает частоту повторных визитов в витрину даже на mock-данных.",
    });
    tips.push({
      title: "Следите за источниками",
      body: "Если трафик из витрины проседает, обновите короткое описание магазина и контакты — это первый экран покупателя.",
    });
    return tips.slice(0, 5);
  }, [counts.active, currentSubscriptionTier, initialCoupons, nextSubscriptionTier]);

  useEffect(() => {
    if (!isTourOpen) {
      return;
    }
    const target = document.getElementById(activeTourStep.sectionId);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeTourStep.sectionId, isTourOpen]);

  function showMockMessage(nextMessage: string) {
    setMessage(nextMessage);
    window.setTimeout(() => setMessage(null), 2800);
  }

  function toggleListingVisibility(listingId: string) {
    setListings((current) =>
      current.map((listing) =>
        listing.id === listingId
          ? { ...listing, status: listing.status === "active" ? "hidden" : "active" }
          : listing,
      ),
    );
    showMockMessage("Статус объявления обновлён (mock).");
  }

  function handleSettingsSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    showMockMessage("Сохранено (mock).");
  }

  function handlePostCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!postForm.title.trim() || !postForm.body.trim()) {
      showMockMessage("Заполните заголовок и текст публикации.");
      return;
    }

    const createdPost: SellerPost = {
      id: `local-post-${Date.now()}`,
      sellerId: seller.id,
      type: postForm.type,
      title: postForm.title.trim(),
      body: postForm.body.trim(),
      createdAt: new Date().toISOString(),
      imageUrl: postForm.imageUrl.trim() || undefined,
      pinned: postForm.pinned,
    };

    setPosts((current) => {
      const normalized = postForm.pinned ? current.map((post) => ({ ...post, pinned: false })) : current;
      return [createdPost, ...normalized];
    });
    setPostForm({
      type: "news",
      title: "",
      body: "",
      imageUrl: "",
      pinned: false,
    });
    setIsPostFormVisible(false);
    showMockMessage("Публикация создана (mock).");
  }

  function closeTour() {
    setIsTourOpen(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(`store-dashboard-tour-${seller.id}`, "1");
    }
  }

  function completeTour() {
    closeTour();
    setTourStepIndex(0);
    const target = document.getElementById("dashboard-store-hero");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function launchTour() {
    setTourStepIndex(0);
    setIsTourOpen(true);
  }

  function getSectionClassName(baseClassName: string, sectionId: string) {
    const isActive = isTourOpen && activeTourStep.sectionId === sectionId;
    return `${baseClassName} ${isActive ? "ring-2 ring-sky-300 ring-offset-2" : ""}`;
  }

  const createHref = `/create-listing?world=${seller.worldHint}&sellerId=${seller.id}`;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={launchTour}
          className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <CircleHelp className="mr-1.5 h-4 w-4" strokeWidth={1.5} />
          Как это работает
        </button>
      </div>

      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      <section
        id="dashboard-store-hero"
        className={getSectionClassName("rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5", "dashboard-store-hero")}
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-3">
            <p className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
              Store Dashboard
            </p>
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                {seller.avatarLabel}
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  {seller.storefrontName}
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  {getSellerTypeLabel(seller.type)} · Тариф: {getSellerPlanTierLabel(selectedPlanTier)}
                </p>
              </div>
            </div>
            <p className="max-w-2xl text-sm text-slate-600 sm:text-base">{seller.shortDescription}</p>
            <div className="flex flex-wrap gap-2">
              {seller.trustBadges.map((badge) => (
                <span
                  key={badge.id}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {badge.label}
                </span>
              ))}
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                {seller.metrics.responseSpeedLabel}
              </span>
            </div>
          </div>

          <aside className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm font-semibold text-slate-900">Быстрые действия</p>
            <div className="space-y-2">
              <Link
                href={createHref}
                className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Создать объявление
              </Link>
              <Link
                href={`/sellers/${seller.id}`}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Посмотреть магазин (витрина)
              </Link>
              <button
                type="button"
                onClick={() => {
                  const target = document.getElementById("dashboard-store-subscription");
                  target?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Открыть подписку
              </button>
            </div>
            <p className="text-xs text-slate-500">
              На витрине покупатель может нажать «Следить за магазином» или добавить магазин в любимые.
            </p>
            <p className="text-xs text-slate-500">Новые публикации будут попадать подписчикам в ленту обновлений.</p>
          </aside>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {heroMetrics.map((metric) => (
            <article
              key={metric.id}
              className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/90 p-4 shadow-sm"
            >
              <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600">
                  <MetricIcon id={metric.id} />
                </span>
                {metric.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{metric.value}</p>
              {metric.id === "conversion" ? (
                <p className="mt-1 text-[11px] leading-snug text-slate-500">
                  Демо-метрика: отношение откликов к просмотрам за 30 дней без учёта воронки по объявлениям.
                </p>
              ) : null}
            </article>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <p className="text-sm text-slate-600">
            Текущий тариф: <span className="font-semibold text-slate-900">{getSellerPlanTierLabel(selectedPlanTier)}</span>.{" "}
            Полная расшифровка и сравнение — в секции «Подписка магазина» ниже.
          </p>
        </div>
      </section>

      <section
        id="dashboard-store-subscription"
        className="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Подписка магазина</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              UI-слой тарифов: влияет на объём витрины, глубину аналитики и доступность growth-инструментов.
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            Текущий уровень: {currentTierPresentation.title}
          </span>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {(["free", "pro", "business"] as StoreSubscriptionTierId[]).map((tier) => {
            const tierData = subscriptionTierPresentation[tier];
            const isCurrent = currentSubscriptionTier === tier;
            return (
              <article
                key={tier}
                className={`rounded-2xl border p-4 transition ${
                  isCurrent
                    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                    : "border-slate-200 bg-slate-50/70 text-slate-700"
                }`}
              >
                <p className={`text-xs font-semibold uppercase tracking-wide ${isCurrent ? "text-white/70" : "text-slate-500"}`}>
                  {tierData.subtitle}
                </p>
                <p className="mt-1 text-lg font-semibold tracking-tight">{tierData.title}</p>
                <ul className={`mt-3 space-y-1.5 text-xs ${isCurrent ? "text-white/85" : "text-slate-600"}`}>
                  <li>{tierData.listingsLimit}</li>
                  <li>{tierData.collectionsLimit}</li>
                  <li>{tierData.analyticsDepth}</li>
                  <li>{tierData.marketingDepth}</li>
                </ul>
              </article>
            );
          })}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Что даёт текущий тариф</h3>
            <p className="mt-1 text-xs text-slate-600">{currentTierPresentation.rankingHint}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
              <li>• {currentTierPresentation.listingsLimit}</li>
              <li>• {currentTierPresentation.collectionsLimit}</li>
              <li>• {currentTierPresentation.analyticsDepth}</li>
              <li>• {currentTierPresentation.marketingDepth}</li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["free", "pro", "business"] as SellerPlanTier[]).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedPlanTier(tier)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    selectedPlanTier === tier
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {getSellerPlanTierLabel(tier)}
                </button>
              ))}
            </div>
          </article>
          <article className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Growth-инструменты</h3>
            <p className="mt-1 text-xs text-slate-500">High-level доступ; детальные настройки в маркетинг-разделе.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableGrowthTools.map((tool) => (
                <span
                  key={tool.id}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {tool.label}
                </span>
              ))}
              {lockedGrowthTools.map((tool) => (
                <span
                  key={tool.id}
                  className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-400"
                >
                  {tool.label} · доступно на{" "}
                  {tool.minTier === "pro" ? subscriptionTierPresentation.pro.title : subscriptionTierPresentation.business.title}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsTariffModalOpen(true)}
              className="mt-3 inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Открыть сравнение тарифов
            </button>
          </article>
        </div>
      </section>

      <section
        id="dashboard-store-insights"
        className="space-y-5 rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Аналитика витрины (демо)</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Источники трафика, сильные объявления и подсказки ассистента — всё на mock‑данных, без подключения
              стриминга событий.
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Демо-слой
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Источники трафика</h3>
            <p className="mt-1 text-xs text-slate-500">Оценка за 30 дней, стабильная для демо по id магазина.</p>
            <ul className="mt-4 space-y-3">
              {mockTrafficSources.map((row) => (
                <li key={row.id}>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
                    <span>{row.label}</span>
                    <span className="font-semibold tabular-nums text-slate-900">{row.pct}%</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-800/85"
                      style={{ width: `${Math.min(100, row.pct)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Подписки и лояльность</h3>
            <p className="mt-1 text-xs text-slate-500">Отдельный слой метрик для аудитории магазина.</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
                <p className="text-xs text-slate-500">Подписчики (follow)</p>
                <p className="mt-1 flex items-center justify-between gap-2">
                  <span className="font-semibold tabular-nums text-slate-900">
                    {loyaltyStats.followers.toLocaleString("ru-RU")}
                  </span>
                  <span className={loyaltyStats.followersTrendUp ? "text-emerald-700" : "text-slate-500"}>
                    {loyaltyStats.followersTrendLabel}
                  </span>
                </p>
              </li>
              <li className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
                <p className="text-xs text-slate-500">Магазин в любимых</p>
                <p className="mt-1 flex items-center justify-between gap-2">
                  <span className="font-semibold tabular-nums text-slate-900">
                    {loyaltyStats.favorites.toLocaleString("ru-RU")}
                  </span>
                  <span className={loyaltyStats.favoritesTrendUp ? "text-emerald-700" : "text-slate-500"}>
                    {loyaltyStats.favoritesTrendLabel}
                  </span>
                </p>
              </li>
            </ul>
            <p className="mt-2 text-xs text-slate-500">
              Follow и «в любимых» — разные сущности: новости/акции vs loyalty-сигнал и быстрый доступ.
            </p>
          </article>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Лучшие объявления</h3>
            <p className="mt-1 text-xs text-slate-500">По сумме просмотров и откликов в демо-кабинете.</p>
            <ul className="mt-3 space-y-2">
              {topPerformingListings.length ? (
                topPerformingListings.map((listing) => (
                  <li
                    key={listing.id}
                    className="flex items-start justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs"
                  >
                    <p className="min-w-0 font-medium leading-snug text-slate-900">{listing.title}</p>
                    <span className="shrink-0 tabular-nums text-slate-600">
                      {listing.views} просм. · {listing.messages} откл.
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500">Нет активных объявлений для рейтинга.</li>
              )}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Что растёт</h3>
            <p className="mt-1 text-xs text-slate-500">Высокая конверсия просмотр → отклик и динамика недели (mock).</p>
            <ul className="mt-3 space-y-2">
              {risingListings.length ? (
                risingListings.map(({ listing, viewsDeltaLabel }) => (
                  <li
                    key={listing.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-700"
                  >
                    <p className="font-medium text-slate-900">{listing.title}</p>
                    <p className="mt-1 text-[11px] font-medium text-slate-700">{viewsDeltaLabel}</p>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500">Нет данных о росте для активных объявлений.</li>
              )}
            </ul>
          </article>
        </div>

        <article className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Рекомендации</h3>
          <p className="mt-1 text-xs text-slate-600">
            Единый блок ассистента: контент, loyalty и возможности текущего тарифа.
          </p>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <section className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Контент</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-700">
                {improvementNotes.slice(0, 2).map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
            <section className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Loyalty</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-700">
                <li>Продвигайте follow в публикациях и карточках товаров.</li>
                <li>Добавьте micro-оффер для «любимых магазинов» в акциях.</li>
                <li>Держите частоту постов стабильной для возврата аудитории.</li>
              </ul>
            </section>
            <section className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Тариф</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-700">
                <li>Уровень: {currentTierPresentation.title}.</li>
                <li>Аналитика: {currentTierPresentation.analyticsDepth}.</li>
                <li>Маркетинг: {currentTierPresentation.marketingDepth}.</li>
              </ul>
            </section>
          </div>
          <ul className="mt-3 space-y-2">
            {assistantTips.slice(0, 3).map((tip) => (
              <li key={tip.title} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                <p className="text-xs font-semibold text-slate-900">{tip.title}</p>
                <p className="mt-1 text-xs text-slate-600">{tip.body}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section
        id="dashboard-store-listings"
        className={getSectionClassName("space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5", "dashboard-store-listings")}
      >
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Мои объявления</h2>
          <p className="text-sm text-slate-600">
            Здесь вы управляете статусом, видимостью и выделением своих объявлений.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(listingFilterLabels) as ListingFilter[]).map((filterItem) => (
            <button
              key={filterItem}
              type="button"
              onClick={() => setFilter(filterItem)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                filter === filterItem
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {listingFilterLabels[filterItem]} · {counts[filterItem]}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {visibleListings.map((listing) => (
            <article
              key={listing.id}
              className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 md:grid-cols-[minmax(0,1fr)_auto_auto]"
            >
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-semibold text-slate-900">{listing.title}</p>
                <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5">
                    {worldLabels[listing.world]}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 ${
                      listing.status === "active"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {listingStatusLabels[listing.status]}
                  </span>
                  <span>Создано: {formatDate(listing.createdAtIso)}</span>
                  <span>Обновлено: {formatDate(listing.updatedAtIso)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 md:w-40 md:grid-cols-1">
                <p className="rounded-lg border border-slate-200 bg-white px-2 py-1">Просмотры: {listing.views}</p>
                <p className="rounded-lg border border-slate-200 bg-white px-2 py-1">Отклики: {listing.messages}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:w-72 md:justify-end">
                <Link
                  href={`/create-listing?world=${toCreateListingWorld(listing.world)}&sellerId=${seller.id}&edit=${listing.id}`}
                  className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Редактировать
                </Link>
                <button
                  type="button"
                  onClick={() => toggleListingVisibility(listing.id)}
                  className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {listing.status === "active" ? "Скрыть" : "Показать"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    showMockMessage("Поднятие объявления доступно в Бизнес-тарифе или как разовая покупка.")
                  }
                  className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-700"
                >
                  Поднять
                </button>
                <span className="text-[11px] text-slate-500">
                  Поднятие временно перемещает объявление выше в списке (mock).
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div
        id="dashboard-store-marketing"
        className={getSectionClassName(
          "relative rounded-2xl pl-3 before:pointer-events-none before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-indigo-400 before:to-violet-500 before:opacity-90",
          "dashboard-store-marketing",
        )}
      >
        <StoreMarketingWorkspace
          seller={effectiveSeller}
          listings={listings}
          posts={posts}
          initialCoupons={initialCoupons}
          initialPromotionState={initialPromotionState}
          initialCampaigns={initialCampaigns}
          initialPriceAnalytics={initialPriceAnalytics}
          initialHeroBoardPlacements={initialHeroBoardPlacements}
          initialScreen={initialMarketingScreen}
          placementFlowFromSponsorBoard={placementFlowFromSponsorBoard}
          onNotify={showMockMessage}
          onOpenTariffs={() => showMockMessage("Откройте раздел «Подписка магазина», чтобы посмотреть тарифы.")}
        />
      </div>

      <section className="grid gap-3 lg:grid-cols-2">
        <article
          id="dashboard-store-content"
          className={getSectionClassName("rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5", "dashboard-store-content")}
        >
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Контент и аудитория</h2>
          <div className="mt-3 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">Публикации магазина</p>
                <button
                  type="button"
                  onClick={() => setIsPostFormVisible((current) => !current)}
                  className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {isPostFormVisible ? "Скрыть форму" : "Новый пост"}
                </button>
              </div>
              <p className="mt-1 text-sm text-slate-600">Лента, сторис и видео форматы расширяются в следующих итерациях.</p>

              {isPostFormVisible ? (
                <form onSubmit={handlePostCreate} className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                  <label className="block space-y-1 text-xs">
                    <span className="text-slate-600">Тип публикации</span>
                    <select
                      value={postForm.type}
                      onChange={(event) =>
                        setPostForm((prev) => ({ ...prev, type: event.target.value as SellerPostType }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                    >
                      <option value="news">{postTypeLabels.news}</option>
                      <option value="promo">{postTypeLabels.promo}</option>
                      <option value="product">{postTypeLabels.product}</option>
                      <option value="video">{postTypeLabels.video}</option>
                    </select>
                  </label>

                  <label className="block space-y-1 text-xs">
                    <span className="text-slate-600">Заголовок</span>
                    <input
                      value={postForm.title}
                      onChange={(event) => setPostForm((prev) => ({ ...prev, title: event.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                    />
                  </label>

                  <label className="block space-y-1 text-xs">
                    <span className="text-slate-600">Текст</span>
                    <textarea
                      rows={3}
                      value={postForm.body}
                      onChange={(event) => setPostForm((prev) => ({ ...prev, body: event.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                    />
                  </label>

                  <label className="block space-y-1 text-xs">
                    <span className="text-slate-600">Image URL</span>
                    <input
                      value={postForm.imageUrl}
                      onChange={(event) => setPostForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                    />
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={postForm.pinned}
                      onChange={(event) => setPostForm((prev) => ({ ...prev, pinned: event.target.checked }))}
                    />
                    Закрепить вверху
                  </label>

                  <button
                    type="submit"
                    className="inline-flex h-8 items-center rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-700"
                  >
                    Опубликовать
                  </button>
                </form>
              ) : null}

              <div className="mt-3 space-y-2">
                {posts.slice(0, 4).map((post) => (
                  <article key={post.id} className="rounded-lg border border-slate-200 bg-white p-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {postTypeLabels[post.type]}
                      </span>
                      {post.pinned ? (
                        <span className="rounded-full border border-slate-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                          Закреплено
                        </span>
                      ) : null}
                      <span className="text-[11px] text-slate-500">{formatPostDate(post.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{post.title}</p>
                    <p className="line-clamp-2 text-sm text-slate-600">{post.body}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <p className="text-sm font-semibold text-slate-900">Аудитория и вовлечение</p>
              <p className="mt-1 text-sm text-slate-600">
                Используйте посты, купоны и закрепления, чтобы направлять аудиторию в актуальные подборки витрины.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Числовые метрики подписок и loyalty вынесены в блок аналитики, здесь только action-уровень.
              </p>
              <button
                type="button"
                onClick={() => showMockMessage("Механика подписок появится в следующей итерации.")}
                className="mt-3 inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Посмотреть, как это работает
              </button>
            </div>
          </div>
        </article>

        <article
          id="dashboard-store-settings"
          className={getSectionClassName("rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5", "dashboard-store-settings")}
        >
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Настройки магазина</h2>
          <form onSubmit={handleSettingsSave} className="mt-3 space-y-3">
            <label className="block space-y-1 text-sm">
              <span className="text-slate-600">Название магазина</span>
              <input
                value={settings.storefrontName}
                onChange={(event) => setSettings((prev) => ({ ...prev, storefrontName: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="text-slate-600">Тип продавца</span>
              <select
                value={settings.sellerType}
                onChange={(event) =>
                  setSettings((prev) => ({ ...prev, sellerType: event.target.value as SellerType }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              >
                <option value="private_seller">{getSellerTypeLabel("private_seller")}</option>
                <option value="store_business">{getSellerTypeLabel("store_business")}</option>
                <option value="agriculture_oriented">{getSellerTypeLabel("agriculture_oriented")}</option>
                <option value="electronics_oriented">{getSellerTypeLabel("electronics_oriented")}</option>
              </select>
            </label>

            <label className="block space-y-1 text-sm">
              <span className="text-slate-600">Описание магазина</span>
              <textarea
                value={settings.shortDescription}
                onChange={(event) => setSettings((prev) => ({ ...prev, shortDescription: event.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1 text-sm">
                <span className="text-slate-600">Город</span>
                <input
                  value={settings.city}
                  onChange={(event) => setSettings((prev) => ({ ...prev, city: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-slate-600">Регион</span>
                <input
                  value={settings.region}
                  onChange={(event) => setSettings((prev) => ({ ...prev, region: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                />
              </label>
            </div>

            <label className="block space-y-1 text-sm">
              <span className="text-slate-600">Телефон</span>
              <input
                value={settings.phone}
                onChange={(event) => setSettings((prev) => ({ ...prev, phone: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1 text-sm">
                <span className="text-slate-600">Сайт</span>
                <input
                  value={settings.website}
                  onChange={(event) => setSettings((prev) => ({ ...prev, website: event.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-slate-600">Telegram</span>
                <input
                  value={settings.telegram}
                  onChange={(event) => setSettings((prev) => ({ ...prev, telegram: event.target.value }))}
                  placeholder="@shop"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                />
              </label>
            </div>

            <label className="block space-y-1 text-sm">
              <span className="text-slate-600">VK</span>
              <input
                value={settings.vk}
                onChange={(event) => setSettings((prev) => ({ ...prev, vk: event.target.value }))}
                placeholder="vk.com/shop"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Сохранить
            </button>
          </form>
        </article>
      </section>

      {isTourOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-900/35 p-4">
          <div className="mx-auto mt-12 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:mt-20">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Шаг {tourStepIndex + 1} из {onboardingSteps.length}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">{activeTourStep.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{activeTourStep.description}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={closeTour}
                className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Пропустить
              </button>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTourStepIndex((prev) => Math.max(0, prev - 1))}
                  disabled={tourStepIndex === 0}
                  className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Назад
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (tourStepIndex === onboardingSteps.length - 1) {
                      completeTour();
                      return;
                    }
                    setTourStepIndex((prev) => Math.min(onboardingSteps.length - 1, prev + 1));
                  }}
                  className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  {tourStepIndex === onboardingSteps.length - 1 ? "Завершить" : "Дальше"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isTariffModalOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-900/35 p-4">
          <div className="mx-auto mt-10 max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">Сравнение тарифов</p>
                <p className="text-sm text-slate-600">Базовый vs Про vs Бизнес</p>
              </div>
              <button
                type="button"
                onClick={() => setIsTariffModalOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="border-b border-slate-200 px-2 py-2">Возможность</th>
                    <th className="border-b border-slate-200 px-2 py-2">Базовый</th>
                    <th className="border-b border-slate-200 px-2 py-2">Про</th>
                    <th className="border-b border-slate-200 px-2 py-2">Бизнес</th>
                    <th className="border-b border-slate-200 px-2 py-2">Разовая</th>
                  </tr>
                </thead>
                <tbody>
                  {tariffRows.map((row) => (
                    <tr key={row.id}>
                      <td className="border-b border-slate-100 px-2 py-2 text-slate-700">{row.label}</td>
                      <td className="border-b border-slate-100 px-2 py-2 text-center">
                        {row.free ? (
                          <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" strokeWidth={1.5} />
                        ) : (
                          <Lock className="mx-auto h-4 w-4 text-slate-300" strokeWidth={1.5} />
                        )}
                      </td>
                      <td className="border-b border-slate-100 px-2 py-2 text-center">
                        {row.pro ? (
                          <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" strokeWidth={1.5} />
                        ) : (
                          <Lock className="mx-auto h-4 w-4 text-slate-300" strokeWidth={1.5} />
                        )}
                      </td>
                      <td className="border-b border-slate-100 px-2 py-2 text-center">
                        {row.business ? (
                          <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" strokeWidth={1.5} />
                        ) : (
                          <Lock className="mx-auto h-4 w-4 text-slate-300" strokeWidth={1.5} />
                        )}
                      </td>
                      <td className="border-b border-slate-100 px-2 py-2 text-center">
                        {row.oneTime ? (
                          <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" strokeWidth={1.5} />
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
