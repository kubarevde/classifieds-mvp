"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  BarChart2,
  Calendar,
  ChevronsUpDown,
  Clapperboard,
  LayoutDashboard,
  Lock,
  Mail,
  Megaphone,
  Percent,
  Sparkles,
} from "lucide-react";

import { HeroBannerPlacement } from "@/lib/hero-board";
import { CatalogWorld, getWorldLabel } from "@/lib/listings";
import {
  MarketingCampaign,
  MarketingCoupon,
  MarketingMenuKey,
  PriceAnalyticsSnapshot,
  SellerDashboardListing,
  SellerPlanTier,
  SellerPost,
  SellerStorefront,
} from "@/lib/sellers";

type ListingPromotionState = {
  sellerId: string;
  listingId: string;
  lastBoostedAt: string | null;
  isSuper: boolean;
  isSponsored: boolean;
};

type StoreMarketingWorkspaceProps = {
  seller: SellerStorefront;
  listings: SellerDashboardListing[];
  posts: SellerPost[];
  initialCoupons: MarketingCoupon[];
  initialPromotionState: ListingPromotionState[];
  initialCampaigns: MarketingCampaign[];
  initialPriceAnalytics: PriceAnalyticsSnapshot[];
  initialHeroBoardPlacements: HeroBannerPlacement[];
  initialScreen?: MarketingMenuKey;
  /** Переход с витрины /sponsor-board — показать контекст сценария размещения. */
  placementFlowFromSponsorBoard?: boolean;
  onNotify: (message: string) => void;
  onOpenTariffs: () => void;
};

type PlannerEntry = {
  id: string;
  kind: "listing" | "post" | "promo";
  title: string;
  scheduledAt: string;
  status: "scheduled" | "published";
};

type VideoEntry = {
  id: string;
  title: string;
  linkedTo: string;
  views: number;
  likes: number;
};

type MarketingMenuItem = {
  id: MarketingMenuKey;
  label: string;
  requiredPlan: "free" | "pro" | "business";
  lockedHint?: string;
  icon: "overview" | "analytics" | "mailing" | "coupon" | "planner" | "video" | "sponsored" | "boost" | "hero";
};

const menuItems: MarketingMenuItem[] = [
  { id: "overview", label: "Обзор", requiredPlan: "free", icon: "overview" },
  {
    id: "price_analytics",
    label: "Аналитика цен",
    requiredPlan: "pro",
    lockedHint: "Сравнение с рынком и ценовые рекомендации по вашим категориям.",
    icon: "analytics",
  },
  {
    id: "mailings",
    label: "Рассылки",
    requiredPlan: "business",
    lockedHint: "Сегментированные рассылки подписчикам и клиентам с персональными офферами.",
    icon: "mailing",
  },
  {
    id: "coupons",
    label: "Купоны и скидки",
    requiredPlan: "pro",
    lockedHint: "Запуск купонов, скидок и промо‑бейджей на карточках объявлений.",
    icon: "coupon",
  },
  {
    id: "planner",
    label: "Планировщик",
    requiredPlan: "business",
    lockedHint: "Планирование публикаций объявлений, постов и акций по времени.",
    icon: "planner",
  },
  {
    id: "video",
    label: "Видео и эфиры",
    requiredPlan: "business",
    lockedHint: "Управление слотами эфиров и контентом short‑формата магазина.",
    icon: "video",
  },
  {
    id: "sponsored",
    label: "Спонсорские позиции",
    requiredPlan: "business",
    lockedHint: "Приоритетные показы объявлений в каталоге и тематических потоках.",
    icon: "sponsored",
  },
  {
    id: "boosts",
    label: "Поднятие / Супер",
    requiredPlan: "pro",
    lockedHint: "Поднятие объявлений и усиленное выделение карточек в выдаче.",
    icon: "boost",
  },
  {
    id: "hero_board",
    label: "Герой доски",
    requiredPlan: "free",
    lockedHint: "Премиальный слот на доске Classify: витрина активных размещений на /sponsor-board, в мирах — один слот с ротацией (демо).",
    icon: "hero",
  },
];

const relationLabel = {
  cheaper_than_you: "дешевле вас",
  more_expensive_than_you: "дороже вас",
  close_to_you: "примерно как вы",
} as const;

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

