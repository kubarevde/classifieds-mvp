import Link from "next/link";

import { Container } from "@/components/ui/container";
import { isStorefrontCatalogSellerType } from "@/lib/demo-role-constants";
import { storefrontSellers } from "@/lib/sellers";

const showcaseSellers = storefrontSellers.filter((s) => isStorefrontCatalogSellerType(s.type)).slice(0, 3);

export function StoresShowcase() {
  return (
    <section className="py-8 sm:py-12">
      <Container>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Магазины и продавцы</h2>
            <p className="mt-1 text-sm text-slate-600">
              Продавцы развивают магазин, публикуют обновления и собирают подписчиков.
            </p>
          </div>
          <Link
            href="/stores"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Перейти в каталог магазинов
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {showcaseSellers.map((seller) => (
            <article key={seller.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-900 text-xs font-semibold text-white">
                  {seller.avatarLabel}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{seller.storefrontName}</h3>
                  <p className="text-sm text-slate-600">{seller.city}</p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-slate-600">{seller.shortDescription}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{seller.followersCount.toLocaleString("ru-RU")} подписчиков</span>
                <span>{seller.metrics.activeListingsCount} активных</span>
              </div>
              <Link
                href={`/stores/${seller.id}`}
                className="mt-3 inline-flex rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Открыть магазин
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
