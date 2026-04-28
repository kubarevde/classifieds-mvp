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
  description: "Проверенные магазины и витрины продавцов с рейтингом, отзывами и каталогом объявлений.",
  path: "/stores",
});

export default function StoresPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fafc_0%,#f2f5f9_55%,#f6f7f9_100%)]">
      <StructuredDataScript
        id="stores-collection-jsonld"
        data={buildCollectionPageJsonLd(
          "Магазины",
          "Каталог магазинов и витрин продавцов Classify.",
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
