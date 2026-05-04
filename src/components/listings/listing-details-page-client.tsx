"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useBuyer } from "@/components/buyer/buyer-provider";
import { ListingOfferSheet } from "@/components/deals/ListingOfferSheet";
import { useDemoRole } from "@/components/demo-role/demo-role";
import { Container } from "@/components/ui/container";
import { ErrorBoundary } from "@/components/platform";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/components/ui/cn";
import { buttonVariants } from "@/lib/button-styles";
import { DEMO_BUYER_USER_ID } from "@/lib/messages-actors";
import { getStorefrontSellerByListingId } from "@/lib/sellers";
import type { Listing } from "@/lib/types";
import { useListings } from "@/hooks/data/use-listings";
import { mockAuctionService } from "@/services/auctions";
import { sanitizeReturnTo } from "@/lib/navigation/return-to";
import { usePublishedListing } from "@/hooks/data/use-published-listings-cache";

import { ListingDetails } from "./listing-details";
import { ListingPreviewCard } from "./listing-preview-card";
import { SellerCard } from "./seller-card";

const AuctionDetailPanel = dynamic(
  () => import("@/components/auctions/AuctionDetailPanel").then((mod) => mod.AuctionDetailPanel),
  {
    loading: () => <div className="h-[420px] animate-pulse rounded-2xl bg-slate-200" />,
    ssr: false,
  },
);

type ListingDetailsPageClientProps = {
  id: string;
  staticListing: Listing | null;
};

export function ListingDetailsPageClient({ id, staticListing }: ListingDetailsPageClientProps) {
  const router = useRouter();
  const buyer = useBuyer();
  const { role, currentSellerId } = useDemoRole();
  const [auction, setAuction] = useState<Awaited<ReturnType<typeof mockAuctionService.getByListing>>>(null);
  const [offerOpen, setOfferOpen] = useState(false);
  const { data: catalogListings } = useListings();
  const published = usePublishedListing(id);
  const listing = staticListing ?? published;
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"));

  useEffect(() => {
    if (searchParams.get("posted") === "1") {
      showToast("Объявление успешно опубликовано", "success");
      const next = new URL(window.location.href);
      next.searchParams.delete("posted");
      window.history.replaceState({}, "", `${next.pathname}${next.search}`);
    }
  }, [searchParams, showToast]);

  const relatedListings = useMemo(() => {
    if (!listing) {
      return [];
    }
    const byCategory = catalogListings.filter(
      (current) => current.id !== listing.id && current.categoryId === listing.category,
    );
    const fromOtherCategories = catalogListings.filter(
      (current) => current.id !== listing.id && current.categoryId !== listing.category,
    );
    return [...byCategory, ...fromOtherCategories].slice(0, 4);
  }, [catalogListings, listing]);
  useEffect(() => {
    let cancelled = false;
    if (!listing || listing.listingSaleMode !== "auction") {
      return;
    }
    void (async () => {
      const value = await mockAuctionService.getByListing(listing.id);
      if (!cancelled) {
        setAuction(value);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [listing]);

  const storefrontSeller = listing ? getStorefrontSellerByListingId(listing.id) : null;

  const isOwner = useMemo(() => {
    if (!listing) return false;
    if (buyer.myListings.some((l) => l.id === listing.id)) return true;
    if (storefrontSeller && (role === "seller" || role === "all") && currentSellerId === storefrontSeller.id) {
      return true;
    }
    return false;
  }, [buyer.myListings, currentSellerId, listing, role, storefrontSeller]);

  const showOfferCta = useMemo(() => {
    if (!listing) return false;
    return !auction && Boolean(storefrontSeller) && listing.listingSaleMode !== "auction" && !isOwner;
  }, [auction, isOwner, listing, storefrontSeller]);

  if (!listing) {
    return (
      <main className="py-6 sm:py-8">
        <Container className="space-y-4">
          <Link href="/listings" className="inline-flex text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Вернуться в каталог
          </Link>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-slate-900">Объявление не найдено</h1>
            <p className="mt-2 text-sm text-slate-600">
              Возможно, ссылка устарела или карточка ещё не попала в каталог.
            </p>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-6 sm:py-8">
      <Container className="space-y-4">
        {returnTo ? (
          <Link href={returnTo} className="inline-flex text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Вернуться в каталог
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
                return;
              }
              router.push("/listings");
            }}
            className="inline-flex text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Вернуться в каталог
          </button>
        )}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <ListingDetails
            listing={listing}
            sellerId={storefrontSeller?.id ?? null}
            sellerMemberSinceYear={storefrontSeller?.memberSinceYear}
          />
          <div className="space-y-3">
            {auction ? (
              <ErrorBoundary
                context="auction-detail-panel"
                fallback={<div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Панель аукциона временно недоступна.</div>}
              >
                <AuctionDetailPanel auction={auction} />
              </ErrorBoundary>
            ) : (
              <SellerCard
                sellerName={listing.sellerName}
                sellerPhone={listing.sellerPhone}
                listingId={listing.id}
                storefront={storefrontSeller}
              />
            )}
            {showOfferCta && storefrontSeller ? (
              <>
                <button
                  type="button"
                  className={cn(buttonVariants({ variant: "primary", size: "md" }), "w-full rounded-xl")}
                  onClick={() => setOfferOpen(true)}
                >
                  Предложить цену
                </button>
                <ListingOfferSheet
                  open={offerOpen}
                  onOpenChange={setOfferOpen}
                  listingId={listing.id}
                  listingTitle={listing.title}
                  referencePrice={listing.priceValue}
                  buyerId={DEMO_BUYER_USER_ID}
                  sellerAccountId={`seller-account:${storefrontSeller.id}`}
                  onSubmitted={(threadId) => {
                    showToast("Предложение отправлено — открываем чат", "success");
                    router.push(`/messages?thread=${encodeURIComponent(threadId)}`);
                  }}
                />
              </>
            ) : null}
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Похожие объявления</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {relatedListings.map((relatedListing) => (
              <ListingPreviewCard key={relatedListing.id} listing={relatedListing} view="grid" />
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
