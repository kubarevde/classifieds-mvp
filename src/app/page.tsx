import { CheckCircle2, ChevronRight, Heart, Star } from "lucide-react";
import Link from "next/link";

import { WORLD_ICONS } from "@/config/icons";
import { Navbar } from "@/components/layout/navbar";
import { PageShell } from "@/components/platform";
import { CatalogWorld, worldOptions } from "@/lib/listings";
import { WorldCard } from "@/components/worlds/world-identity";
import { getWorldAudienceChips, getWorldOnlineStats } from "@/lib/worlds.community";
import { mockListingsService } from "@/services/listings";

const quickFilters: { label: string; href: string }[] = [
  { label: "Новые сегодня", href: "/listings?sort=newest" },
  { label: "С доставкой", href: "/listings?q=доставка" },
  { label: "До 50 000 ₽", href: "/listings?sort=price_asc&q=50000" },
  { label: "Только аукционы", href: "/listings?saleMode=auction" },
];

const quickCategories = worldOptions
  .filter((world): world is (typeof worldOptions)[number] & { id: Exclude<CatalogWorld, "all"> } => world.id !== "all")
  .map((world) => ({
    id: world.id,
    label: world.label,
    href: `/worlds/${world.id}`,
  }));

const heroCards = [
  {
    title: "iPhone 15 Pro",
    price: "75 000 ₽",
    rating: "4.9",
    category: "Электроника",
    href: "/listings?world=electronics",
    visual: "from-blue-200 via-indigo-100 to-slate-100",
    rotate: "-rotate-6",
    position: "left-3 top-14",
  },
  {
    title: "Квартира 3к, центр",
    price: "4 500 000 ₽",
    rating: "4.8",
    category: "Недвижимость",
    href: "/listings?world=real_estate",
    visual: "from-fuchsia-200 via-purple-100 to-pink-100",
    rotate: "rotate-3",
    position: "right-4 top-4",
  },
  {
    title: "Трактор МТЗ-82",
    price: "450 000 ₽",
    rating: "4.7",
    category: "Агро",
    href: "/listings?world=agriculture",
    visual: "from-emerald-200 via-lime-100 to-green-100",
    rotate: "-rotate-2",
    position: "right-10 bottom-8",
  },
];

const stats = [
  { value: "36 000+", label: "активных объявлений" },
  { value: "1 200", label: "новых сегодня" },
  { value: "850+", label: "магазинов" },
  { value: "120", label: "городов" },
];

const stores = [
  {
    name: "ФермаПро",
    category: "Агро",
    tagline: "Фирменная агровитрина с поставками по РФ",
    rating: "4.9",
    count: "124 товара",
    since: "2023",
    ribbon: "from-emerald-400/30 to-teal-400/20",
    href: "/stores",
  },
  {
    name: "ТехноМаркет",
    category: "Электроника",
    tagline: "Премиальная электроника с гарантией",
    rating: "4.8",
    count: "89 товаров",
    since: "2022",
    ribbon: "from-blue-400/30 to-indigo-400/20",
    href: "/stores",
  },
  {
    name: "АвтоДетали",
    category: "Авто",
    tagline: "Крупная витрина запчастей и комплектующих",
    rating: "4.7",
    count: "203 товара",
    since: "2021",
    ribbon: "from-orange-400/30 to-red-400/20",
    href: "/stores",
  },
  {
    name: "ДомСтрой",
    category: "Недвижимость",
    tagline: "Подбор недвижимости с проверкой объектов",
    rating: "4.9",
    count: "45 объявлений",
    since: "2023",
    ribbon: "from-purple-400/30 to-pink-400/20",
    href: "/stores",
  },
  {
    name: "МастерСервис",
    category: "Услуги",
    tagline: "Команда мастеров для частных и B2B задач",
    rating: "4.8",
    count: "67 услуг",
    since: "2022",
    ribbon: "from-cyan-400/30 to-sky-400/20",
    href: "/stores",
  },
  {
    name: "АгроСеть",
    category: "Агро",
    tagline: "Одна из самых стабильных агросетей",
    rating: "4.9",
    count: "156 товаров",
    since: "2020",
    ribbon: "from-lime-400/30 to-green-400/20",
    href: "/stores",
  },
];

const listingVisuals = [
  "from-blue-500 to-indigo-500",
  "from-orange-500 to-red-500",
  "from-emerald-500 to-green-500",
  "from-fuchsia-500 to-pink-500",
  "from-sky-500 to-blue-500",
  "from-lime-500 to-emerald-500",
  "from-cyan-500 to-blue-500",
  "from-amber-500 to-orange-500",
] as const;