function formatDateTime(isoDate: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

const heroScopeLabel = {
  global: "Вся платформа",
  world: "Конкретный мир",
} as const;

const heroPeriodLabel = {
  day: "День",
  week: "Неделя",
  month: "Месяц",
} as const;

function hasPlanAccess(plan: SellerPlanTier, requiredPlan: "free" | "pro" | "business") {
  const rank: Record<SellerPlanTier, number> = { free: 0, pro: 1, business: 2 };
  return rank[plan] >= rank[requiredPlan];
}

function MenuIcon({ icon }: { icon: MarketingMenuItem["icon"] }) {
  const baseClassName = "h-4 w-4";

  if (icon === "overview") {
    return <LayoutDashboard className={baseClassName} strokeWidth={1.5} />;
  }
  if (icon === "analytics") {
    return <BarChart2 className={baseClassName} strokeWidth={1.5} />;
  }
  if (icon === "mailing") {
    return <Mail className={baseClassName} strokeWidth={1.5} />;
  }
  if (icon === "coupon") {
    return <Percent className={baseClassName} strokeWidth={1.5} />;
  }
  if (icon === "planner") {
    return <Calendar className={baseClassName} strokeWidth={1.5} />;
  }
  if (icon === "video") {
    return <Clapperboard className={baseClassName} strokeWidth={1.5} />;
  }
  if (icon === "sponsored") {
    return <Megaphone className={baseClassName} strokeWidth={1.5} />;
  }
  if (icon === "hero") {
    return <Sparkles className={baseClassName} strokeWidth={1.5} />;
  }
  return <ChevronsUpDown className={baseClassName} strokeWidth={1.5} />;
}

function LockMiniIcon() {
  return <Lock className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />;
}

export function StoreMarketingWorkspace({
  seller,
  listings,
  posts,
  initialCoupons,
  initialPromotionState,
  initialCampaigns,
  initialPriceAnalytics,
  initialHeroBoardPlacements,
  initialScreen,
  placementFlowFromSponsorBoard = false,
  onNotify,
  onOpenTariffs,
}: StoreMarketingWorkspaceProps) {
  const [activeScreen, setActiveScreen] = useState<MarketingMenuKey>(initialScreen ?? "overview");
  const [coupons, setCoupons] = useState(initialCoupons);
  const [promotionState, setPromotionState] = useState(initialPromotionState);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [priceWorld, setPriceWorld] = useState(initialPriceAnalytics[0]?.world ?? "all");
  const [priceCategory, setPriceCategory] = useState<string | "all">(initialPriceAnalytics[0]?.categoryId ?? "all");
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: "",
    title: "",
    discountType: "percent" as "percent" | "fixed",
    discountValue: 0,
    scope: "store" as "store" | "listings",
    listingIds: [] as string[],
    validUntil: "",
    showOnListingCard: true,
  });
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    world: "all" as CatalogWorld,
    listingIds: [] as string[],
    showCatalog: true,
    showThematic: true,
  });
  const [plannerEntries, setPlannerEntries] = useState<PlannerEntry[]>([
    {
      id: "planner-1",
      kind: "post",
      title: "Акция на выходные",
      scheduledAt: "2026-04-24T09:00:00.000Z",
      status: "scheduled",
    },
    {
      id: "planner-2",
      kind: "listing",
      title: listings[0]?.title ?? "Публикация объявления",
      scheduledAt: "2026-04-19T14:00:00.000Z",
      status: "published",
    },
  ]);
  const [plannerForm, setPlannerForm] = useState({
    kind: "listing" as "listing" | "post" | "promo",
    targetId: "",
    scheduledAt: "",
  });
  const [videoEntries, setVideoEntries] = useState<VideoEntry[]>([
    {
      id: "video-1",
      title: "Короткий обзор новой поставки",
      linkedTo: listings[0]?.title ?? "Витрина магазина",
      views: 940,
      likes: 114,
    },
    {
      id: "video-2",
      title: "Подготовка товара к отгрузке",
      linkedTo: listings[1]?.title ?? "Категория магазина",
      views: 510,
      likes: 58,
    },
  ]);
  const [mailingText, setMailingText] = useState("");
  const [recentBoosts, setRecentBoosts] = useState<string[]>([]);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);
  const [heroBoardPlacements, setHeroBoardPlacements] = useState(initialHeroBoardPlacements);
  const [showSponsorBoardEntryBanner, setShowSponsorBoardEntryBanner] = useState(placementFlowFromSponsorBoard);
  const [heroForm, setHeroForm] = useState({
    scope: "global" as "global" | "world",
    worldId: "electronics" as Exclude<CatalogWorld, "all">,
    period: "week" as "day" | "week" | "month",
    title: `${seller.storefrontName}: заметное размещение`,
    subtitle: seller.shortDescription,
    imageUrl: "",
    ctaLabel: "Открыть магазин",
    ctaHref: `/sellers/${seller.id}`,
  });

  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "active");
  const activeCoupons = coupons.filter((coupon) => coupon.status === "active");
  const activeSuperCount = promotionState.filter((item) => item.isSuper).length;
  const recentBoostCount = promotionState.filter((item) => Boolean(item.lastBoostedAt)).length;
  const activeHeroBoardCount = heroBoardPlacements.filter((item) => item.isActive).length;
  const activeToolTypes = [
    activeCampaigns.length > 0,
    activeCoupons.length > 0,
    activeSuperCount > 0,
    recentBoostCount > 0,
    activeHeroBoardCount > 0,
  ].filter(Boolean).length;
  const activeCampaignUnits = activeCampaigns.length + activeSuperCount + recentBoostCount;
  const extraViewsFromPromotion =
    activeCampaigns.length * 240 + activeSuperCount * 160 + recentBoostCount * 75 + activeHeroBoardCount * 360;
  const currentHeroPlacement = heroBoardPlacements.find((item) => item.isActive) ?? null;

  const snapshotsByWorld = useMemo(
    () => initialPriceAnalytics.filter((snapshot) => snapshot.world === priceWorld),
    [initialPriceAnalytics, priceWorld],
  );
  const currentSnapshot =
    snapshotsByWorld.find((snapshot) => snapshot.categoryId === priceCategory) ??
    snapshotsByWorld.find((snapshot) => snapshot.categoryId === "all") ??
    initialPriceAnalytics[0] ??
    null;

  const activeMenuMeta = menuItems.find((item) => item.id === activeScreen) ?? menuItems[0];
  const isCurrentScreenAllowed = hasPlanAccess(seller.planTier, activeMenuMeta.requiredPlan);

  function openScreen(menuItem: MarketingMenuItem) {
    setActiveScreen(menuItem.id);
    if (!hasPlanAccess(seller.planTier, menuItem.requiredPlan)) {
      setLockedNotice(
        `Инструмент "${menuItem.label}" доступен на тарифе ${
          menuItem.requiredPlan === "pro" ? "Про" : "Бизнес"
        }. ${menuItem.lockedHint ?? ""}`.trim(),
      );
      return;
    }
    setLockedNotice(null);
  }

  function handleCouponSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!couponForm.code.trim() || !couponForm.title.trim() || !couponForm.validUntil) {
      onNotify("Заполните код, название и срок действия купона.");
      return;
    }

    const created: MarketingCoupon = {
      id: `coupon-local-${Date.now()}`,
      sellerId: seller.id,
      code: couponForm.code.trim().toUpperCase(),
      title: couponForm.title.trim(),
      discountType: couponForm.discountType,
      discountValue: couponForm.discountValue,
      scope: couponForm.scope,
      listingIds: couponForm.scope === "listings" ? couponForm.listingIds : [],
      validUntil: new Date(couponForm.validUntil).toISOString(),
      status: "active",
      showOnListingCard: couponForm.showOnListingCard,
    };
    setCoupons((current) => [created, ...current]);
    setCouponForm({
      code: "",
      title: "",
      discountType: "percent",
      discountValue: 0,
      scope: "store",
      listingIds: [],
      validUntil: "",
      showOnListingCard: true,
    });
    setShowCouponForm(false);
    onNotify("Купон создан (mock).");
  }

  function handleCampaignSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!campaignForm.name.trim() || campaignForm.listingIds.length === 0) {
      onNotify("Укажите название кампании и выберите объявления.");
      return;
    }
    const placements = [
      campaignForm.showCatalog ? "catalog" : null,
      campaignForm.showThematic ? "thematic" : null,
    ].filter(Boolean) as ("catalog" | "thematic")[];

    const campaign: MarketingCampaign = {
      id: `campaign-local-${Date.now()}`,
      sellerId: seller.id,
      name: campaignForm.name.trim(),
      listingIds: campaignForm.listingIds,
      world: campaignForm.world,
      placements: placements.length ? placements : ["catalog"],
      status: "active",
    };
    setCampaigns((current) => [campaign, ...current]);
    setCampaignForm({
      name: "",
      world: "all",
      listingIds: [],
      showCatalog: true,
      showThematic: true,
    });
    onNotify("Кампания создана (mock).");
  }

  function handlePlannerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!plannerForm.targetId || !plannerForm.scheduledAt) {
      onNotify("Выберите объект и дату публикации.");
      return;
    }
    const sourceTitle =
      plannerForm.kind === "listing"
        ? listings.find((item) => item.id === plannerForm.targetId)?.title
        : posts.find((item) => item.id === plannerForm.targetId)?.title;

    setPlannerEntries((current) => [
      {
        id: `planner-local-${Date.now()}`,
        kind: plannerForm.kind,
        title: sourceTitle ?? "Запланированная публикация",
        scheduledAt: new Date(plannerForm.scheduledAt).toISOString(),
        status: "scheduled",
      },
      ...current,
    ]);
    setPlannerForm({ kind: "listing", targetId: "", scheduledAt: "" });
    onNotify("Публикация добавлена в планировщик (mock).");
  }

  function boostListing(listingId: string) {
    const title = listings.find((item) => item.id === listingId)?.title ?? "Объявление";
    const now = new Date().toISOString();
    setPromotionState((current) =>
      current.map((item) => (item.listingId === listingId ? { ...item, lastBoostedAt: now } : item)),
    );
    setRecentBoosts((current) => [title, ...current].slice(0, 5));
    onNotify("Объявление поднято (mock).");
  }

  function toggleSuper(listingId: string) {
    setPromotionState((current) =>
      current.map((item) => (item.listingId === listingId ? { ...item, isSuper: !item.isSuper } : item)),
    );
    onNotify("Статус суперобъявления обновлён (mock).");
  }

  function computeHeroMockPrice() {
    const scopePrice = heroForm.scope === "global" ? 12000 : 6200;
    const worldMultiplier =
      heroForm.scope === "world"
        ? heroForm.worldId === "agriculture"
          ? 0.92
          : heroForm.worldId === "autos"
            ? 1.04
            : 1
        : 1;
    const periodMultiplier = heroForm.period === "day" ? 1 : heroForm.period === "week" ? 3.6 : 10.8;
    return Math.round(scopePrice * worldMultiplier * periodMultiplier);
  }

  function activateHeroBoardPlacement() {
    const mockPrice = computeHeroMockPrice();
    const now = new Date();
    const durationDays = heroForm.period === "day" ? 1 : heroForm.period === "week" ? 7 : 30;
    const endsAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const created: HeroBannerPlacement = {
      id: `hero-local-${Date.now()}`,
      sellerId: seller.id,
      scope: heroForm.scope,
      worldId: heroForm.scope === "world" ? heroForm.worldId : undefined,
      period: heroForm.period,
      title: heroForm.title.trim(),
      subtitle: heroForm.subtitle.trim(),
      imageUrl: heroForm.imageUrl.trim() || undefined,
      ctaLabel: heroForm.ctaLabel.trim() || "Открыть",
      ctaHref: heroForm.ctaHref.trim() || `/sellers/${seller.id}`,
      startsAt: now.toISOString(),
      endsAt: endsAt.toISOString(),
      mockPrice,
      isActive: true,
    };

    setHeroBoardPlacements((current) => [created, ...current.map((item) => ({ ...item, isActive: false }))].slice(0, 6));
    onNotify("Герой доски подключён (mock).");
  }

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Маркетинг и продвижение</h2>
        <p className="text-sm text-slate-600">Управляйте продвижением витрины инструментами Pro‑панели.</p>
      </div>

      <div className="grid gap-3 xl:grid-cols-[248px_minmax(0,1fr)]">
        <nav className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-2">
          {menuItems.map((menuItem) => {
            const isAllowed = hasPlanAccess(seller.planTier, menuItem.requiredPlan);
            const tierBadge =
              menuItem.requiredPlan === "free"
                ? null
                : menuItem.requiredPlan === "pro"
                  ? "Про"
                  : "Бизнес";

            return (
              <button
                key={menuItem.id}
                type="button"
                onClick={() => openScreen(menuItem)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                  activeScreen === menuItem.id
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-white hover:text-slate-900"
                }`}
              >
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-current/20">
                  <MenuIcon icon={menuItem.icon} />
                </span>
                <span className="min-w-0 flex-1 truncate whitespace-nowrap leading-5">{menuItem.label}</span>
                {tierBadge ? (
                  <span
                    className={`ml-auto inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] ${
                      activeScreen === menuItem.id
                        ? "border-white/40 text-white"
                        : isAllowed
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {!isAllowed ? <LockMiniIcon /> : null}
                    {tierBadge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
          {lockedNotice ? (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {lockedNotice}
            </div>
          ) : null}

          {!isCurrentScreenAllowed ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">{activeMenuMeta.label}</p>
              <p className="mt-1 text-sm text-slate-600">
                {activeMenuMeta.lockedHint ??
                  "Инструмент пока недоступен на вашем тарифе, но готов к подключению в следующем уровне."}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                <li>• Открывает дополнительные возможности для роста витрины.</li>
                <li>• Помогает увеличить охват и конверсию в отклик.</li>
                <li>• Работает в связке с объявлениями и storefront.</li>
              </ul>
              <button
                type="button"
                onClick={onOpenTariffs}
                className="mt-3 inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Узнать больше о тарифах
              </button>
            </div>
          ) : null}

          {isCurrentScreenAllowed && activeScreen === "overview" ? (
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-3">
                <article className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">Дополнительные просмотры от продвижения</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {extraViewsFromPromotion.toLocaleString("ru-RU")}
                  </p>
                </article>
                <article className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">Активные кампании</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">{activeCampaignUnits}</p>
                </article>
                <article className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">Используемые инструменты</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">{activeToolTypes}</p>
                </article>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-sm font-semibold text-slate-900">Герой доски</p>
                {currentHeroPlacement ? (
                  <p className="mt-1 text-sm text-slate-600">
                    Статус: <span className="font-semibold text-slate-900">активен</span> ·{" "}
                    {currentHeroPlacement.scope === "global"
                      ? "вся платформа"
                      : `мир: ${getWorldLabel(currentHeroPlacement.worldId ?? "all")}`}{" "}
                    · период: {heroPeriodLabel[currentHeroPlacement.period]}.
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-slate-600">
                    Статус: <span className="font-semibold text-slate-900">не активен</span>. Запустите баннер в разделе
                    «Герой доски / Благотворительность».
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-sm font-semibold text-slate-900">Активные инструменты</p>
                <div className="mt-2 space-y-2">
                  {[
                    { id: "campaigns", label: "Спонсорские кампании", status: activeCampaigns.length > 0 ? `${activeCampaigns.length} активно` : "не активно", menuKey: "sponsored" as MarketingMenuKey },
                    { id: "coupons", label: "Купоны", status: activeCoupons.length > 0 ? `${activeCoupons.length} активно` : "не активно", menuKey: "coupons" as MarketingMenuKey },
                    { id: "boosts", label: "Поднятие", status: recentBoostCount > 0 ? `${recentBoostCount} с бустом` : "не активно", menuKey: "boosts" as MarketingMenuKey },
                    { id: "super", label: "Суперобъявления", status: activeSuperCount > 0 ? `${activeSuperCount} активно` : "не активно", menuKey: "boosts" as MarketingMenuKey },
                    { id: "hero", label: "Герой доски", status: activeHeroBoardCount > 0 ? `${activeHeroBoardCount} активен` : "не подключен", menuKey: "hero_board" as MarketingMenuKey },
                  ].map((tool) => (
                    <div key={tool.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                      <p className="text-sm text-slate-700">
                        {tool.label} — <span className="font-medium">{tool.status}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => openScreen(menuItems.find((item) => item.id === tool.menuKey) ?? menuItems[0])}
                        className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Перейти к настройкам
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {recentBoosts.length ? (
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-sm font-semibold text-slate-900">Недавно поднятые объявления</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    {recentBoosts.map((title, index) => (
                      <li key={`${title}-${index}`}>• {title}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {isCurrentScreenAllowed && activeScreen === "price_analytics" ? (
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="space-y-1 text-xs">
                  <span className="text-slate-600">Мир</span>
                  <select
                    value={priceWorld}
                    onChange={(event) => {
                      const nextWorld = event.target.value as CatalogWorld;
                      setPriceWorld(nextWorld);
                      setPriceCategory("all");
                    }}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800"
                  >
                    <option value="all">Каталог</option>
                    <option value="electronics">Электроника</option>
                    <option value="autos">Автомобили</option>
                    <option value="agriculture">Сельское хозяйство</option>
                    <option value="real_estate">Недвижимость</option>
                    <option value="jobs">Работа</option>
                    <option value="services">Услуги</option>
                  </select>
                </label>
                <label className="space-y-1 text-xs">
                  <span className="text-slate-600">Категория</span>
                  <select
                    value={priceCategory}
                    onChange={(event) => setPriceCategory(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800"
                  >
                    <option value="all">Все категории</option>
                    {snapshotsByWorld
                      .filter((snapshot) => snapshot.categoryId !== "all")
                      .map((snapshot) => (
                        <option key={snapshot.categoryId} value={snapshot.categoryId}>
                          {snapshot.categoryId}
                        </option>
                      ))}
                  </select>
                </label>
              </div>

              {currentSnapshot ? (
                <>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <article className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-xs text-slate-500">Диапазон цен по рынку</p>
                      <p className="mt-1 text-sm text-slate-700">
                        {currentSnapshot.marketMin.toLocaleString("ru-RU")} —{" "}
                        {currentSnapshot.marketMedian.toLocaleString("ru-RU")} —{" "}
                        {currentSnapshot.marketMax.toLocaleString("ru-RU")}
                      </p>
                      <div className="mt-2 h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-slate-900"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                8,
                                ((currentSnapshot.sellerAverage - currentSnapshot.marketMin) /
                                  (currentSnapshot.marketMax - currentSnapshot.marketMin || 1)) *
                                  100,
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                    </article>
                    <article className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-xs text-slate-500">Средняя цена ваших объявлений</p>
                      <p className="mt-1 text-xl font-semibold text-slate-900">
                        {currentSnapshot.sellerAverage.toLocaleString("ru-RU")}
                      </p>
                    </article>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-sm font-semibold text-slate-900">Похожие объявления</p>
                    <div className="mt-2 space-y-2">
                      {currentSnapshot.comparables.map((row) => (
                        <div key={row.id} className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 sm:grid-cols-[minmax(0,1fr)_120px_170px]">
                          <p className="text-sm text-slate-700">{row.title}</p>
                          <p className="text-sm font-semibold text-slate-900">{row.price.toLocaleString("ru-RU")}</p>
                          <p className="text-sm text-slate-600">{relationLabel[row.relation]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
                  Снимок аналитики для выбранных фильтров пока не подготовлен.
                </p>
              )}
            </div>
          ) : null}

          {isCurrentScreenAllowed && activeScreen === "mailings" ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-sm font-semibold text-slate-900">Таргетированные рассылки</p>
                <textarea
                  rows={4}
                  value={mailingText}
                  onChange={(event) => setMailingText(event.target.value)}
                  placeholder="Например: Новые поступления со скидкой для подписчиков магазина..."
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!mailingText.trim()) {
                      onNotify("Введите текст рассылки.");
                      return;
                    }
                    setMailingText("");
                    onNotify("Рассылка отправлена (mock).");
                  }}
                  className="mt-2 inline-flex h-8 items-center rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-700"
                >
                  Отправить рассылку
                </button>
              </div>
            </div>
          ) : null}

          {isCurrentScreenAllowed && activeScreen === "coupons" ? (
            <div className="space-y-3">
              <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800">
                Купоны помогают стимулировать первые сделки и возвращать покупателей.
              </p>
              <button
                type="button"
                onClick={() => setShowCouponForm((current) => !current)}
                className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Создать купон
              </button>

              {showCouponForm ? (
                <form onSubmit={handleCouponSubmit} className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-2">
                  <label className="space-y-1 text-xs">
                    <span className="text-slate-600">Код</span>
                    <input
                      value={couponForm.code}
                      onChange={(event) => setCouponForm((prev) => ({ ...prev, code: event.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="text-slate-600">Название</span>
                    <input
                      value={couponForm.title}
                      onChange={(event) => setCouponForm((prev) => ({ ...prev, title: event.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="text-slate-600">Тип</span>
                    <select
                      value={couponForm.discountType}
                      onChange={(event) =>
                        setCouponForm((prev) => ({
                          ...prev,
                          discountType: event.target.value as "percent" | "fixed",
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                    >
                      <option value="percent">Процент</option>
                      <option value="fixed">Фиксированная сумма</option>
                    </select>
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="text-slate-600">Размер скидки</span>
                    <input
                      type="number"
                      min={0}
                      value={couponForm.discountValue}
                      onChange={(event) =>
                        setCouponForm((prev) => ({ ...prev, discountValue: Number(event.target.value) }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="text-slate-600">Привязка</span>
                    <select
                      value={couponForm.scope}
                      onChange={(event) =>
                        setCouponForm((prev) => ({ ...prev, scope: event.target.value as "store" | "listings" }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                    >
                      <option value="store">Весь магазин</option>
                      <option value="listings">Выбранные объявления</option>
                    </select>
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="text-slate-600">Действует до</span>
                    <input
                      type="date"
                      value={couponForm.validUntil}
                      onChange={(event) => setCouponForm((prev) => ({ ...prev, validUntil: event.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                    />
                  </label>

                  {couponForm.scope === "listings" ? (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-slate-600">Выберите объявления</p>
                      <div className="mt-1 grid gap-1 sm:grid-cols-2">
                        {listings.map((listing) => (
                          <label key={listing.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs">
                            <input
                              type="checkbox"
                              checked={couponForm.listingIds.includes(listing.id)}
                              onChange={(event) =>
                                setCouponForm((prev) => ({
                                  ...prev,
                                  listingIds: event.target.checked
                                    ? [...prev.listingIds, listing.id]
                                    : prev.listingIds.filter((id) => id !== listing.id),
                                }))
                              }
                            />
                            <span className="line-clamp-1">{listing.title}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <label className="sm:col-span-2 flex items-center gap-2 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={couponForm.showOnListingCard}
                      onChange={(event) =>
                        setCouponForm((prev) => ({ ...prev, showOnListingCard: event.target.checked }))
                      }
                    />
                    Показывать бейдж купона на карточке объявления
                  </label>

                  <button
                    type="submit"
                    className="sm:col-span-2 inline-flex h-8 items-center justify-center rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-700"
                  >
                    Сохранить купон
                  </button>
                </form>
              ) : null}

              <div className="space-y-2">
                {coupons.map((coupon) => (
                  <article key={coupon.id} className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-[120px_140px_minmax(0,1fr)_120px_120px]">
                    <p className="text-sm font-semibold text-slate-900">{coupon.code}</p>
                    <p className="text-sm text-slate-700">
                      {coupon.discountType === "percent" ? "Процент" : "Фикс."} {coupon.discountValue}
                    </p>
                    <p className="text-sm text-slate-600">
                      {coupon.scope === "store"
                        ? "Весь магазин"
                        : `Объявления: ${coupon.listingIds
                            .map((id) => listings.find((item) => item.id === id)?.title ?? id)
                            .join(", ")}`}
                    </p>
                    <p className="text-sm text-slate-600">{formatDate(coupon.validUntil)}</p>
                    <p className="text-sm text-slate-600">
                      {coupon.status === "active" ? "Активен" : coupon.status === "expired" ? "Истёк" : "Выключен"}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {isCurrentScreenAllowed && activeScreen === "planner" ? (
            <div className="space-y-3">
              <form onSubmit={handlePlannerSubmit} className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-3">
                <label className="space-y-1 text-xs">
                  <span className="text-slate-600">Тип</span>
                  <select
                    value={plannerForm.kind}
                    onChange={(event) =>
                      setPlannerForm((prev) => ({
                        ...prev,
                        kind: event.target.value as "listing" | "post" | "promo",
                        targetId: "",
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                  >
                    <option value="listing">Объявление</option>
                    <option value="post">Пост</option>
                    <option value="promo">Акция</option>
                  </select>
                </label>
                <label className="space-y-1 text-xs">
                  <span className="text-slate-600">Объект</span>
                  <select
                    value={plannerForm.targetId}
                    onChange={(event) => setPlannerForm((prev) => ({ ...prev, targetId: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                  >
                    <option value="">Выберите</option>
                    {(plannerForm.kind === "listing" ? listings : posts).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-xs">
                  <span className="text-slate-600">Дата и время</span>
                  <input
                    type="datetime-local"
                    value={plannerForm.scheduledAt}
                    onChange={(event) => setPlannerForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                  />
                </label>
                <button
                  type="submit"
                  className="sm:col-span-3 inline-flex h-8 items-center justify-center rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-700"
                >
                  Добавить в планировщик
                </button>
              </form>

              <div className="space-y-2">
                {plannerEntries.map((entry) => (
                  <article key={entry.id} className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-[110px_minmax(0,1fr)_160px_120px]">
                    <p className="text-sm text-slate-600">
                      {entry.kind === "listing" ? "Объявление" : entry.kind === "post" ? "Пост" : "Акция"}
                    </p>
                    <p className="text-sm font-medium text-slate-900">{entry.title}</p>
                    <p className="text-sm text-slate-600">{formatDateTime(entry.scheduledAt)}</p>
                    <p className="text-sm text-slate-600">
                      {entry.status === "scheduled" ? "Запланировано" : "Опубликовано"}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {isCurrentScreenAllowed && activeScreen === "video" ? (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setVideoEntries((current) => [
                    {
                      id: `video-local-${Date.now()}`,
                      title: "Слот прямого эфира",
                      linkedTo: "Каталог магазина",
                      views: 0,
                      likes: 0,
                    },
                    ...current,
                  ]);
                  onNotify("Слот эфира создан (mock).");
                }}
                className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Создать слот эфира
              </button>
              <div className="space-y-2">
                {videoEntries.map((entry) => (
                  <article key={entry.id} className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_80px]">
                    <p className="text-sm font-medium text-slate-900">{entry.title}</p>
                    <p className="text-sm text-slate-600">{entry.linkedTo}</p>
                    <p className="text-sm text-slate-600">Просмотры: {entry.views}</p>
                    <p className="text-sm text-slate-600">Лайки: {entry.likes}</p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {isCurrentScreenAllowed && activeScreen === "sponsored" ? (
            <div className="space-y-3">
              <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800">
                Спонсорские позиции поднимают ваши объявления выше в тематических потоках. В этом MVP это демонстрационный режим.
              </p>
              <form onSubmit={handleCampaignSubmit} className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs">
                  <span className="text-slate-600">Название кампании</span>
                  <input
                    value={campaignForm.name}
                    onChange={(event) => setCampaignForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 text-xs">
                  <span className="text-slate-600">Мир / поток</span>
                  <select
                    value={campaignForm.world}
                    onChange={(event) =>
                      setCampaignForm((prev) => ({
                        ...prev,
                        world: event.target.value as CatalogWorld,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                  >
                    <option value="all">Каталог</option>
                    <option value="electronics">Электроника</option>
                    <option value="autos">Автомобили</option>
                    <option value="agriculture">Сельское хозяйство</option>
                    <option value="real_estate">Недвижимость</option>
                    <option value="jobs">Работа</option>
                    <option value="services">Услуги</option>
                  </select>
                </label>

                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-600">Выберите объявления</p>
                  <div className="mt-1 grid gap-1 sm:grid-cols-2">
                    {listings.map((listing) => (
                      <label key={listing.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs">
                        <input
                          type="checkbox"
                          checked={campaignForm.listingIds.includes(listing.id)}
                          onChange={(event) =>
                            setCampaignForm((prev) => ({
                              ...prev,
                              listingIds: event.target.checked
                                ? [...prev.listingIds, listing.id]
                                : prev.listingIds.filter((id) => id !== listing.id),
                            }))
                          }
                        />
                        <span className="line-clamp-1">{listing.title}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={campaignForm.showCatalog}
                    onChange={(event) => setCampaignForm((prev) => ({ ...prev, showCatalog: event.target.checked }))}
                  />
                  Показывать в каталоге
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={campaignForm.showThematic}
                    onChange={(event) => setCampaignForm((prev) => ({ ...prev, showThematic: event.target.checked }))}
                  />
                  Показывать в тематических потоках
                </label>

                <button
                  type="submit"
                  className="sm:col-span-2 inline-flex h-8 items-center justify-center rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-700"
                >
                  Создать кампанию
                </button>
              </form>

              <div className="space-y-2">
                {campaigns.map((campaign) => (
                  <article key={campaign.id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{campaign.name}</p>
                      <button
                        type="button"
                        onClick={() =>
                          setCampaigns((current) =>
                            current.map((item) =>
                              item.id === campaign.id
                                ? { ...item, status: item.status === "active" ? "paused" : "active" }
                                : item,
                            ),
                          )
                        }
                        className="inline-flex h-7 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        {campaign.status === "active" ? "Пауза" : "Запустить"}
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      Объявления:{" "}
                      {campaign.listingIds
                        .map((id) => listings.find((item) => item.id === id)?.title ?? id)
                        .join(", ")}
                    </p>
                    <p className="text-sm text-slate-600">
                      Мир: {campaign.world} · Статус: {campaign.status === "active" ? "активно" : "на паузе"}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {isCurrentScreenAllowed && activeScreen === "boosts" ? (
            <div className="space-y-2">
              {listings.map((listing) => {
                const state =
                  promotionState.find((item) => item.listingId === listing.id) ??
                  ({
                    sellerId: seller.id,
                    listingId: listing.id,
                    lastBoostedAt: null,
                    isSuper: false,
                    isSponsored: false,
                  } as ListingPromotionState);
                const status = state.isSuper ? "суперобъявление" : state.lastBoostedAt ? "поднято" : "обычное";

                return (
                  <article
                    key={listing.id}
                    className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 xl:grid-cols-[minmax(0,1fr)_130px_130px_180px_160px]"
                  >
                    <p className="text-sm font-medium text-slate-900">{listing.title}</p>
                    <p className="text-sm text-slate-600">{listing.world}</p>
                    <p className="text-sm text-slate-600">{status}</p>
                    <p className="text-sm text-slate-600">
                      {state.lastBoostedAt ? formatDateTime(state.lastBoostedAt) : "—"}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => boostListing(listing.id)}
                        className="inline-flex h-7 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Поднять
                      </button>
                      <label className="flex items-center gap-1 text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={state.isSuper}
                          onChange={() => toggleSuper(listing.id)}
                        />
                        Супер
                      </label>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}

          {isCurrentScreenAllowed && activeScreen === "hero_board" ? (
            <div className="space-y-3">
              {showSponsorBoardEntryBanner ? (
                <div className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-sky-200 bg-sky-50 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-sky-950">Вы перешли из витрины «Герой доски»</p>
                    <p className="mt-1 text-xs leading-relaxed text-sky-900/90">
                      Ниже — демо-форма размещения. После активации карточка появится среди активных слотов на странице{" "}
                      <Link href="/sponsor-board" className="font-semibold underline decoration-sky-300 underline-offset-2">
                        /sponsor-board
                      </Link>
                      ; в тематическом мире ваш баннер попадёт в ротацию одного слота.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSponsorBoardEntryBanner(false)}
                    className="shrink-0 rounded-lg border border-sky-300 bg-white px-2 py-1 text-xs font-semibold text-sky-900 transition hover:bg-sky-100"
                  >
                    Скрыть
                  </button>
                </div>
              ) : null}
              <article className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-sm font-semibold text-slate-900">Что такое «Герой доски»</p>
                <p className="mt-1 text-sm text-slate-600">
                  Это отдельный баннерный рекламный слот платформы, а не усиление конкретного объявления.
                </p>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  <li>• Герой платформы: баннер показывается на главной всем пользователям.</li>
                  <li>• Герой мира: баннер показывается внутри выбранного тематического мира.</li>
                  <li>• 20% условной стоимости учитываются как благотворительная часть (демо-механика).</li>
                </ul>
              </article>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!heroForm.title.trim() || !heroForm.subtitle.trim()) {
                    onNotify("Заполните заголовок и подзаголовок баннера.");
                    return;
                  }
                  activateHeroBoardPlacement();
                }}
                className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-2"
              >
                <label className="space-y-1 text-xs">
                  <span className="text-slate-600">Охват</span>
                  <select
                    value={heroForm.scope}
                    onChange={(event) => setHeroForm((prev) => ({ ...prev, scope: event.target.value as "global" | "world" }))}
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                  >
                    <option value="global">Вся платформа</option>
                    <option value="world">Конкретный мир</option>
                  </select>
                </label>
                {heroForm.scope === "world" ? (
                  <label className="space-y-1 text-xs">
                    <span className="text-slate-600">Мир</span>
                    <select
                      value={heroForm.worldId}
                      onChange={(event) =>
                        setHeroForm((prev) => ({
                          ...prev,
                          worldId: event.target.value as Exclude<CatalogWorld, "all">,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                    >
                      <option value="electronics">Электроника</option>
                      <option value="autos">Автомобили</option>
                      <option value="agriculture">Сельское хозяйство</option>
                      <option value="real_estate">Недвижимость</option>
                      <option value="jobs">Работа</option>
                      <option value="services">Услуги</option>
                    </select>
                  </label>
                ) : null}
                <label className="space-y-1 text-xs">
                  <span className="text-slate-600">Период</span>
                  <select
                    value={heroForm.period}
                    onChange={(event) => setHeroForm((prev) => ({ ...prev, period: event.target.value as "day" | "week" | "month" }))}
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                  >
                    <option value="day">День</option>
                    <option value="week">Неделя</option>
                    <option value="month">Месяц</option>
                  </select>
                </label>
                <label className="space-y-1 text-xs md:col-span-2">
                  <span className="text-slate-600">Заголовок баннера</span>
                  <input
                    value={heroForm.title}
                    onChange={(event) => setHeroForm((prev) => ({ ...prev, title: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 text-xs md:col-span-2">
                  <span className="text-slate-600">Подзаголовок</span>
                  <input
                    value={heroForm.subtitle}
                    onChange={(event) => setHeroForm((prev) => ({ ...prev, subtitle: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 text-xs">
                  <span className="text-slate-600">Image URL (опционально)</span>
                  <input
                    value={heroForm.imageUrl}
                    onChange={(event) => setHeroForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 text-xs">
                  <span className="text-slate-600">Текст кнопки</span>
                  <input
                    value={heroForm.ctaLabel}
                    onChange={(event) => setHeroForm((prev) => ({ ...prev, ctaLabel: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 text-xs md:col-span-2">
                  <span className="text-slate-600">Ссылка кнопки</span>
                  <input
                    value={heroForm.ctaHref}
                    onChange={(event) => setHeroForm((prev) => ({ ...prev, ctaHref: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                  />
                </label>

                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 md:col-span-2">
                  Mock‑стоимость: <span className="font-semibold">{computeHeroMockPrice().toLocaleString("ru-RU")} ₽</span>{" "}
                  ·{" "}
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold">
                    20% идёт на благотворительность (демо)
                  </span>
                </div>

                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-700 md:col-span-2"
                >
                  Подключить героя доски
                </button>
              </form>

              <article className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-sm font-semibold text-slate-900">Текущий герой доски</p>
                {currentHeroPlacement ? (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    <p>
                      Формат: <span className="font-medium">Баннерный слот</span>
                    </p>
                    <p>
                      Охват: <span className="font-medium">{heroScopeLabel[currentHeroPlacement.scope]}</span>
                      {currentHeroPlacement.worldId ? ` · ${getWorldLabel(currentHeroPlacement.worldId)}` : ""}
                    </p>
                    <p>
                      Период: <span className="font-medium">{heroPeriodLabel[currentHeroPlacement.period]}</span> · до{" "}
                      <span className="font-medium">{formatDate(currentHeroPlacement.endsAt)}</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">CTA: {currentHeroPlacement.ctaLabel}</p>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-slate-600">Активного размещения пока нет.</p>
                )}
              </article>

              <article className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-sm font-semibold text-slate-900">История</p>
                <div className="mt-2 space-y-2">
                  {heroBoardPlacements.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm text-slate-700">
                      <p>
                        Баннер · {heroScopeLabel[entry.scope]}
                        {entry.worldId ? ` (${getWorldLabel(entry.worldId)})` : ""}
                      </p>
                      <p className="text-xs text-slate-500">
                        {heroPeriodLabel[entry.period]} · {entry.mockPrice.toLocaleString("ru-RU")} ₽ · {formatDate(entry.startsAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
