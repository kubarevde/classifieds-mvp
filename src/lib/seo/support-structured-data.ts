import type { HelpArticle } from "@/services/support";

import { toCanonicalUrl } from "./canonical";

export function buildFaqPageJsonLd(categorySlug: string, articles: HelpArticle[]) {
  const slice = articles.slice(0, 5);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: slice.map((article) => ({
      "@type": "Question",
      name: article.title,
      acceptedAnswer: {
        "@type": "Answer",
        text: article.summary,
      },
    })),
    url: toCanonicalUrl(`/support/${categorySlug}`),
  };
}

export function buildHelpArticleJsonLd(article: HelpArticle) {
  const url = toCanonicalUrl(`/support/${article.categorySlug}/${article.slug}`);
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
