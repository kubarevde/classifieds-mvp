"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { StoreMarketingWorkspace } from "@/components/store-dashboard/store-marketing-workspace";
import { CatalogWorld, ListingWorld } from "@/lib/listings";
import {
  HeroBoardPlacement,
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
  initialHeroBoardPlacements: HeroBoardPlacement[];
  initialMarketingScreen?: MarketingMenuKey;
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

function MetricIcon({ id }: { id: string }) {
  const className = "h-4 w-4";
  if (id === "active") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M8 10h8M8 14h5" />
      </svg>
    );
  }
  if (id === "views") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    );
  }
  if (id === "responses") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 5h16v11H8l-4 3z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9z" />
    </svg>
  );
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
  agriculture: "Сельское хозяйство",
  electronics: "Электроника",
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
  if (world === "agriculture") {
    return "agriculture";
  }
  if (world === "electronics") {
    return "electronics";
  }
  return "all";
}

function hasPlanFeature(plan: SellerPlanTier, feature: PlanFeatureRow) {
  if (plan === "business") {
    return feature.business;
  }
  if (plan === "pro") {
    return feature.pro;
  }
  return feature.free;
}

function getLockedLabel(feature: PlanFeatureRow) {
  if (feature.pro) {
    return "Доступно в Про";
  }
  if (feature.business) {
    return "Доступно в Бизнес";
  }
  return "По запросу";
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

  const totals = useMemo(
    () => ({
      views: listings.reduce((acc, listing) => acc + listing.views, 0),
      responses: listings.reduce((acc, listing) => acc + listing.messages, 0),
    }),
    [listings],
  );

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
        label: "Отклики / сообщения",
        value: seller.metrics.messagesLast30d.toLocaleString("ru-RU"),
      },
      {
        id: "rating",
        label: "Рейтинг магазина",
        value: `${seller.metrics.rating.toFixed(1)} / 5`,
      },
    ],
    [counts.active, seller.metrics.messagesLast30d, seller.metrics.rating, seller.metrics.viewsLast30d],
  );

  const currentTierFeatures = useMemo(
    () =>
      tariffRows.filter((feature) => hasPlanFeature(selectedPlanTier, feature)).slice(0, 5),
    [selectedPlanTier],
  );

  const lockedTierFeatures = useMemo(
    () =>
      tariffRows.filter((feature) => !hasPlanFeature(selectedPlanTier, feature)).slice(0, 4),
    [selectedPlanTier],
  );

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
          <svg viewBox="0 0 24 24" className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.8 9.2a2.2 2.2 0 1 1 3.8 1.6c-.8.8-1.6 1.3-1.6 2.3" />
            <circle cx="12" cy="17" r="1" />
          </svg>
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
                onClick={() => setIsTariffModalOpen(true)}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Подключить продвижение
              </button>
            </div>
            <p className="text-xs text-slate-500">Подписчиков магазина: {seller.followersCount.toLocaleString("ru-RU")}</p>
            <p className="text-xs text-slate-500">Новые публикации будут попадать подписчикам в ленту обновлений.</p>
          </aside>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {heroMetrics.map((metric) => (
            <article key={metric.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <MetricIcon id={metric.id} />
                {metric.label}
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{metric.value}</p>
            </article>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Тариф и возможности</p>
              <p className="text-sm text-slate-600">
                Текущий план: <span className="font-semibold">{getSellerPlanTierLabel(selectedPlanTier)}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsTariffModalOpen(true)}
              className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Смотреть тарифы
            </button>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="space-y-1 rounded-lg border border-slate-200 bg-white p-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Доступно сейчас</p>
              {currentTierFeatures.map((feature) => (
                <p key={feature.id} className="text-sm text-slate-700">
                  ✅ {feature.label}
                </p>
              ))}
            </div>
            <div className="space-y-1 rounded-lg border border-slate-200 bg-white p-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Следующий уровень</p>
              {lockedTierFeatures.map((feature) => (
                <p key={feature.id} className="text-sm text-slate-600">
                  🔒 {feature.label} — {getLockedLabel(feature)}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Демо‑переключатель тарифа</p>
            <div className="mt-2 flex flex-wrap gap-2">
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
            <p className="mt-2 text-xs text-slate-500">
              В рамках MVP вы можете переключать тариф вручную, чтобы посмотреть, как будет выглядеть кабинет. Здесь нет реальной оплаты или тарификации.
            </p>
          </div>
        </div>
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
        className={getSectionClassName("", "dashboard-store-marketing")}
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
          onNotify={showMockMessage}
          onOpenTariffs={() => setIsTariffModalOpen(true)}
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
              <p className="text-sm font-semibold text-slate-900">Подписчики магазина</p>
              <p className="mt-1 text-sm text-slate-600">
                {seller.followersCount.toLocaleString("ru-RU")} подписчиков следят за обновлениями витрины.
              </p>
              <p className="mt-1 text-xs text-slate-500">Каждая публикация будет показываться подписчикам в их ленте (mock-логика).</p>
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

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Сводка по кабинету</h2>
            <p className="text-sm text-slate-600">
              Сейчас в кабинете: {counts.all} объявлений, {totals.views} просмотров и {totals.responses} откликов.
            </p>
          </div>
          <Link
            href={`/sellers/${seller.id}`}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Перейти к витрине магазина
          </Link>
        </div>
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
                      closeTour();
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
                ✕
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
                      <td className="border-b border-slate-100 px-2 py-2">{row.free ? "✅" : "🔒"}</td>
                      <td className="border-b border-slate-100 px-2 py-2">{row.pro ? "✅" : "🔒"}</td>
                      <td className="border-b border-slate-100 px-2 py-2">{row.business ? "✅" : "🔒"}</td>
                      <td className="border-b border-slate-100 px-2 py-2">{row.oneTime ? "✅" : "—"}</td>
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
