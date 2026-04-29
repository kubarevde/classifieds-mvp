import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Navbar } from "@/components/layout/navbar";
import { RequestsBoardClient } from "@/components/requests/RequestsBoardClient";
import { StructuredDataScript } from "@/components/seo/structured-data-script";
import { Container } from "@/components/ui/container";
import { parseIntentFromSearchParams } from "@/lib/saved-searches";
import { buildCreateRequestHrefFromIntent } from "@/services/requests/intent-adapter";
import { mockBuyerRequestsService } from "@/services/requests";
import { buildBreadcrumbListJsonLd } from "@/lib/seo/breadcrumbs";
import { toCanonicalUrl } from "@/lib/seo/canonical";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildCollectionPageJsonLd } from "@/lib/seo/structured-data";

type RequestsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPageMetadata({
  title: "Запросы - Classify",
  description: "Доска запросов: публикуйте запросы и получайте отклики от продавцов и магазинов.",
  path: "/requests",
});

export default async function RequestsPage({ searchParams }: RequestsPageProps) {
  const requests = await mockBuyerRequestsService.getBuyerRequests();
  const params = searchParams ? await searchParams : undefined;
  const url = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        value.forEach((item) => url.append(key, item));
      } else if (typeof value === "string") {
        url.set(key, value);
      }
    }
  }
  const intent = parseIntentFromSearchParams(url);
  if (intent && intent.target === "listing") {
    redirect(buildCreateRequestHrefFromIntent(intent));
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StructuredDataScript
        id="requests-collection-jsonld"
        data={buildCollectionPageJsonLd(
          "Запросы",
          "Публичная доска запросов с откликами продавцов.",
          "/requests",
        )}
      />
      <StructuredDataScript
        id="requests-breadcrumb-jsonld"
        data={buildBreadcrumbListJsonLd([
          { name: "Главная", url: toCanonicalUrl("/") },
          { name: "Запросы", url: toCanonicalUrl("/requests") },
        ])}
      />
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="space-y-4">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Запросы</h1>
            <p className="max-w-3xl text-sm text-slate-600 sm:text-base">
              Reverse marketplace слой: разместите запрос и получите структурированные отклики от продавцов и магазинов.
            </p>
          </header>
          <RequestsBoardClient initialRequests={requests} />
        </Container>
      </main>
    </div>
  );
}

