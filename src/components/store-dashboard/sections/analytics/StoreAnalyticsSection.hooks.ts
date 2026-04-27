import { useMemo } from "react";

import {
  mockTrafficSourcesForSeller,
  stableSellerHash,
  subscriptionTierPresentation,
  type StoreSubscriptionTierId,
} from "@/components/store-dashboard/store-dashboard-shared";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import type { MarketingCoupon } from "@/lib/sellers";
import type { SellerDashboardListing, SellerStorefront } from "@/lib/sellers";

type UseStoreAnalyticsSectionParams = {
  seller: SellerStorefront;
  listings: SellerDashboardListing[];
  initialCoupons: MarketingCoupon[];
  currentSubscriptionTier: StoreSubscriptionTierId;
  nextSubscriptionTier: StoreSubscriptionTierId | null;
};

export function useStoreAnalyticsSectionData({
  seller,
  listings,
  initialCoupons,
  currentSubscriptionTier,
  nextSubscriptionTier,
}: UseStoreAnalyticsSectionParams) {
  const { canUse } = useFeatureGate();

  const counts = useMemo(
    () => ({
      all: listings.length,
      active: listings.filter((listing) => listing.status === "active").length,
      inactive: listings.filter((listing) => listing.status === "hidden" || listing.status === "archived")
        .length,
    }),
    [listings],
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
      .sort((a, b) => b.messages / Math.max(1, b.views) - a.messages / Math.max(1, a.views))
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
    if (!canUse("store_analytics_advanced")) {
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
  }, [canUse, counts.active, initialCoupons, nextSubscriptionTier]);

  const currentTierPresentation = subscriptionTierPresentation[currentSubscriptionTier];

  return {
    mockTrafficSources,
    loyaltyStats,
    topPerformingListings,
    risingListings,
    improvementNotes,
    assistantTips,
    currentTierPresentation,
  };
}
