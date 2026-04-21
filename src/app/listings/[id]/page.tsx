import Link from "next/link";
import { notFound } from "next/navigation";

import { ListingDetails } from "@/components/listings/listing-details";
import { ListingPreviewCard } from "@/components/listings/listing-preview-card";
import { SellerCard } from "@/components/listings/seller-card";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";
import { allListings, getRelatedListings } from "@/lib/listings";

type ListingDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingDetailsPage({ params }: ListingDetailsPageProps) {
  const { id } = await params;
  const listing = allListings.find((currentListing) => currentListing.id === id);

  if (!listing) {
    notFound();
  }

  const relatedListings = getRelatedListings(listing, 4);

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="space-y-4">
          <Link href="/listings" className="inline-flex text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Вернуться в каталог
          </Link>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <ListingDetails listing={listing} />
            <SellerCard
              sellerName={listing.sellerName}
              sellerPhone={listing.sellerPhone}
              listingId={listing.id}
              listingTitle={listing.title}
            />
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Похожие объявления</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {relatedListings.map((relatedListing) => (
                <ListingPreviewCard key={relatedListing.id} listing={relatedListing} view="grid" />
              ))}
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}
