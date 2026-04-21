import Link from "next/link";
import { Suspense } from "react";

import { ListingsPageRoot } from "@/components/listings/listings-page-root";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";

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

function resolveWorld(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "agriculture" || value === "electronics") {
    return value;
  }
  return "all";
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const world = resolveWorld(params?.world);
  const pageTone =
    world === "agriculture"
      ? "bg-[radial-gradient(circle_at_top,#f4faef_0%,#eef6e8_50%,#f3ecdf_100%)]"
      : world === "electronics"
        ? "bg-[radial-gradient(circle_at_top,#edf2f9_0%,#e6edf6_45%,#dde6f1_100%)]"
        : "bg-slate-50/60";
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
                Единый каталог с тематическими контекстами: все объявления, сельское хозяйство и электроника.
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
