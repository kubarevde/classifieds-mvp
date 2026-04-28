import type { MetadataRoute } from "next";

import { type CatalogWorld } from "@/lib/listings";
import { storefrontSellers } from "@/lib/sellers";
import { worldPresentationById } from "@/lib/worlds";
import { mockListingsService } from "@/services/listings";
import { mockBuyerRequestsService } from "@/services/requests";
import { getSiteUrl } from "@/lib/seo/canonical";

const BASE_URL = getSiteUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/worlds", "/listings", "/stores", "/requests"];
  const worldSlugs = (Object.keys(worldPresentationById) as CatalogWorld[]).filter((world) => world !== "all");
  const listings = await mockListingsService.getAll();
  const requests = await mockBuyerRequestsService.getBuyerRequests({ status: "active" });

  return [
    ...staticRoutes.map((path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...worldSlugs.map((slug) => ({
      url: `${BASE_URL}/worlds/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...storefrontSellers.map((seller) => ({
      url: `${BASE_URL}/stores/${seller.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...listings.map((listing) => ({
      url: `${BASE_URL}/listings/${listing.id}`,
      lastModified: new Date(listing.postedAtIso),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...requests.map((request) => ({
      url: `${BASE_URL}/requests/${request.id}`,
      lastModified: new Date(request.createdAt),
      changeFrequency: "daily" as const,
      priority: 0.65,
    })),
  ];
}
