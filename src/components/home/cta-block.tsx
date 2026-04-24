import Link from "next/link";

import { Container } from "@/components/ui/container";
import { DEMO_STOREFRONT_SELLER_ID } from "@/lib/demo-role-constants";

export function CtaBlock() {
  return (
    <section className="py-8 sm:py-12">
      <Container>
        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-7 sm:p-10">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
                Для продавцов и магазинов
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                От частника до бизнеса: storefront, кабинет и инструменты продвижения
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Публикуйте объявления, ведите ленту магазина, управляйте купонами и кампаниями,
                чтобы увеличивать показы и отклики.
              </p>
              <p className="mt-4 text-xs font-medium text-slate-400">
                Витрина магазина и Pro‑панель доступны в текущем MVP
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 md:w-auto">
              <Link
                href="/create-listing"
                className="rounded-xl bg-white px-6 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Разместить объявление
              </Link>
              <Link
                href={`/dashboard/store?sellerId=${DEMO_STOREFRONT_SELLER_ID}`}
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Открыть кабинет магазина
              </Link>
              <Link
                href={`/sellers/${DEMO_STOREFRONT_SELLER_ID}`}
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Посмотреть пример магазина
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 border-t border-white/10 pt-5 text-xs text-slate-300 sm:grid-cols-3 sm:text-sm">
            <p>Магазин как витрина + медиа</p>
            <p>Маркетинг: купоны, кампании, поднятия</p>
            <p>Единый путь: каталог → карточка → storefront</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
