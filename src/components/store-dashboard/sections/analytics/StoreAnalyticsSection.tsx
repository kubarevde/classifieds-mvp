import type { MarketingCoupon } from "@/lib/sellers";
import type { SellerDashboardListing, SellerStorefront } from "@/lib/sellers";

import type { StoreSubscriptionTierId } from "@/components/store-dashboard/store-dashboard-shared";
import { getNextTier } from "@/components/store-dashboard/store-dashboard-shared";
import { useStoreAnalyticsSectionData } from "@/components/store-dashboard/sections/analytics/StoreAnalyticsSection.hooks";

type StoreAnalyticsSectionProps = {
  seller: SellerStorefront;
  listings: SellerDashboardListing[];
  initialCoupons: MarketingCoupon[];
  currentSubscriptionTier: StoreSubscriptionTierId;
};

export function StoreAnalyticsSection({
  seller,
  listings,
  initialCoupons,
  currentSubscriptionTier,
}: StoreAnalyticsSectionProps) {
  const nextSubscriptionTier = getNextTier(currentSubscriptionTier);
  const {
    mockTrafficSources,
    loyaltyStats,
    topPerformingListings,
    risingListings,
    improvementNotes,
    assistantTips,
    currentTierPresentation,
  } = useStoreAnalyticsSectionData({
    seller,
    listings,
    initialCoupons,
    currentSubscriptionTier,
    nextSubscriptionTier,
  });

  return (
    <section
      id="dashboard-store-insights"
      className="space-y-5 rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Аналитика витрины (демо)</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Источники трафика, сильные объявления и подсказки ассистента — всё на mock‑данных, без подключения
            стриминга событий.
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Демо-слой
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Источники трафика</h3>
          <p className="mt-1 text-xs text-slate-500">Оценка за 30 дней, стабильная для демо по id магазина.</p>
          <ul className="mt-4 space-y-3">
            {mockTrafficSources.map((row) => (
              <li key={row.id}>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
                  <span>{row.label}</span>
                  <span className="font-semibold tabular-nums text-slate-900">{row.pct}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-800/85"
                    style={{ width: `${Math.min(100, row.pct)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Подписки и лояльность</h3>
          <p className="mt-1 text-xs text-slate-500">Отдельный слой метрик для аудитории магазина.</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
              <p className="text-xs text-slate-500">Подписчики (follow)</p>
              <p className="mt-1 flex items-center justify-between gap-2">
                <span className="font-semibold tabular-nums text-slate-900">
                  {loyaltyStats.followers.toLocaleString("ru-RU")}
                </span>
                <span className={loyaltyStats.followersTrendUp ? "text-emerald-700" : "text-slate-500"}>
                  {loyaltyStats.followersTrendLabel}
                </span>
              </p>
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
              <p className="text-xs text-slate-500">Магазин в любимых</p>
              <p className="mt-1 flex items-center justify-between gap-2">
                <span className="font-semibold tabular-nums text-slate-900">
                  {loyaltyStats.favorites.toLocaleString("ru-RU")}
                </span>
                <span className={loyaltyStats.favoritesTrendUp ? "text-emerald-700" : "text-slate-500"}>
                  {loyaltyStats.favoritesTrendLabel}
                </span>
              </p>
            </li>
          </ul>
          <p className="mt-2 text-xs text-slate-500">
            Follow и «в любимых» — разные сущности: новости/акции vs loyalty-сигнал и быстрый доступ.
          </p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Лучшие объявления</h3>
          <p className="mt-1 text-xs text-slate-500">По сумме просмотров и откликов в демо-кабинете.</p>
          <ul className="mt-3 space-y-2">
            {topPerformingListings.length ? (
              topPerformingListings.map((listing) => (
                <li
                  key={listing.id}
                  className="flex items-start justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs"
                >
                  <p className="min-w-0 font-medium leading-snug text-slate-900">{listing.title}</p>
                  <span className="shrink-0 tabular-nums text-slate-600">
                    {listing.views} просм. · {listing.messages} откл.
                  </span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500">Нет активных объявлений для рейтинга.</li>
            )}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Что растёт</h3>
          <p className="mt-1 text-xs text-slate-500">Высокая конверсия просмотр → отклик и динамика недели (mock).</p>
          <ul className="mt-3 space-y-2">
            {risingListings.length ? (
              risingListings.map(({ listing, viewsDeltaLabel }) => (
                <li
                  key={listing.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-700"
                >
                  <p className="font-medium text-slate-900">{listing.title}</p>
                  <p className="mt-1 text-[11px] font-medium text-slate-700">{viewsDeltaLabel}</p>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500">Нет данных о росте для активных объявлений.</li>
            )}
          </ul>
        </article>
      </div>

      <article className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Рекомендации</h3>
        <p className="mt-1 text-xs text-slate-600">
          Единый блок ассистента: контент, loyalty и возможности текущего тарифа.
        </p>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <section className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Контент</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-700">
              {improvementNotes.slice(0, 2).map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Loyalty</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-700">
              <li>Продвигайте follow в публикациях и карточках товаров.</li>
              <li>Добавьте micro-оффер для «любимых магазинов» в акциях.</li>
              <li>Держите частоту постов стабильной для возврата аудитории.</li>
            </ul>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Тариф</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-700">
              <li>Уровень: {currentTierPresentation.title}.</li>
              <li>Аналитика: {currentTierPresentation.analyticsDepth}.</li>
              <li>Маркетинг: {currentTierPresentation.marketingDepth}.</li>
            </ul>
          </section>
        </div>
        <ul className="mt-3 space-y-2">
          {assistantTips.slice(0, 3).map((tip) => (
            <li key={tip.title} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="text-xs font-semibold text-slate-900">{tip.title}</p>
              <p className="mt-1 text-xs text-slate-600">{tip.body}</p>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
