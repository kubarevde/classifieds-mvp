import { notFound } from "next/navigation";

import { StoreDashboardPageClient } from "@/components/store-dashboard/store-dashboard-page-client";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";
import { MarketingMenuKey } from "@/lib/sellers";
import { getSellerDashboardData, storefrontSellers } from "@/lib/sellers";

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

export default async function StoreDashboardPage({ searchParams }: StoreDashboardPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const sellerId = resolveSellerId(params?.sellerId);
  const initialMarketingScreen = resolveMarketingScreen(params?.marketing);
  const data = getSellerDashboardData(sellerId);

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="space-y-4">
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
            initialListings={data.listings}
            initialPosts={data.posts}
            initialCoupons={data.coupons}
            initialPromotionState={data.promotionState}
            initialCampaigns={data.campaigns}
            initialPriceAnalytics={data.priceAnalytics}
            initialHeroBoardPlacements={data.heroBoardPlacements}
            initialMarketingScreen={initialMarketingScreen}
          />
        </Container>
      </main>
    </div>
  );
}