export default async function Home() {
  const catalogListings = await mockListingsService.getAll();
  const latestListings = [...catalogListings]
    .sort((a, b) => new Date(b.postedAtIso).getTime() - new Date(a.postedAtIso).getTime())
    .slice(0, 8);

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950">
      <Navbar />
      <main>
        <section className="border-b border-slate-200/70 bg-gradient-to-b from-white via-slate-50 to-white py-12 lg:py-14">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:gap-8 lg:px-8">
            <div className="w-full space-y-5 lg:w-3/5">
              <span className="inline-flex rounded-full border border-slate-300/80 bg-white/80 px-4 py-1.5 text-xs font-medium tracking-wide text-slate-600 shadow-sm backdrop-blur">
                Маркетплейс нового поколения
              </span>
              <div className="space-y-3">
                <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-5xl">
                  Найди что нужно. Продай что есть.
                </h1>
                <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
                  Объявления, магазины и миры — всё в одном месте. Быстро и
                  удобно.
                </p>
              </div>
              <form
                action="/listings"
                method="get"
                className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/80 sm:p-4"
              >
                <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                  <input
                    type="text"
                    name="q"
                    placeholder="Поиск по объявлениям..."
                    className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                  />
                  <select
                    name="world"
                    defaultValue=""
                    className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white"
                  >
                    <option value="">Все миры</option>
                    {quickCategories.map((world) => (
                      <option key={world.id} value={world.id}>
                        {world.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="h-12 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700"
                  >
                    Найти
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickFilters.map((filter) => (
                    <Link
                      key={filter.label}
                      href={filter.href}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-white"
                    >
                      {filter.label}
                    </Link>
                  ))}
                </div>
              </form>
              <div className="flex flex-wrap gap-3">
                {quickCategories.map((category) => {
                  const Icon = WORLD_ICONS[category.id];
                  return (
                    <Link
                      key={category.label}
                      href={category.href}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                      <span>{category.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="relative hidden h-[430px] w-full overflow-hidden lg:block lg:w-2/5">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-blue-100 via-indigo-100 to-slate-100 blur-3xl" />
              {heroCards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className={`absolute ${card.position} ${card.rotate} w-64 rounded-2xl border border-white/60 bg-white/95 p-3 shadow-2xl shadow-slate-300/70 transition-all duration-200 hover:-translate-y-1`}
                >
                  <div
                    aria-hidden
                    className={`relative h-36 overflow-hidden rounded-xl bg-gradient-to-br ${card.visual}`}
                  >
                    <div className="absolute -right-6 top-4 h-20 w-20 rounded-full bg-white/40 blur-md" />
                    <div className="absolute bottom-3 left-3 h-8 w-28 rounded-full bg-white/35" />
                    <div className="absolute bottom-14 right-6 h-6 w-16 rounded-full bg-white/25" />
                  </div>
                  <div className="mt-3 space-y-1">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {card.title}
                    </h3>
                    <p className="text-base font-bold text-slate-900">
                      {card.price}
                    </p>
                    <p className="text-xs text-slate-500">
                      {card.category} · <Star className="inline h-3.5 w-3.5 text-amber-400" strokeWidth={1.5} /> {card.rating}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-900 py-16 text-white">
          <PageShell as="div" containerOnly>
            <div className="grid gap-6 md:grid-cols-4 md:divide-x md:divide-white/15">
              {stats.map((stat) => (
                <div key={stat.label} className="space-y-1 text-center">
                  <p className="text-3xl font-black tracking-tight">{stat.value}</p>
                  <p className="text-sm text-slate-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </PageShell>
        </section>

        <PageShell
          id="worlds"
          className="py-16"
          title="Выбери свой мир"
          subtitle="Все миры проекта с актуальными ссылками на существующий каталог"
          titleClassName="text-3xl font-black tracking-tight text-slate-950"
          subtitleClassName="text-slate-600"
        >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {quickCategories.map((world) => {
                const listingsCount = catalogListings.filter(
                  (listing) => listing.world === world.id,
                ).length;
                const online = getWorldOnlineStats(world.id);
                const chips = getWorldAudienceChips(world.id);
                return (
                  <WorldCard
                    key={world.id}
                    worldId={world.id}
                    listingsCount={listingsCount}
                    usersOnline={online.usersOnline}
                    shopsOnline={online.shopsOnline}
                    chips={chips}
                    href={world.href}
                    ctaLabel="Войти в мир"
                  />
                );
              })}
            </div>
        </PageShell>

        <PageShell
          className="py-16"
          title="Проверенные магазины"
          subtitle="Продавцы с витриной, рейтингом и постоянными покупателями"
          titleClassName="text-2xl font-semibold tracking-tight text-slate-900"
          subtitleClassName="text-sm text-slate-600"
          actions={
            <Link
              href="/stores"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Смотреть все <ChevronRight className="ml-1 inline h-4 w-4" strokeWidth={1.5} />
            </Link>
          }
        >
            <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {stores.map((store) => (
                <article
                  key={store.name}
                  className="w-72 min-w-[288px] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className={`h-16 bg-gradient-to-r ${store.ribbon}`} />
                  <div className="relative px-5 pb-5">
                    <div className="absolute -top-5 left-5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm">
                      {store.name.charAt(0)}
                    </div>
                    <div className="pt-8">
                      <p className="font-semibold text-slate-900">{store.name}</p>
                      <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {store.category}
                      </span>
                      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{store.tagline}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={1.5} />
                          {store.rating}
                        </span>
                        <span>{store.count}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">На платформе с {store.since}</p>
                      <Link
                        href={store.href}
                        className="mt-4 block w-full rounded-xl bg-slate-900 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-700"
                      >
                        Открыть витрину →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
        </PageShell>

        <PageShell
          className="py-16"
          title="Свежие объявления"
          titleClassName="text-3xl font-black tracking-tight text-slate-950"
          actions={
            <Link
              href="/listings"
              className="text-sm font-semibold text-blue-700 transition-all duration-200 hover:text-blue-800"
            >
              Смотреть все →
            </Link>
          }
        >
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {latestListings.map((listing, index) => (
                <Link
                  key={listing.id}
                  href={listing.detailsHref ?? "/listings"}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-48 overflow-hidden">
                    <div
                      aria-hidden
                      className={`h-full w-full bg-gradient-to-br ${listingVisuals[index % listingVisuals.length]}`}
                    >
                      <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.32),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.22),transparent_45%)]" />
                    </div>
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {listing.categoryLabel}
                    </span>
                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 transition-all duration-200">
                      <Heart className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                  </div>
                  <div className="space-y-2 p-4">
                    <h3 className="line-clamp-1 font-semibold text-slate-900">
                      {listing.title}
                    </h3>
                    <p className="text-lg font-bold text-slate-950">{listing.price}</p>
                    <p className="text-sm text-slate-500">{listing.location}, {listing.publishedAt}</p>
                  </div>
                </Link>
              ))}
            </div>
        </PageShell>

        <section className="py-16">
          <PageShell as="div" containerOnly>
            <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-2xl sm:p-10">
              <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                <div className="space-y-4">
                  <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-1 text-xs font-medium">
                    Витрина недели
                  </span>
                  <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                    ФермаПро — лучший агромагазин месяца
                  </h2>
                  <p className="max-w-xl text-slate-300">
                    Свежие семена, удобрения и техника с доставкой по всей
                    России
                  </p>
                  <Link
                    href="/stores"
                    className="inline-flex rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition-all duration-200 hover:bg-slate-100"
                  >
                    Открыть витрину →
                  </Link>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm text-slate-200">Магазин месяца</p>
                  <p className="mt-1 text-xl font-bold">ФермаПро</p>
                  <div className="mt-4 space-y-3 text-sm text-slate-200">
                    <p>
                      <Star className="mr-1 inline h-3.5 w-3.5 text-amber-400" strokeWidth={1.5} />
                      Рейтинг: 4.9
                    </p>
                    <p>124 товара в наличии</p>
                    <p>Экспресс-доставка по России</p>
                  </div>
                </div>
              </div>
            </div>
          </PageShell>
        </section>

        <section className="bg-slate-100 py-16">
          <PageShell as="div" containerOnly maxWidthClassName="max-w-4xl" className="text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Готов продавать?
              </h2>
              <p className="mx-auto max-w-2xl text-slate-600">
                Открой свой магазин бесплатно. Pro-инструменты для роста —
                аналитика, продвижение, витрина.
              </p>
            </div>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/create-listing"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700"
              >
                Разместить объявление
              </Link>
              <Link
                href="/stores"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-400 hover:bg-slate-50"
              >
                Узнать подробнее
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600">
              <span>
                <CheckCircle2 className="mr-1 inline h-4 w-4 text-emerald-500" strokeWidth={1.5} /> Бесплатно
              </span>
              <span>
                <CheckCircle2 className="mr-1 inline h-4 w-4 text-emerald-500" strokeWidth={1.5} /> Без скрытых платежей
              </span>
              <span>
                <CheckCircle2 className="mr-1 inline h-4 w-4 text-emerald-500" strokeWidth={1.5} /> Поддержка 24/7
              </span>
            </div>
          </PageShell>
        </section>
      </main>
    </div>
  );
}
