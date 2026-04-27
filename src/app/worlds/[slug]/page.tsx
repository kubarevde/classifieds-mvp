import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/layout/navbar";
import { WorldPageClient } from "@/components/worlds/world-page-client";
import { type CatalogWorld } from "@/lib/listings";
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
    return { title: "Мир не найден" };
  }
  const presentation = getWorldPresentation(world);
  return {
    title: `${presentation.title} - мир объявлений Classify`,
    description: `${presentation.subtitle}. Сообщество, витрины и каталог мира ${presentation.title.toLowerCase()}.`,
    openGraph: {
      title: `${presentation.title} - мир объявлений`,
      description: presentation.heroDescription,
      images: [
        {
          url: `/og/worlds/${world}.png`,
          width: 1200,
          height: 630,
          alt: `Мир ${presentation.title}`,
        },
      ],
    },
  };
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
      <Navbar />
      <main>
        <WorldPageClient world={world} listings={listings} stores={stores} />
      </main>
    </div>
  );
}
