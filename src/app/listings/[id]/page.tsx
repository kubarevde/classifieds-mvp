import type { Metadata } from "next";
import { Suspense } from "react";

import { ListingDetailsPageClient } from "@/components/listings/listing-details-page-client";
import { Navbar } from "@/components/layout/navbar";
import { StructuredDataScript } from "@/components/seo/structured-data-script";
import type { Listing, ListingCategory } from "@/lib/types";
import { buildBreadcrumbListJsonLd } from "@/lib/seo/breadcrumbs";
import { generateListingMetadata } from "@/lib/seo/metadata";
import { buildListingProductJsonLd } from "@/lib/seo/structured-data";
import { toCanonicalUrl } from "@/lib/seo/canonical";
import { mockListingsService } from "@/services/listings";

type ListingDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ListingDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await mockListingsService.getById(id);
  if (!listing) {
    return {
      title: "Объявление не найдено - Classify",
      robots: { index: false, follow: false },
    };
  }
  return generateListingMetadata(listing);
}

export default async function ListingDetailsPage({ params }: ListingDetailsPageProps) {
  const { id } = await params;
  const source = await mockListingsService.getById(id);
  const staticListing: Listing | null = source
    ? {
        id: source.id,
        title: source.title,
        price: source.price,
        priceValue: source.priceValue,
        location: source.location,
        publishedAt: source.publishedAt,
        postedAtIso: source.postedAtIso,
        image: source.image,
        condition: source.condition,
        category: source.categoryId as ListingCategory,
        description: source.description,
        sellerName: source.sellerName,
        sellerPhone: source.sellerPhone,
        listingSaleMode: source.listingSaleMode,
      }
    : null;

  return (
    <div className="min-h-screen bg-slate-50/60">
      {source ? (
        <>
          <StructuredDataScript id="listing-product-jsonld" data={buildListingProductJsonLd(source)} />
          <StructuredDataScript
            id="listing-breadcrumb-jsonld"
            data={buildBreadcrumbListJsonLd([
              { name: "Главная", url: toCanonicalUrl("/") },
              { name: "Каталог", url: toCanonicalUrl("/listings") },
              { name: source.title, url: toCanonicalUrl(`/listings/${source.id}`) },
            ])}
          />
        </>
      ) : null}
      <Navbar />
      <Suspense fallback={<main className="py-10 text-center text-sm text-slate-500">Загрузка…</main>}>
        <ListingDetailsPageClient id={id} staticListing={staticListing} />
      </Suspense>
    </div>
  );
}
