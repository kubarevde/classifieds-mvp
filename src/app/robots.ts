import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/seo/canonical";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/create-listing", "/requests/new"],
      },
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
    host: getSiteUrl(),
  };
}

