import type { Metadata } from "next";

import { Navbar } from "@/components/layout/navbar";
import { StructuredDataScript } from "@/components/seo/structured-data-script";
import { StoresPageClient } from "@/components/stores/stores-page-client";
import { Container } from "@/components/ui/container";
import { buildBreadcrumbListJsonLd } from "@/lib/seo/breadcrumbs";
import { toCanonicalUrl } from "@/lib/seo/canonical";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildCollectionPageJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = buildPageMetadata({
  title: "Магазины - Classify",
  description: "Проверенные магазины с рейтингом, отзывами и каталогом объявлений.",
  path: "/stores",
});

export default function StoresPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <StructuredDataScript
        id="stores-collection-jsonld"
        data={buildCollectionPageJsonLd(
          "Магазины",
          "Каталог магазинов Classify.",
          "/stores",
        )}
      />
      <StructuredDataScript
        id="stores-breadcrumb-jsonld"
        data={buildBreadcrumbListJsonLd([
          { name: "Главная", url: toCanonicalUrl("/") },
          { name: "Магазины", url: toCanonicalUrl("/stores") },
        ])}
      />
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container>
          <StoresPageClient />
        </Container>
      </main>
    </div>
  );
}
