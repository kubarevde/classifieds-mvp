"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ListingsGrid } from "@/components/listings/listings-grid";
import {
  MarketingCampaign,
  MarketingCoupon,
  SellerPost,
  SellerPostType,
  SellerStorefront,
  StorefrontListing,
  getSellerTypeLabel,
} from "@/lib/sellers";
import { ListingsView, ListingWorld } from "@/lib/listings";

type StorefrontPageClientProps = {
  seller: SellerStorefront;
  listings: StorefrontListing[];
  posts: SellerPost[];
  pinnedPost: SellerPost | null;
  coupons: MarketingCoupon[];
  promotionState: {
    sellerId: string;
    listingId: string;
    lastBoostedAt: string | null;
    isSuper: boolean;
    isSponsored: boolean;
  }[];
  campaigns: MarketingCampaign[];
};

type ListingScope = "all" | "active";

const scopeLabels: Record<ListingScope, string> = {
  all: "Все объявления",
  active: "Активные",
};

const worldLabels: Record<ListingWorld, string> = {
  base: "Каталог",
  agriculture: "Сельское хозяйство",
  electronics: "Электроника",
};

const viewButtonClassName =
  "rounded-xl border px-3 py-2 text-sm font-medium transition hover:border-slate-300 hover:bg-slate-50";

const postTypeLabels: Record<SellerPostType, string> = {
  news: "Новость",
  promo: "Акция",
  product: "Товар",
  video: "Видео",
};

const postTypeToneClassNames: Record<SellerPostType, string> = {
  news: "border-sky-200 bg-sky-50 text-sky-700",
  promo: "border-amber-200 bg-amber-50 text-amber-700",
  product: "border-emerald-200 bg-emerald-50 text-emerald-700",
  video: "border-violet-200 bg-violet-50 text-violet-700",
};

const postTypeIcon: Record<SellerPostType, string> = {
  news: "📰",
  promo: "🏷️",
  product: "📦",
  video: "🎬",
};

function formatPostDate(isoDate: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
  }).format(new Date(isoDate));
}

