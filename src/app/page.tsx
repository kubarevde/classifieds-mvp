import {
  Bot,
  CheckCircle2,
  ChevronRight,
  Compass,
  Heart,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Users2,
} from "lucide-react";
import Link from "next/link";

import { Navbar } from "@/components/layout/navbar";
import { formatRequestBudget, getRequestUrgencyLabel } from "@/components/requests/request-format";
import { PageShell } from "@/components/platform";
import { WorldCard } from "@/components/worlds/world-identity";
import { WORLD_ICONS } from "@/config/icons";
import { CatalogWorld, worldOptions } from "@/lib/listings";
import { getWorldAudienceChips, getWorldOnlineStats } from "@/lib/worlds.community";
import { mockListingsService } from "@/services/listings";
import { mockBuyerRequestsService } from "@/services/requests";

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

const stats = [
  { value: "36 000+", label: "активных объявлений" },
  { value: "1 200", label: "новых сегодня" },
  { value: "850+", label: "магазинов" },
  { value: "120", label: "городов" },
];

const differentiators = [
  {
    title: "Worlds вместо хаоса категорий",
    description: "Каждый мир имеет свой контекст, аудиторию и понятные точки входа в каталог.",
    href: "/worlds",
    icon: Compass,
  },
  {
    title: "Витрины магазинов с репутацией",
    description: "Проверенные stores с рейтингом, историей и постоянным ассортиментом.",
    href: "/stores",
    icon: Store,
  },
  {
    title: "Доска спроса покупателей",
    description: "Reverse marketplace: продавец видит, что хотят купить прямо сейчас.",
    href: "/requests",
    icon: Users2,
  },
  {
    title: "AI-помощник для объявлений",
    description: "Помогает быстрее оформить карточку и не терять конверсию на старте.",
    href: "/create-listing",
    icon: Bot,
  },
  {
    title: "Trust-first механики",
    description: "Прозрачные рейтинги, проверяемые витрины и заметные сигналы доверия.",
    href: "/stores",
    icon: ShieldCheck,
  },
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
  const buyerRequests = (await mockBuyerRequestsService.getBuyerRequests()).slice(0, 4);
  const latestListings = [...catalogListings]
    .sort((a, b) => new Date(b.postedAtIso).getTime() - new Date(a.postedAtIso).getTime())
    .slice(0, 8);

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950">
      <Navbar />
      <main>
        <section className="border-b border-slate-200/70 bg-gradient-to-b from-white via-slate-50 to-white py-10 sm:py-12">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div className="space-y-5">
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-sky-700">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
                  Marketplace OS: worlds + stores + trust
                </span>
                <div className="space-y-3">
                  <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
                    Маркетплейс, где спрос и предложение встречаются быстрее.
                  </h1>
                  <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
                    Classify объединяет объявления, витрины магазинов, доску запросов покупателей и AI-инструменты в единую продуктовую систему.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Link
                    href="/listings"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Смотреть объявления
                  </Link>
                  <Link
                    href="/create-listing"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    Разместить объявление
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-sm font-semibold text-slate-900">Куда перейти дальше</p>
                <div className="mt-3 grid gap-2">
                  <Link
                    href="/dashboard?tab=listings"
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-white"
                  >
                    <span>Личный кабинет — О продаже</span>
                    <ChevronRight className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                  </Link>
                  <Link
                    href="/dashboard?tab=favorites"
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-white"
                  >
                    <span>Личный кабинет — О покупке</span>
                    <ChevronRight className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                  </Link>
                  <Link
                    href="/stores"
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-white"
                  >
                    <span>Проверенные магазины</span>
                    <ChevronRight className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            </div>

            <form
              action="/listings"
              method="get"
              className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
            >
              <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                <label className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.7} />
                  <input
                    type="text"
                    name="q"
                    placeholder="Что вы ищете?"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                  />
                </label>
                <select
                  name="world"
                  defaultValue=""
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
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
                  className="h-11 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Начать поиск
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickFilters.map((filter) => (
                  <Link
                    key={filter.label}
                    href={filter.href}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
                  >
                    {filter.label}
                  </Link>
                ))}
              </div>
            </form>

            <div className="flex flex-wrap gap-2">
              {quickCategories.map((category) => {
                const Icon = WORLD_ICONS[category.id];
                return (
                  <Link
                    key={category.label}
                    href={category.href}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span>{category.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-slate-900 py-10 text-white sm:py-12">
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
          className="py-14"
          title="Почему это больше, чем доска объявлений"
          subtitle="Главные differentiators продукта: discovery, trust и реальный рыночный контур спроса."
          titleClassName="text-3xl font-black tracking-tight text-slate-950"
          subtitleClassName="max-w-3xl text-slate-600"
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {differentiators.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <Icon className="h-4 w-4" strokeWidth={1.7} />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-slate-900 transition group-hover:text-blue-700">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.description}</p>
                </Link>
              );
            })}
          </div>
        </PageShell>

        <PageShell
          id="worlds"
          className="py-14"
          title="Открой нужный world и заходи сразу в свой контекст"
          subtitle="Worlds структурируют каталог по реальным сценариям, а не по случайным рубрикам."
          titleClassName="text-3xl font-black tracking-tight text-slate-950"
          subtitleClassName="text-slate-600"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {quickCategories.map((world) => {
              const listingsCount = catalogListings.filter((listing) => listing.world === world.id).length;
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
                  ctaLabel="Войти в world"
                />
              );
            })}
          </div>
        </PageShell>

        <PageShell
          className="py-14"
          title="Сценарии для покупателя и продавца"
          subtitle="Выберите свой следующий шаг без перегруза одинаковыми CTA."
          titleClassName="text-2xl font-semibold tracking-tight text-slate-900"
          subtitleClassName="text-sm text-slate-600"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">Я покупаю</p>
              <h3 className="mt-3 text-xl font-semibold text-slate-900">Быстро найти и сравнить предложения</h3>
              <p className="mt-2 text-sm text-slate-600">
                Идите через поиск, worlds и доску запросов, если хотите получить отклики от продавцов.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/listings" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                  В каталог
                </Link>
                <Link href="/requests" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Опубликовать запрос
                </Link>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">Я продаю</p>
              <h3 className="mt-3 text-xl font-semibold text-slate-900">Запустить продажи и укрепить доверие</h3>
              <p className="mt-2 text-sm text-slate-600">
                Размещайте объявления, открывайте store-витрину и управляйте потоком лидов из кабинета.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/create-listing" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                  Создать объявление
                </Link>
                <Link href="/dashboard?tab=listings" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Кабинет продавца
                </Link>
              </div>
            </article>
          </div>
        </PageShell>

        <PageShell
          className="py-14"
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stores.map((store) => (
              <article key={store.name} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className={`h-16 bg-gradient-to-r ${store.ribbon}`} />
                <div className="relative px-5 pb-5">
                  <div className="absolute -top-5 left-5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm">
                    {store.name.charAt(0)}
                  </div>
                  <div className="pt-8">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900">{store.name}</p>
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" strokeWidth={1.8} />
                        Verified
                      </span>
                    </div>
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
                      Открыть витрину
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </PageShell>

        <PageShell
          className="py-14"
          title="Покупатели ищут прямо сейчас"
          subtitle="Живой слой спроса: размещайте запросы о покупке и получайте предложения от магазинов и продавцов."
          titleClassName="text-2xl font-semibold tracking-tight text-slate-900"
          subtitleClassName="text-sm text-slate-600"
          actions={
            <Link
              href="/requests"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Все запросы
            </Link>
          }
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {buyerRequests.map((request) => (
              <Link
                key={request.id}
                href={`/requests/${request.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">{request.location}</p>
                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-700">
                    {getRequestUrgencyLabel(request.urgency)}
                  </span>
                </div>
                <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">{request.title}</h3>
                <p className="mt-2 text-xs text-slate-600">{formatRequestBudget(request)}</p>
                <p className="mt-2 text-xs text-slate-500">{request.responseCount} откликов</p>
              </Link>
            ))}
          </div>
        </PageShell>

        <PageShell
          className="py-14"
          title="Свежие объявления"
          titleClassName="text-3xl font-black tracking-tight text-slate-950"
          actions={
            <Link href="/listings" className="text-sm font-semibold text-blue-700 transition-all duration-200 hover:text-blue-800">
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
                  <div aria-hidden className={`h-full w-full bg-gradient-to-br ${listingVisuals[index % listingVisuals.length]}`}>
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
                  <h3 className="line-clamp-1 font-semibold text-slate-900">{listing.title}</h3>
                  <p className="text-lg font-bold text-slate-950">{listing.price}</p>
                  <p className="text-sm text-slate-500">
                    {listing.location}, {listing.publishedAt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </PageShell>

        <section className="py-14">
          <PageShell as="div" containerOnly>
            <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-xl sm:p-10">
              <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                <div className="space-y-4">
                  <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-1 text-xs font-medium">
                    Готовы к следующему шагу?
                  </span>
                  <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                    Запустите продажу или найдите нужное в несколько кликов.
                  </h2>
                  <p className="max-w-xl text-slate-300">
                    В каталоге, мирах, запросах и личном кабинете уже есть готовые сценарии для покупки и роста продаж.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/create-listing"
                      className="inline-flex rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                    >
                      Разместить объявление
                    </Link>
                    <Link
                      href="/requests"
                      className="inline-flex rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      Смотреть запросы
                    </Link>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm text-slate-200">Почему это работает</p>
                  <div className="mt-4 space-y-2 text-sm text-slate-100">
                    <p>• Discovery через worlds + поиск</p>
                    <p>• Trust через verified stores и рейтинг</p>
                    <p>• Спрос через live buyer requests</p>
                    <p>• Управление в личном кабинете</p>
                  </div>
                </div>
              </div>
            </div>
          </PageShell>
        </section>
      </main>
    </div>
  );
}
