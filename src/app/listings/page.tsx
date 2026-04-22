import Link from "next/link";
import { Suspense } from "react";

import { ListingsPageRoot } from "@/components/listings/listings-page-root";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";
import { CatalogWorld } from "@/lib/listings";
import { getWorldPresentation } from "@/lib/worlds";

type ListingsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

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
  const worldPresentation = getWorldPresentation(world);
  const pageTone = worldPresentation.pageToneClass;
  const createHref = world === "all" ? "/create-listing" : `/create-listing?world=${world}`;

  return (
    <div className={`min-h-screen ${pageTone}`}>
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="space-y-4">
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
