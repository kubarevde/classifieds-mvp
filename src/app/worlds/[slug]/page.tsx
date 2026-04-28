import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/layout/navbar";
import { StructuredDataScript } from "@/components/seo/structured-data-script";
import { WorldPageClient } from "@/components/worlds/world-page-client";
import { type CatalogWorld } from "@/lib/listings";
import { buildBreadcrumbListJsonLd } from "@/lib/seo/breadcrumbs";
import { toCanonicalUrl } from "@/lib/seo/canonical";
import { generateWorldMetadata } from "@/lib/seo/metadata";
import { buildCollectionPageJsonLd } from "@/lib/seo/structured-data";
import { storefrontSellers } from "@/lib/sellers";
import { getWorldPresentation, worldPresentationById } from "@/lib/worlds";
import { mockListingsService } from "@/services/listings";

type WorldPageProps = {
  params: Promise<{ slug: string }>;
};

const WORLD_SLUGS = (Object.keys(worldPresentationById) as CatalogWorld[]).filter(
  (world): world is Exclude<CatalogWorld, "all"> => world !== "all",
);

function toWorldSlug(value: string): Exclude<CatalogWorld, "all"> | null {
  if (WORLD_SLUGS.includes(value as Exclude<CatalogWorld, "all">)) {
    return value as Exclude<CatalogWorld, "all">;
  }
  return null;
}

export function generateStaticParams() {
  return WORLD_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: WorldPageProps): Promise<Metadata> {
  const { slug } = await params;
  const world = toWorldSlug(slug);
  if (!world) {
    return { title: "Мир не найден - Classify", robots: { index: false, follow: false } };
  }
  return generateWorldMetadata(world);
}

export default async function WorldPage({ params }: WorldPageProps) {
  const { slug } = await params;
  const world = toWorldSlug(slug);
  if (!world) {
    notFound();
  }

  const listings = await mockListingsService.getAll({ world });
  const stores = storefrontSellers.filter((seller) => seller.worldHint === world || seller.worldHint === "all");

  return (
    <div className="min-h-screen bg-slate-50/70">
      <StructuredDataScript
        id="world-collection-jsonld"
        data={buildCollectionPageJsonLd(
          getWorldPresentation(world).title,
          getWorldPresentation(world).subtitle,
          `/worlds/${world}`,
        )}
      />
      <StructuredDataScript
        id="world-breadcrumb-jsonld"
        data={buildBreadcrumbListJsonLd([
          { name: "Главная", url: toCanonicalUrl("/") },
          { name: "Миры", url: toCanonicalUrl("/worlds") },
          { name: getWorldPresentation(world).title, url: toCanonicalUrl(`/worlds/${world}`) },
        ])}
      />
      <Navbar />
      <main>
        <WorldPageClient world={world} listings={listings} stores={stores} />
      </main>
    </div>
  );
}
