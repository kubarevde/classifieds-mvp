"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AccountLayout, type AccountTab } from "@/components/account/account-layout";
import { useBuyer } from "@/components/buyer/buyer-provider";
import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";
import { FavoritesPageClient } from "@/components/favorites/favorites-page-client";
import { useDemoRole } from "@/components/demo-role/demo-role";
import { MessagesPageClient } from "@/components/messages/messages-page-client";
import { NotificationsPageClient } from "@/components/notifications/notifications-page-client";
import { ProfilePageClient } from "@/components/profile/profile-page-client";
import { BuyerPromotionTab } from "@/components/buyer/buyer-promotion-tab";
import { SavedSearchesPageClient } from "@/components/saved-searches/saved-searches-page-client";
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
  const includePromotionTab = role === "buyer" || role === "all";
  const storeNavSellerId = resolveDemoStoreNavSellerId(role);

  useEffect(() => {
    if (!isHydrated || role !== "seller" || !storeNavSellerId) {
      return;
    }
    router.replace(`/dashboard/store?sellerId=${storeNavSellerId}`);
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
    >
      {activeTab === "listings" ? (
        <DashboardPageClient fromSponsorBoard={fromSponsorBoard} promoteHeroIntent={promoteHeroIntent} />
      ) : null}
      {activeTab === "promotion" && includePromotionTab ? <BuyerPromotionTab /> : null}
      {activeTab === "favorites" ? <FavoritesPageClient /> : null}
      {activeTab === "saved-searches" ? <SavedSearchesPageClient /> : null}
      {activeTab === "messages" ? <MessagesPageClient /> : null}
      {activeTab === "notifications" ? <NotificationsPageClient /> : null}
      {activeTab === "profile" ? <ProfilePageClient /> : null}
    </AccountLayout>
  );
}
