import type { BuyerRequest } from "@/entities/requests/model";
import type { SellerStorefront } from "@/entities/seller/model";
import type { UnifiedCatalogListing } from "@/lib/listings";

import { toCanonicalUrl } from "./canonical";

export function buildListingProductJsonLd(listing: UnifiedCatalogListing, sellerName?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description || `${listing.categoryLabel} в ${listing.location}`,
    image: [toCanonicalUrl("/icons/icon-512.svg")],
    category: listing.categoryLabel,
    offers: {
      "@type": "Offer",
      priceCurrency: "RUB",
      price: String(listing.priceValue),
      availability: "https://schema.org/InStock",
      url: toCanonicalUrl(`/listings/${listing.id}`),
    },
    seller: {
      "@type": "Organization",
      name: sellerName ?? listing.sellerName,
    },
  };
}

export function buildStoreJsonLd(store: SellerStorefront) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: store.storefrontName,
    description: store.shortDescription,
    areaServed: store.city,
    telephone: store.phone,
    url: toCanonicalUrl(`/stores/${store.id}`),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(store.metrics.rating),
      reviewCount: String(Math.max(1, store.followersCount)),
    },
  };
}

export function buildCollectionPageJsonLd(title: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: toCanonicalUrl(path),
  };
}

export function buildRequestPageJsonLd(request: BuyerRequest) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: request.title,
    description: request.description,
    url: toCanonicalUrl(`/requests/${request.id}`),
    about: request.tags,
  };
}

