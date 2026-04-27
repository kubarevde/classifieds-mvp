import { ListingDetailsPageClient } from "@/components/listings/listing-details-page-client";
import { Navbar } from "@/components/layout/navbar";
import type { Listing, ListingCategory } from "@/lib/types";
import { mockListingsService } from "@/services/listings";

type ListingDetailsPageProps = {
  params: Promise<{ id: string }>;
};

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
      <Navbar />
      <ListingDetailsPageClient id={id} staticListing={staticListing} />
    </div>
  );
}
