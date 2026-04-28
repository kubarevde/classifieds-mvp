"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { FormEvent, useState } from "react";
import { CircleHelp } from "lucide-react";

import { InlineNotice } from "@/components/platform";
import { useSubscription } from "@/components/subscription/subscription-provider";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { SellerMessagesPanel } from "@/components/store-dashboard/seller-messages-panel";
import { SellerNotificationsPanel } from "@/components/store-dashboard/seller-notifications-panel";
import { useSellerActivity } from "@/components/seller/use-seller-activity";
import { StoreListingsSection } from "@/components/store-dashboard/sections/listings/StoreListingsSection";
import { StoreOverviewSection } from "@/components/store-dashboard/sections/overview/StoreOverviewSection";
import { ErrorBoundary } from "@/components/platform";
import { StoreSettingsSection } from "@/components/store-dashboard/sections/settings/StoreSettingsSection";
import {
  onboardingSteps,
  type ListingFilter,
  type PostFormState,
  type StoreDashboardPageClientProps,
  type StoreSettingsForm,
} from "@/components/store-dashboard/store-dashboard-shared";
import { useStoreDashboardModals } from "@/components/store-dashboard/useStoreDashboardModals";
import type { SellerPost } from "@/lib/sellers";

export type { StoreDashboardPageClientProps } from "@/components/store-dashboard/store-dashboard-shared";

const StoreAnalyticsSection = dynamic(
  () => import("@/components/store-dashboard/sections/analytics/StoreAnalyticsSection").then((mod) => mod.StoreAnalyticsSection),
  { loading: () => <div className="h-72 animate-pulse rounded-2xl bg-slate-200" /> },
);

const StoreMarketingSection = dynamic(
  () => import("@/components/store-dashboard/sections/marketing/StoreMarketingSection").then((mod) => mod.StoreMarketingSection),
  { loading: () => <div className="h-72 animate-pulse rounded-2xl bg-slate-200" /> },
);

const StoreReputationSection = dynamic(
  () => import("@/components/store-dashboard/sections/reputation/StoreReputationSection").then((mod) => mod.StoreReputationSection),
  { loading: () => <div className="h-72 animate-pulse rounded-2xl bg-slate-200" /> },
);

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
  initialSection,
}: StoreDashboardPageClientProps) {
  const sellerActivity = useSellerActivity();
  const subscription = useSubscription();
  const { getLimit } = useFeatureGate();
  const [listings, setListings] = useState(initialListings);
  const [posts, setPosts] = useState(initialPosts);
  const [filter, setFilter] = useState<ListingFilter>("all");
  const [message, setMessage] = useState<string | null>(null);
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

  const {
    isTariffModalOpen,
    setIsTariffModalOpen,
    isTourOpen,
    tourStepIndex,
    setTourStepIndex,
    activeTourStep,
    closeTour,
    completeTour,
    launchTour,
    getSectionClassName,
  } = useStoreDashboardModals(seller.id);

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

  const baseStoreHref = `/dashboard/store?sellerId=${seller.id}`;
  const currentSubscriptionTier = subscription.storePlan;

  if (initialSection === "messages") {
    return (
      <div className="space-y-4">
        <Link
          href={baseStoreHref}
          className="inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          ← Назад в кабинет
        </Link>
        <SellerMessagesPanel onUnreadChange={sellerActivity.setMessagesUnreadCount} />
      </div>
    );
  }

  if (initialSection === "notifications") {
    return (
      <div className="space-y-4">
        <Link
          href={baseStoreHref}
          className="inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          ← Назад в кабинет
        </Link>
        <SellerNotificationsPanel onUnreadChange={sellerActivity.setNotificationsUnreadCount} />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex justify-start sm:justify-end">
        <button
          type="button"
          onClick={launchTour}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:h-9 sm:w-auto sm:justify-start sm:text-xs"
        >
          <CircleHelp className="mr-1.5 h-4 w-4" strokeWidth={1.5} />
          Как это работает
        </button>
      </div>

      {message ? <InlineNotice type="success" title={message} /> : null}

      <StoreOverviewSection
        seller={seller}
        listings={listings}
        currentSubscriptionTier={currentSubscriptionTier}
        getSectionClassName={getSectionClassName}
        onOpenTariffModal={() => setIsTariffModalOpen(true)}
        subscription={subscription}
      />

      <ErrorBoundary context="store-analytics-section" fallback={<div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Раздел аналитики временно недоступен.</div>}>
        <StoreAnalyticsSection seller={seller} listings={listings} />
      </ErrorBoundary>

      <StoreListingsSection
        seller={seller}
        listings={listings}
        filter={filter}
        onFilterChange={setFilter}
        getSectionClassName={getSectionClassName}
        onToggleListingVisibility={toggleListingVisibility}
        onShowMockMessage={showMockMessage}
        listingSoftLimit={getLimit("listing_create")}
      />

      <ErrorBoundary context="store-marketing-section" fallback={<div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Маркетинговый блок временно недоступен.</div>}>
        <StoreMarketingSection
          seller={seller}
          currentSubscriptionTier={currentSubscriptionTier}
          getSectionClassName={getSectionClassName}
          listings={listings}
          posts={posts}
          initialCoupons={initialCoupons}
          initialPromotionState={initialPromotionState}
          initialCampaigns={initialCampaigns}
          initialPriceAnalytics={initialPriceAnalytics}
          initialMarketingScreen={initialMarketingScreen}
          initialHeroBoardPlacements={initialHeroBoardPlacements}
          onNotify={showMockMessage}
          onOpenTariffsMessage={() => showMockMessage("Откройте раздел «Подписка магазина», чтобы посмотреть тарифы.")}
        />
      </ErrorBoundary>

      <ErrorBoundary context="store-reputation-section" fallback={<div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Репутационный блок временно недоступен.</div>}>
        <StoreReputationSection sellerId={seller.id} />
      </ErrorBoundary>

      <StoreSettingsSection
        getSectionClassName={getSectionClassName}
        posts={posts}
        isPostFormVisible={isPostFormVisible}
        onTogglePostForm={() => setIsPostFormVisible((current) => !current)}
        postForm={postForm}
        onPostFormChange={setPostForm}
        onPostCreate={handlePostCreate}
        settings={settings}
        onSettingsChange={setSettings}
        onSettingsSave={handleSettingsSave}
        onShowMockMessage={showMockMessage}
        tourModal={{
          isOpen: isTourOpen,
          tourStepIndex,
          activeTourStep,
          onClose: closeTour,
          onBack: () => setTourStepIndex((prev) => Math.max(0, prev - 1)),
          onNextOrComplete: () => {
            if (tourStepIndex === onboardingSteps.length - 1) {
              completeTour();
              return;
            }
            setTourStepIndex((prev) => Math.min(onboardingSteps.length - 1, prev + 1));
          },
        }}
        tariffModal={{
          isOpen: isTariffModalOpen,
          onClose: () => setIsTariffModalOpen(false),
        }}
      />
    </div>
  );
}
