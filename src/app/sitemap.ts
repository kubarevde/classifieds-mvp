import type { MetadataRoute } from "next";

import { type CatalogWorld } from "@/lib/listings";
import { worldPresentationById } from "@/lib/worlds";

const BASE_URL = "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/worlds", "/listings", "/create-listing", "/stores", "/dashboard"];
  const worldSlugs = (Object.keys(worldPresentationById) as CatalogWorld[]).filter((world) => world !== "all");

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
  ];
}
