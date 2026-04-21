import Link from "next/link";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/layout/navbar";
import { StorefrontPageClient } from "@/components/sellers/storefront-page-client";
import { Container } from "@/components/ui/container";
import {
  getSellerCoupons,
  getSellerMarketingCampaigns,
  getSellerPinnedPost,
  getSellerPromotionState,
  getSellerPosts,
  getSellerTypeLabel,
  getStorefrontListingsBySellerId,
  getStorefrontSellerById,
} from "@/lib/sellers";

type SellerStorefrontPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SellerStorefrontPage({ params }: SellerStorefrontPageProps) {
  const { id } = await params;
  const seller = getStorefrontSellerById(id);

  if (!seller) {
    notFound();
  }

  const listings = getStorefrontListingsBySellerId(seller.id);
  const posts = getSellerPosts(seller.id);
  const pinnedPost = getSellerPinnedPost(seller.id);
  const coupons = getSellerCoupons(seller.id);
  const promotionState = getSellerPromotionState(seller.id);
  const campaigns = getSellerMarketingCampaigns(seller.id);

  return (
    <div className="min-h-screen bg-slate-50/70">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/listings" className="inline-flex text-sm font-medium text-slate-600 hover:text-slate-900">
              ← Вернуться в каталог
            </Link>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {getSellerTypeLabel(seller.type)}
            </span>
            {seller.worldHint !== "all" ? (
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                Мир: {seller.worldHint === "agriculture" ? "Сельское хозяйство" : "Электроника"}
              </span>
            ) : null}
          </div>

          <StorefrontPageClient
            seller={seller}
            listings={listings}
            posts={posts}
            pinnedPost={pinnedPost}
            coupons={coupons}
            promotionState={promotionState}
            campaigns={campaigns}
          />
        </Container>
      </main>
    </div>
  );
}
