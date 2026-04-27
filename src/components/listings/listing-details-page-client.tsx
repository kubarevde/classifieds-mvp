"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Container } from "@/components/ui/container";
import { AuctionDetailPanel } from "@/components/auctions/AuctionDetailPanel";
import { useToast } from "@/components/ui/toast";
import { getStorefrontSellerByListingId } from "@/lib/sellers";
import type { Listing } from "@/lib/types";
import { mockAuctionService } from "@/services/auctions";
import { mockListingsService } from "@/services/listings";
import { sanitizeReturnTo } from "@/lib/navigation/return-to";
import { usePublishedListingStore } from "@/stores/published-listing-store";

import { ListingDetails } from "./listing-details";
import { ListingPreviewCard } from "./listing-preview-card";
import { SellerCard } from "./seller-card";

type ListingDetailsPageClientProps = {
  id: string;
  staticListing: Listing | null;
};

export function ListingDetailsPageClient({ id, staticListing }: ListingDetailsPageClientProps) {
  const router = useRouter();
  const [auction, setAuction] = useState<Awaited<ReturnType<typeof mockAuctionService.getByListing>>>(null);
  const [catalogListings, setCatalogListings] = useState<Awaited<ReturnType<typeof mockListingsService.getAll>>>([]);
  const published = usePublishedListingStore((state) => state.listings[id] ?? null);
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

  useEffect(() => {
    let cancelled = false;
    void mockListingsService.getAll().then((items) => {
      if (!cancelled) {
        setCatalogListings(items);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
          <ListingDetails listing={listing} />
          {auction ? (
            <AuctionDetailPanel auction={auction} />
          ) : (
            <SellerCard
              sellerName={listing.sellerName}
              sellerPhone={listing.sellerPhone}
              listingId={listing.id}
              listingTitle={listing.title}
              storefront={storefrontSeller}
            />
          )}
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
