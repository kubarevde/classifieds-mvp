import { StoreMarketingWorkspace } from "@/components/store-dashboard/store-marketing-workspace";
import HeroBoardManager from "@/components/sponsor-board/hero-board-manager";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { HeroBannerPlacement } from "@/lib/hero-board";
import type {
  MarketingCampaign,
  MarketingCoupon,
  MarketingMenuKey,
  PriceAnalyticsSnapshot,
  SellerDashboardListing,
  SellerPost,
  SellerStorefront,
} from "@/lib/sellers";

import type { StoreSubscriptionTierId } from "@/components/store-dashboard/store-dashboard-shared";
import { useStoreMarketingSectionData } from "@/components/store-dashboard/sections/marketing/StoreMarketingSection.hooks";

type StoreMarketingSectionProps = {
  seller: SellerStorefront;
  currentSubscriptionTier: StoreSubscriptionTierId;
  getSectionClassName: (baseClassName: string, sectionId: string) => string;
  listings: SellerDashboardListing[];
  posts: SellerPost[];
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
  initialMarketingScreen?: MarketingMenuKey;
  initialHeroBoardPlacements: HeroBannerPlacement[];
  onNotify: (message: string) => void;
  onOpenTariffsMessage: () => void;
};

export function StoreMarketingSection({
  seller,
  currentSubscriptionTier,
  getSectionClassName,
  listings,
  posts,
  initialCoupons,
  initialPromotionState,
  initialCampaigns,
  initialPriceAnalytics,
  initialMarketingScreen,
  initialHeroBoardPlacements,
  onNotify,
  onOpenTariffsMessage,
}: StoreMarketingSectionProps) {
  const { effectiveSeller } = useStoreMarketingSectionData(seller, currentSubscriptionTier);

  return (
    <>
      <div
        id="dashboard-store-marketing"
        className={getSectionClassName("rounded-2xl border border-slate-200/90 bg-white", "dashboard-store-marketing")}
      >
        <StoreMarketingWorkspace
          seller={effectiveSeller}
          listings={listings}
          posts={posts}
          initialCoupons={initialCoupons}
          initialPromotionState={initialPromotionState}
          initialCampaigns={initialCampaigns}
          initialPriceAnalytics={initialPriceAnalytics}
          initialScreen={initialMarketingScreen}
          onNotify={onNotify}
          onOpenTariffs={onOpenTariffsMessage}
        />
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Герой доски магазина</h2>
          <p className="mt-1 text-sm text-slate-600">
            Отдельный модуль управления hero-баннером магазина без перехода на публичную страницу.
          </p>
        </CardHeader>
        <CardContent>
          <HeroBoardManager
            initialPlacements={initialHeroBoardPlacements}
            sellerId={seller.id}
            onSave={() => onNotify("Параметры «Героя доски» сохранены (mock).")}
          />
        </CardContent>
      </Card>
    </>
  );
}