export function StorefrontPageClient({
  seller,
  listings,
  posts,
  pinnedPost,
  coupons,
  promotionState,
  campaigns,
}: StorefrontPageClientProps) {
  const [scope, setScope] = useState<ListingScope>("all");
  const [world, setWorld] = useState<"all" | ListingWorld>("all");
  const [view, setView] = useState<ListingsView>("grid");
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [followersCount, setFollowersCount] = useState(seller.followersCount);

  const worlds = useMemo(
    () =>
      Array.from(new Set(listings.map((listing) => listing.world))).sort((a, b) =>
        worldLabels[a].localeCompare(worldLabels[b], "ru"),
      ),
    [listings],
  );

  const activeListingsCount = useMemo(
    () => listings.filter((listing) => listing.status === "active").length,
    [listings],
  );

  const visibleListings = useMemo(
    () =>
      listings.filter((listing) => {
        const matchesScope = scope === "all" ? true : listing.status === "active";
        const matchesWorld = world === "all" ? true : listing.world === world;
        return matchesScope && matchesWorld;
      }),
    [listings, scope, world],
  );

  const firstListing = visibleListings[0] ?? listings[0];
  const visiblePosts = useMemo(() => posts.slice(0, 5), [posts]);
  const activeCoupons = useMemo(() => coupons.filter((coupon) => coupon.status === "active"), [coupons]);
  const activeCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.status === "active"),
    [campaigns],
  );
  const featuredListings = useMemo(() => {
    const promotedListingIds = new Set<string>();
    promotionState.forEach((state) => {
      if (state.isSuper || state.isSponsored || state.lastBoostedAt) {
        promotedListingIds.add(state.listingId);
      }
    });
    activeCampaigns.forEach((campaign) => campaign.listingIds.forEach((id) => promotedListingIds.add(id)));
    return listings.filter((listing) => promotedListingIds.has(listing.id)).slice(0, 4);
  }, [activeCampaigns, listings, promotionState]);

  function toggleSubscription() {
    setIsSubscribed((current) => {
      setFollowersCount((count) => (current ? Math.max(0, count - 1) : count + 1));
      return !current;
    });
  }

  return (
    <div className="space-y-4">
      <section
        className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br p-5 text-white sm:p-7 ${seller.heroGradientClass}`}
      >
        <div className="pointer-events-none absolute -left-10 top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -right-12 bottom-0 h-40 w-40 rounded-full bg-black/30 blur-3xl" />

        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">Storefront MVP</p>
            <div className="flex items-start gap-3">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/35 bg-white/20 text-lg font-semibold">
                {seller.avatarLabel}
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{seller.storefrontName}</h1>
                <p className="mt-1 text-sm text-white/85">
                  {seller.displayName} · {getSellerTypeLabel(seller.type)}
                </p>
              </div>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-white/90 sm:text-base">{seller.shortDescription}</p>
            <div className="flex flex-wrap gap-2">
              {seller.trustBadges.map((badge) => (
                <span key={badge.id} className="rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs">
                  {badge.label}
                </span>
              ))}
            </div>
          </div>

          <aside className="space-y-2 rounded-2xl border border-white/25 bg-black/20 p-4 text-sm">
            <p className="font-semibold">Профиль продавца</p>
            <p className={seller.accentClass}>
              {seller.city}, {seller.region}
            </p>
            <p className="text-white/80">{seller.memberSinceLabel}</p>
            <p className="text-white/80">{seller.responseSpeedLabel}</p>
            <p className="text-white/80">
              Активных объявлений: <span className="font-semibold text-white">{activeListingsCount}</span>
            </p>
            <p className="text-white/80">
              Подписчики: <span className="font-semibold text-white">{followersCount.toLocaleString("ru-RU")}</span>
            </p>
            <button
              type="button"
              onClick={toggleSubscription}
              className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                isSubscribed
                  ? "border border-white/30 bg-white/20 text-white hover:bg-white/30"
                  : "bg-white text-slate-900 hover:bg-slate-200"
              }`}
            >
              {isSubscribed ? "Вы подписаны" : "Подписаться"}
            </button>
            <p className="text-xs text-white/70">Подписчики видят ваши обновления в своей ленте.</p>
            <div className="mt-3 space-y-2">
              <Link
                href={{
                  pathname: "/messages",
                  query: {
                    listingId: firstListing?.id ?? "",
                    sellerName: seller.displayName,
                    listingTitle: firstListing?.title ?? seller.storefrontName,
                  },
                }}
                className="inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                Написать продавцу
              </Link>
              <button
                type="button"
                onClick={() => setIsPhoneRevealed((previous) => !previous)}
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/35 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                {isPhoneRevealed ? seller.phone : "Показать телефон"}
              </button>
              <a
                href="#seller-listings"
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/35 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Смотреть все объявления
              </a>
              <Link
                href={`/dashboard/store?sellerId=${seller.id}`}
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/35 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Управлять магазином
              </Link>
            </div>
            <p className="text-xs text-white/70">Ссылка видна как owner-CTA в рамках MVP.</p>
          </aside>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Лента магазина</h2>
            <p className="text-sm text-slate-600">Новости, акции и обновления от продавца.</p>
          </div>
        </div>

        {pinnedPost ? (
          <article className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                Закреплено
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${postTypeToneClassNames[pinnedPost.type]}`}
              >
                {postTypeLabels[pinnedPost.type]}
              </span>
              <span className="text-xs text-slate-500">{formatPostDate(pinnedPost.createdAt)}</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-900">{pinnedPost.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">{pinnedPost.body}</p>
          </article>
        ) : null}

        {visiblePosts.length ? (
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {visiblePosts.map((post) => (
              <article key={post.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${postTypeToneClassNames[post.type]}`}
                  >
                    {postTypeLabels[post.type]}
                  </span>
                  <span className="text-xs text-slate-500">{formatPostDate(post.createdAt)}</span>
                </div>
                <p className="mt-2 line-clamp-1 text-sm font-semibold text-slate-900">{post.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{post.body}</p>
                <div className="mt-2 flex h-20 items-center justify-center rounded-lg border border-slate-200 bg-white text-2xl">
                  {post.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.imageUrl} alt={post.title} className="h-full w-full rounded-lg object-cover" />
                  ) : (
                    <span>{postTypeIcon[post.type]}</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Публикаций пока нет. Следите за обновлениями магазина.
          </p>
        )}
      </section>

      {activeCoupons.length ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Акции и купоны</h2>
          <p className="mt-1 text-sm text-slate-600">
            Магазин может создавать временные предложения и купоны — вы видите их здесь.
          </p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {activeCoupons.map((coupon) => (
              <article key={coupon.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                    Купон
                  </span>
                  <span className="text-xs font-semibold text-slate-700">{coupon.code}</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-900">{coupon.title}</p>
                <p className="text-sm text-slate-600">
                  {coupon.discountType === "percent"
                    ? `Скидка ${coupon.discountValue}%`
                    : `Скидка ${coupon.discountValue.toLocaleString("ru-RU")} ₽`}
                  {" · до "}
                  {formatPostDate(coupon.validUntil)}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {featuredListings.length ? (
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Выделенные объявления</h2>
            <p className="text-sm text-slate-600">Суперобъявления и продвигаемые позиции магазина.</p>
          </div>
          <ListingsGrid
            listings={featuredListings}
            view="grid"
            emptyMessage="Выделенных объявлений пока нет."
            emptyStateClassName="bg-slate-50"
          />
        </section>
      ) : null}

      <section id="seller-listings" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {(["all", "active"] as ListingScope[]).map((section) => {
              const isActive = section === scope;
              const count =
                section === "all"
                  ? listings.length
                  : listings.filter((listing) => listing.status === "active").length;
              return (
                <button
                  key={section}
                  type="button"
                  onClick={() => setScope(section)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {scopeLabels[section]} · {count}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`${viewButtonClassName} ${view === "grid" ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800" : "border-slate-200 bg-white text-slate-600"}`}
            >
              Сетка
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`${viewButtonClassName} ${view === "list" ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800" : "border-slate-200 bg-white text-slate-600"}`}
            >
              Список
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setWorld("all")}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              world === "all"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Все миры
          </button>
          {worlds.map((worldOption) => (
            <button
              key={worldOption}
              type="button"
              onClick={() => setWorld(worldOption)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                world === worldOption
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {worldLabels[worldOption]}
            </button>
          ))}
        </div>
      </section>

      <ListingsGrid
        listings={visibleListings}
        view={view}
        emptyMessage="По выбранным фильтрам у продавца пока нет объявлений."
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">О магазине</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <p className="text-sm font-semibold text-slate-900">Описание</p>
            <p className="text-sm text-slate-600">{seller.shortDescription}</p>
          </div>
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <p className="text-sm font-semibold text-slate-900">Контакты и соцсети</p>
            <p className="text-sm text-slate-600">Телефон: {seller.phone}</p>
            <p className="break-all text-sm text-slate-600">Сайт: {seller.contactLinks.website || "не указан"}</p>
            <p className="break-all text-sm text-slate-600">Telegram: {seller.contactLinks.telegram || "не указан"}</p>
            <p className="break-all text-sm text-slate-600">VK: {seller.contactLinks.vk || "не указан"}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {seller.trustBadges.map((badge) => (
            <span
              key={badge.id}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {badge.label}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
