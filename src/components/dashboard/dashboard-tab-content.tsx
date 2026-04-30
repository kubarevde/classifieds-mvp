"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

import { AccountLayout, type AccountTab } from "@/components/account/account-layout";
import { useBuyer } from "@/components/buyer/buyer-provider";
import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";
import { FavoritesPageClient } from "@/components/favorites/favorites-page-client";
import { useDemoRole } from "@/components/demo-role/demo-role";
import { MessagesSplitView } from "@/components/messages/messages-split-view";
import { NotificationsPageClient } from "@/components/notifications/notifications-page-client";
import { ProfilePageClient } from "@/components/profile/profile-page-client";
import { BuyerPromotionTab } from "@/components/buyer/buyer-promotion-tab";
import { BuyerSubscriptionTab } from "@/components/buyer/buyer-subscription-tab";
import { SavedSearchesPageClient } from "@/components/saved-searches/saved-searches-page-client";
import { SupportTicketsPanel } from "@/components/support/SupportTicketsPanel";
import { resolveDemoStoreNavSellerId } from "@/lib/demo-role-constants";
import { resolveActorIdsForRole } from "@/lib/messages-actors";
import { messagesService } from "@/services/messages";

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
  const searchParams = useSearchParams();
  const { role, isHydrated } = useDemoRole();
  const didRedirectRef = useRef(false);
  const includePromotionTab = role === "buyer" || role === "all";
  const includeSubscriptionTab = role === "buyer" || role === "all";
  const storeNavSellerId = resolveDemoStoreNavSellerId(role);
  const actorIds = useMemo(() => resolveActorIdsForRole(role, storeNavSellerId), [role, storeNavSellerId]);
  const [messagesUnread, setMessagesUnread] = useState(0);

  useEffect(() => {
    if (actorIds.length === 0) {
      return;
    }
    let alive = true;
    void Promise.all(actorIds.map((id) => messagesService.getUnreadCount(id))).then((counts) => {
      if (!alive) return;
      setMessagesUnread(counts.reduce((sum, x) => sum + x, 0));
    });
    return () => {
      alive = false;
    };
  }, [actorIds]);

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
      unreadMessages={actorIds.length === 0 ? 0 : messagesUnread}
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
        <MessagesSplitView
          actorIds={actorIds}
          title="Сообщения"
          subtitle="Общайтесь с продавцами по объявлениям, запросам и заказам."
          fullscreenHref="/messages?from=dashboard"
          backHref="/dashboard"
          backLabel="Назад в кабинет"
          selectedThreadId={searchParams.get("thread")}
          onSelectedThreadChange={(threadId) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("tab", "messages");
            if (threadId) params.set("thread", threadId);
            else params.delete("thread");
            router.replace(`/dashboard?${params.toString()}`);
          }}
        />
      ) : null}
      {activeTab === "notifications" ? <NotificationsPageClient /> : null}
      {activeTab === "support" ? <SupportTicketsPanel /> : null}
      {activeTab === "profile" ? <ProfilePageClient /> : null}
    </AccountLayout>
  );
}
