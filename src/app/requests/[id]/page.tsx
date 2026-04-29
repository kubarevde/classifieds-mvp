import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/layout/navbar";
import { RequestDetailsClient } from "@/components/requests/RequestDetailsClient";
import { StructuredDataScript } from "@/components/seo/structured-data-script";
import { Container } from "@/components/ui/container";
import { buildBreadcrumbListJsonLd } from "@/lib/seo/breadcrumbs";
import { toCanonicalUrl } from "@/lib/seo/canonical";
import { generateRequestMetadata } from "@/lib/seo/metadata";
import { buildRequestPageJsonLd } from "@/lib/seo/structured-data";
import { mockBuyerRequestsService } from "@/services/requests";

type RequestDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: RequestDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const request = await mockBuyerRequestsService.getBuyerRequestById(id, { incrementView: false });
  if (!request) {
    return {
      title: "Запрос не найден - Classify",
      robots: { index: false, follow: false },
    };
  }
  return generateRequestMetadata(request);
}

export default async function RequestDetailsPage({ params }: RequestDetailsPageProps) {
  const { id } = await params;
  const request = await mockBuyerRequestsService.getBuyerRequestById(id);
  if (!request) {
    notFound();
  }
  const responses = await mockBuyerRequestsService.getResponsesForRequest(id);

  return (
    <div className="min-h-screen bg-slate-50">
      <StructuredDataScript id="request-page-jsonld" data={buildRequestPageJsonLd(request)} />
      <StructuredDataScript
        id="request-breadcrumb-jsonld"
        data={buildBreadcrumbListJsonLd([
          { name: "Главная", url: toCanonicalUrl("/") },
          { name: "Запросы", url: toCanonicalUrl("/requests") },
          { name: request.title, url: toCanonicalUrl(`/requests/${request.id}`) },
        ])}
      />
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container>
          <RequestDetailsClient request={request} initialResponses={responses} />
        </Container>
      </main>
    </div>
  );
}

