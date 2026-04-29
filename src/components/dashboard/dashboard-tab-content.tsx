"use client";

import { useRouter } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

import { AccountLayout, type AccountTab } from "@/components/account/account-layout";
import { useBuyer } from "@/components/buyer/buyer-provider";
import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";
import { FavoritesPageClient } from "@/components/favorites/favorites-page-client";
import { useDemoRole } from "@/components/demo-role/demo-role";
import { MessagesPageClient } from "@/components/messages/messages-page-client";
import { NotificationsPageClient } from "@/components/notifications/notifications-page-client";
import { ProfilePageClient } from "@/components/profile/profile-page-client";
import { BuyerPromotionTab } from "@/components/buyer/buyer-promotion-tab";
import { BuyerSubscriptionTab } from "@/components/buyer/buyer-subscription-tab";
import { SavedSearchesPageClient } from "@/components/saved-searches/saved-searches-page-client";
import { SupportTicketsPanel } from "@/components/support/SupportTicketsPanel";
import { resolveDemoStoreNavSellerId } from "@/lib/demo-role-constants";

export function DashboardTabContent({
  activeTab,
  fromSponsorBoard,
  promoteHeroIntent,
}: {
  activeTab: AccountTab;
  fromSponsorBoard: boolean;
  promoteHeroIntent: boolean;
}) {
  const buyer = useBuyer();
  const router = useRouter();
  const { role, isHydrated } = useDemoRole();
  const didRedirectRef = useRef(false);
  const includePromotionTab = role === "buyer" || role === "all";
  const includeSubscriptionTab = role === "buyer" || role === "all";
  const storeNavSellerId = resolveDemoStoreNavSellerId(role);

  useEffect(() => {
    if (!isHydrated || role !== "seller" || !storeNavSellerId || didRedirectRef.current) {
      return;
    }
    const timer = window.setTimeout(() => {
      didRedirectRef.current = true;
      router.replace(`/dashboard/store?sellerId=${storeNavSellerId}`);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isHydrated, role, router, storeNavSellerId]);

  if (role === "seller") {
    return null;
  }

  return (
    <AccountLayout
      activeTab={activeTab}
      unreadMessages={buyer.unreadCounts.messages}
      unreadNotifications={buyer.unreadCounts.notifications}
      hideDesktopSidebar={activeTab === "messages"}
      includePromotionTab={includePromotionTab}
      includeSubscriptionTab={includeSubscriptionTab}
    >
      {activeTab === "listings" ? (
        <Suspense fallback={<p className="text-sm text-slate-500">Загрузка кабинета…</p>}>
          <DashboardPageClient fromSponsorBoard={fromSponsorBoard} promoteHeroIntent={promoteHeroIntent} />
        </Suspense>
      ) : null}
      {activeTab === "promotion" && includePromotionTab ? <BuyerPromotionTab /> : null}
      {activeTab === "subscription" && includeSubscriptionTab ? <BuyerSubscriptionTab /> : null}
      {activeTab === "favorites" ? <FavoritesPageClient /> : null}
      {activeTab === "saved-searches" ? <SavedSearchesPageClient /> : null}
      {activeTab === "messages" ? (
        <Suspense fallback={<p className="text-sm text-slate-500">Загрузка сообщений…</p>}>
          <MessagesPageClient />
        </Suspense>
      ) : null}
      {activeTab === "notifications" ? <NotificationsPageClient /> : null}
      {activeTab === "support" ? <SupportTicketsPanel /> : null}
      {activeTab === "profile" ? <ProfilePageClient /> : null}
    </AccountLayout>
  );
}
