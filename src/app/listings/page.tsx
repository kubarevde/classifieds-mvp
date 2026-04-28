import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ListingsPageRoot } from "@/components/listings/listings-page-root";
import { Navbar } from "@/components/layout/navbar";
import { StructuredDataScript } from "@/components/seo/structured-data-script";
import { Container } from "@/components/ui/container";
import { buildBreadcrumbListJsonLd } from "@/lib/seo/breadcrumbs";
import { toCanonicalUrl } from "@/lib/seo/canonical";
import { CatalogWorld, getCategoryOptionsForWorld, getWorldLabel } from "@/lib/listings";
import { buildCollectionPageJsonLd } from "@/lib/seo/structured-data";
import { getWorldPresentation } from "@/lib/worlds";
import { buildPageMetadata } from "@/lib/seo/metadata";

type ListingsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPageMetadata({
  title: "Каталог объявлений - Classify",
  description: "Каталог объявлений по мирам и категориям: находите товары, услуги и магазины в одном поисковом интерфейсе.",
  path: "/listings",
});

function ListingsFiltersFallback() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
      Загружаем фильтры каталога...
    </div>
  );
}

function resolveWorld(raw: string | string[] | undefined): CatalogWorld {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const allowed: CatalogWorld[] = [
    "all",
    "electronics",
    "autos",
    "agriculture",
    "real_estate",
    "jobs",
    "services",
  ];
  if (value && allowed.includes(value as CatalogWorld)) {
    return value as CatalogWorld;
  }
  return "all";
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const world = resolveWorld(params?.world);
  const category = Array.isArray(params?.category) ? params?.category[0] : params?.category;
  const worldPresentation = getWorldPresentation(world);
  const pageTone = worldPresentation.pageToneClass;
  const createHref = world === "all" ? "/create-listing" : `/create-listing?world=${world}`;
  const categoryLabel =
    category && category !== "all"
      ? getCategoryOptionsForWorld(world).find((item) => item.id === category)?.label
      : null;

  return (
    <div className={`min-h-screen ${pageTone}`}>
      <StructuredDataScript
        id="listings-collection-jsonld"
        data={buildCollectionPageJsonLd(
          "Каталог объявлений",
          "Каталог объявлений Classify по мирам и категориям.",
          "/listings",
        )}
      />
      <StructuredDataScript
        id="listings-breadcrumb-jsonld"
        data={buildBreadcrumbListJsonLd([
          { name: "Главная", url: toCanonicalUrl("/") },
          { name: "Каталог", url: toCanonicalUrl("/listings") },
        ])}
      />
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="space-y-4">
          <nav className="flex flex-wrap items-center gap-1 text-xs text-slate-500" aria-label="Breadcrumbs">
            <Link href="/listings" className="font-medium text-slate-600 hover:text-slate-900">
              Каталог
            </Link>
            {world !== "all" ? (
              <>
                <span className="text-slate-300">/</span>
                <Link href={`/worlds/${world}`} className="font-medium text-slate-600 hover:text-slate-900">
                  {getWorldLabel(world)}
                </Link>
              </>
            ) : null}
            {categoryLabel ? (
              <>
                <span className="text-slate-300">/</span>
                <span className="font-medium text-slate-700">{categoryLabel}</span>
              </>
            ) : null}
          </nav>
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Каталог объявлений
              </h1>
              <p className="text-sm text-slate-600 sm:text-base">
                Единый каталог с тематическими мирами и чётким разделением: мир задаёт контекст, категории уточняют тип объявления.
              </p>
            </div>
            <Link
              href={createHref}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 active:scale-[0.99]"
            >
              Разместить объявление
            </Link>
          </header>

          <Suspense fallback={<ListingsFiltersFallback />}>
            <ListingsPageRoot />
          </Suspense>
        </Container>
      </main>
    </div>
  );
}
