import { notFound } from "next/navigation";

import { DemoRoleGuard } from "@/components/demo-role/demo-role";
import { StoreDashboardPageClient } from "@/components/store-dashboard/store-dashboard-page-client";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";
import { MarketingMenuKey, type SellerDashboardListing } from "@/lib/sellers";
import { getSellerDashboardData, storefrontSellers } from "@/lib/sellers";
import { mockListingsService } from "@/services/listings";

type StoreDashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function resolveSellerId(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value) {
    return value;
  }
  return storefrontSellers[0]?.id ?? "";
}

function resolveMarketingScreen(raw: string | string[] | undefined): MarketingMenuKey | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const allowed: MarketingMenuKey[] = [
    "overview",
    "price_analytics",
    "mailings",
    "coupons",
    "planner",
    "video",
    "sponsored",
    "boosts",
    "hero_board",
  ];
  return value && allowed.includes(value as MarketingMenuKey) ? (value as MarketingMenuKey) : undefined;
}

function resolveSection(raw: string | string[] | undefined): "messages" | "notifications" | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "messages" || value === "notifications") {
    return value;
  }
  return undefined;
}

export default async function StoreDashboardPage({ searchParams }: StoreDashboardPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const sellerId = resolveSellerId(params?.sellerId);
  const initialMarketingScreen = resolveMarketingScreen(params?.marketing);
  const initialSection = resolveSection(params?.section);
  const data = getSellerDashboardData(sellerId);
  const catalogListings = await mockListingsService.getAll();

  if (!data) {
    notFound();
  }
  const listings: SellerDashboardListing[] = data.seller.listingRefs
    .map((reference, index) => {
      const listing = catalogListings.find((item) => item.id === reference.listingId);
      if (!listing) {
        return null;
      }
      const createdAtIso = listing.postedAtIso;
      const updatedAtIso = new Date(
        new Date(createdAtIso).getTime() + Math.max(1, (index + 1) * 2) * 24 * 60 * 60 * 1000,
      ).toISOString();
      const views = 70 + index * 38 + data.seller.id.length * 5;
      const messages = Math.max(1, Math.round(views / 16));
      return {
        ...listing,
        status: reference.status,
        createdAtIso,
        updatedAtIso,
        views,
        messages,
      };
    })
    .filter((listing): listing is SellerDashboardListing => listing !== null);

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="space-y-4">
          <DemoRoleGuard
            allowedRoles={["seller", "all"]}
            title="Кабинет магазина доступен для seller"
            description="В режиме buyer и guest этот раздел скрыт. Переключитесь на seller, чтобы открыть маркетинг, аналитику и управление витриной."
            ctaRoles={["seller"]}
          >
            <header className="space-y-2">
              <p className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                Кабинет магазина
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Управление storefront
              </h1>
              <p className="max-w-3xl text-sm text-slate-600 sm:text-base">
                Операционная панель магазина: объявления, метрики, маркетинг, контент и настройки в одном месте.
              </p>
            </header>

            <StoreDashboardPageClient
              seller={data.seller}
              initialPosts={data.posts}
              initialCoupons={data.coupons}
              initialPromotionState={data.promotionState}
              initialCampaigns={data.campaigns}
              initialPriceAnalytics={data.priceAnalytics}
              initialHeroBoardPlacements={data.heroBoardPlacements}
              initialMarketingScreen={initialMarketingScreen}
              initialSection={initialSection}
              initialListings={listings}
            />
          </DemoRoleGuard>
        </Container>
      </main>
    </div>
  );
}
