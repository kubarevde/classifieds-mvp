import type { SafetyGuideArticle } from "@/services/safety";

import { toCanonicalUrl } from "./canonical";

export function buildSafetyGuideJsonLd(article: SafetyGuideArticle) {
  const url = toCanonicalUrl(`/safety/guide/${article.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    url,
    dateModified: new Date().toISOString().slice(0, 10),
    author: {
      "@type": "Organization",
      name: "Classify",
    },
    publisher: {
      "@type": "Organization",
      name: "Classify",
    },
  };
}
