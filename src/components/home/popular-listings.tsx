import Link from "next/link";

import { unifiedCatalogListings } from "@/lib/listings";
import { Container } from "@/components/ui/container";
import { DEMO_STOREFRONT_SELLER_ID } from "@/lib/demo-role-constants";
import { ListingCard } from "@/components/home/listing-card";

export function PopularListings() {
  const showcaseListing = unifiedCatalogListings[0];

  return (
    <section id="listings" className="py-8 sm:py-12">
      <Container>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Примеры объявлений и магазинов
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Быстрый вход в реальные сценарии: карточка объявления и storefront продавца.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={showcaseListing?.detailsHref ?? "/listings"}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Посмотреть пример объявления
            </Link>
            <Link
              href={`/sellers/${DEMO_STOREFRONT_SELLER_ID}`}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Посмотреть пример магазина
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {unifiedCatalogListings.slice(0, 6).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </Container>
    </section>
  );
}
