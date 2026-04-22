import Link from "next/link";

import { Container } from "@/components/ui/container";
import { CatalogWorld } from "@/lib/listings";

const quickFilters = ["Новые сегодня", "С доставкой", "До 50 000 ₽", "Рядом"];
const thematicWorldLinks = [
  { id: "electronics" as CatalogWorld, label: "Электроника", href: "/listings?world=electronics" },
  { id: "autos" as CatalogWorld, label: "Автомобили", href: "/listings?world=autos" },
  { id: "agriculture" as CatalogWorld, label: "Сельское хозяйство", href: "/listings?world=agriculture" },
  { id: "real_estate" as CatalogWorld, label: "Недвижимость", href: "/listings?world=real_estate" },
  { id: "jobs" as CatalogWorld, label: "Работа", href: "/listings?world=jobs" },
  { id: "services" as CatalogWorld, label: "Услуги", href: "/listings?world=services" },
];

const worldChipToneClass: Record<CatalogWorld, string> = {
  all: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  electronics:
    "border-blue-200 bg-[linear-gradient(180deg,rgba(239,246,255,0.85),rgba(255,255,255,0.95))] text-slate-700 hover:border-blue-300",
  autos:
    "border-rose-200 bg-[linear-gradient(180deg,rgba(255,241,242,0.86),rgba(255,255,255,0.95))] text-slate-700 hover:border-rose-300",
  agriculture:
    "border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.86),rgba(255,255,255,0.95))] text-slate-700 hover:border-emerald-300",
  real_estate:
    "border-indigo-200 bg-[linear-gradient(180deg,rgba(238,242,255,0.88),rgba(255,255,255,0.95))] text-slate-700 hover:border-indigo-300",
  jobs:
    "border-sky-200 bg-[linear-gradient(180deg,rgba(240,249,255,0.88),rgba(255,255,255,0.95))] text-slate-700 hover:border-sky-300",
  services:
    "border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.9),rgba(255,255,255,0.95))] text-slate-700 hover:border-amber-300",
};

export function HeroSearch() {
  return (
    <section className="border-b border-slate-200/80 bg-[radial-gradient(circle_at_top,_#e8f2ff_0%,_#f8fbff_35%,_#ffffff_72%)] py-10 sm:py-14">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div className="text-left">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Объявления в своём мире — без лишних затрат
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate-600 sm:text-lg">
              Размещение объявлений бесплатно. Платные Pro‑инструменты включают аналитику,
              оформление и продвижение. Тематические миры и витрины магазинов помогают продавцам
              строить узнаваемость, а покупателям — искать точнее.
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
                {thematicWorldLinks.map((world) => (
                  <Link
                    key={world.href}
                    href={world.href}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${worldChipToneClass[world.id]}`}
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
