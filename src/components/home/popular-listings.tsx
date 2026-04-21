import Link from "next/link";

import { popularListings } from "@/lib/mock-data";
import { Container } from "@/components/ui/container";
import { ListingCard } from "@/components/home/listing-card";

export function PopularListings() {
  return (
    <section id="listings" className="py-8 sm:py-12">
      <Container>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Популярные объявления
            </h2>
            <p className="mt-1 text-sm text-slate-600">Свежие карточки с высоким интересом</p>
          </div>
          <Link
            href="/listings"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Смотреть все
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popularListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </Container>
    </section>
  );
}
