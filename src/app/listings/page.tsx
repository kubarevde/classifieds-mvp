import Link from "next/link";

import { ListingsPageClient } from "@/components/listings/listings-page-client";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";

export default function ListingsPage() {
  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="space-y-4">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Каталог объявлений
              </h1>
              <p className="text-sm text-slate-600 sm:text-base">
                Подберите нужное объявление по категории, городу и цене.
              </p>
            </div>
            <Link
              href="/create-listing"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 active:scale-[0.99]"
            >
              Разместить объявление
            </Link>
          </header>

          <ListingsPageClient />
        </Container>
      </main>
    </div>
  );
}
