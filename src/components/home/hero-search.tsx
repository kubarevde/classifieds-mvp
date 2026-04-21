import Link from "next/link";

import { Container } from "@/components/ui/container";

const quickFilters = ["Новые сегодня", "С доставкой", "До 50 000 ₽", "Рядом"];
const thematicWorldLinks = [
  { label: "Сельское хозяйство", href: "/listings?world=agriculture" },
  { label: "Электроника", href: "/listings?world=electronics" },
];

export function HeroSearch() {
  return (
    <section className="border-b border-slate-200/80 bg-[radial-gradient(circle_at_top,_#e8f2ff_0%,_#f8fbff_35%,_#ffffff_72%)] py-10 sm:py-14">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div className="text-left">
            <p className="mb-4 inline-flex rounded-full border border-sky-200 bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
              Платформа объявлений + магазины
            </p>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Вертикальные миры, storefront магазинов и умный каталог в одном продукте
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate-600 sm:text-lg">
              Для покупателей: быстрый поиск, подписка на магазины и акции. Для продавцов:
              mini‑витрина, кабинет управления и маркетинговые инструменты роста.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/listings"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Смотреть объявления
              </Link>
              <Link
                href="/#worlds"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Исследовать миры
              </Link>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_24px_64px_-40px_rgba(15,23,42,0.55)] sm:p-4">
              <form className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    Поиск
                  </span>
                  <input
                    type="text"
                    placeholder="iPhone 15, квартира у метро, уборка..."
                    className="h-12 w-full rounded-xl border border-slate-200 pl-20 pr-4 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  />
                </div>
                <select className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100">
                  <option>Все категории</option>
                  <option>Автомобили</option>
                  <option>Электроника</option>
                  <option>Недвижимость</option>
                  <option>Услуги</option>
                </select>
                <button className="h-12 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-700">
                  Найти
                </button>
              </form>

              <div className="mt-3 flex flex-wrap gap-2">
                {quickFilters.map((filter) => (
                  <button
                    key={filter}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900"
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Тематические миры:</span>
                {thematicWorldLinks.map((world) => (
                  <Link
                    key={world.href}
                    href={world.href}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    {world.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[0_24px_64px_-42px_rgba(15,23,42,0.65)] sm:p-6">
            <p className="text-sm font-semibold text-slate-900">Что можно делать уже сейчас</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-2xl font-semibold tracking-tight text-slate-900">36K+</p>
                <p className="mt-1 text-xs text-slate-500">активных объявлений</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-2xl font-semibold tracking-tight text-slate-900">1.2K</p>
                <p className="mt-1 text-xs text-slate-500">новых за сутки</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Для покупателей</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  Подписывайтесь на магазины и ловите новые акции в витрине продавца.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Для продавцов</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  Управляйте магазином в Pro‑кабинете: купоны, кампании и продвижение.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
