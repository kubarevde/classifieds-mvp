import Link from "next/link";

import { Badge } from "@/components/ui";
import { InlineNotice, SectionCard, StatTile } from "@/components/platform";
import { getSellerPlanTierLabel, getSellerTypeLabel } from "@/lib/sellers";
import type { SellerDashboardListing, SellerStorefront } from "@/lib/sellers";

import {
  MetricIcon,
  getStoreTierLabel,
  subscriptionTierPresentation,
  type StoreSubscriptionTierId,
} from "@/components/store-dashboard/store-dashboard-shared";
import { useStoreOverviewSectionData } from "@/components/store-dashboard/sections/overview/StoreOverviewSection.hooks";

type StoreOverviewSectionProps = {
  seller: SellerStorefront;
  listings: SellerDashboardListing[];
  currentSubscriptionTier: StoreSubscriptionTierId;
  getSectionClassName: (baseClassName: string, sectionId: string) => string;
  onOpenTariffModal: () => void;
  subscription: { setStorePlan: (plan: StoreSubscriptionTierId) => void };
};

export function StoreOverviewSection({
  seller,
  listings,
  currentSubscriptionTier,
  getSectionClassName,
  onOpenTariffModal,
  subscription,
}: StoreOverviewSectionProps) {
  const { heroMetrics, currentTierPresentation, availableGrowthTools, lockedGrowthTools } =
    useStoreOverviewSectionData({
      seller,
      listings,
      currentSubscriptionTier,
    });

  const createHref = `/create-listing?world=${seller.worldHint}&sellerId=${seller.id}`;

  return (
    <>
      <SectionCard
        id="dashboard-store-hero"
        unstyled
        padding="none"
        className={getSectionClassName(
          "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5",
          "dashboard-store-hero",
        )}
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-3">
            <p className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
              Store Dashboard
            </p>
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                {seller.avatarLabel}
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  {seller.storefrontName}
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  {getSellerTypeLabel(seller.type)} · Тариф: {getStoreTierLabel(currentSubscriptionTier)}
                </p>
              </div>
            </div>
            <p className="max-w-2xl text-sm text-slate-600 sm:text-base">{seller.shortDescription}</p>
            <div className="flex flex-wrap gap-2">
              {seller.trustBadges.map((badge) => (
                <span
                  key={badge.id}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {badge.label}
                </span>
              ))}
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                {seller.metrics.responseSpeedLabel}
              </span>
            </div>
          </div>

          <aside className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm font-semibold text-slate-900">Быстрые действия</p>
            <div className="space-y-2">
              <Link
                href={createHref}
                className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Создать объявление
              </Link>
              <Link
                href={`/sellers/${seller.id}`}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Посмотреть магазин (витрина)
              </Link>
              <button
                type="button"
                onClick={() => {
                  const target = document.getElementById("dashboard-store-subscription");
                  target?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Открыть подписку
              </button>
            </div>
            <p className="text-xs text-slate-500">
              На витрине покупатель может нажать «Следить за магазином» или добавить магазин в любимые.
            </p>
            <p className="text-xs text-slate-500">Новые публикации будут попадать подписчикам в ленту обновлений.</p>
          </aside>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {heroMetrics.map((metric) => (
            <StatTile
              key={metric.id}
              label={metric.label}
              value={metric.value}
              icon={<MetricIcon id={metric.id} />}
              hint={
                metric.id === "conversion" ? (
                  <>Демо-метрика: отношение откликов к просмотрам за 30 дней без учёта воронки по объявлениям.</>
                ) : undefined
              }
            />
          ))}
        </div>

        <div className="mt-4">
          <InlineNotice
            type="info"
            title={`Текущий тариф: ${getStoreTierLabel(currentSubscriptionTier)}`}
            description="Полная расшифровка и сравнение — в секции «Подписка магазина» ниже."
          />
        </div>
      </SectionCard>

      <SectionCard
        id="dashboard-store-subscription"
        unstyled
        padding="none"
        className="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6"
        title="Подписка магазина"
        subtitle="UI-слой тарифов: влияет на объём витрины, глубину аналитики и доступность growth-инструментов."
        actions={
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              Текущий уровень: {currentTierPresentation.title}
            </span>
            <Badge>{currentSubscriptionTier === "business" ? "Активен" : "Демо"}</Badge>
          </div>
        }
      >
        <div className="grid gap-3 lg:grid-cols-3">
          {(["basic", "pro", "business"] as StoreSubscriptionTierId[]).map((tier) => {
            const tierData = subscriptionTierPresentation[tier];
            const isCurrent = currentSubscriptionTier === tier;
            return (
              <article
                key={tier}
                className={`rounded-2xl border p-4 transition ${
                  isCurrent
                    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                    : "border-slate-200 bg-slate-50/70 text-slate-700"
                }`}
              >
                <p className={`text-xs font-semibold uppercase tracking-wide ${isCurrent ? "text-white/70" : "text-slate-500"}`}>
                  {tierData.subtitle}
                </p>
                <p className="mt-1 text-lg font-semibold tracking-tight">{tierData.title}</p>
                <ul className={`mt-3 space-y-1.5 text-xs ${isCurrent ? "text-white/85" : "text-slate-600"}`}>
                  <li>{tierData.listingsLimit}</li>
                  <li>{tierData.collectionsLimit}</li>
                  <li>{tierData.analyticsDepth}</li>
                  <li>{tierData.marketingDepth}</li>
                  <li>{tierData.aiAccess}</li>
                </ul>
              </article>
            );
          })}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Что даёт текущий тариф</h3>
            <p className="mt-1 text-xs text-slate-600">{currentTierPresentation.rankingHint}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
              <li>• {currentTierPresentation.listingsLimit}</li>
              <li>• {currentTierPresentation.collectionsLimit}</li>
              <li>• {currentTierPresentation.analyticsDepth}</li>
              <li>• {currentTierPresentation.marketingDepth}</li>
              <li>• {currentTierPresentation.aiAccess}</li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["basic", "pro", "business"] as StoreSubscriptionTierId[]).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => subscription.setStorePlan(tier)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    currentSubscriptionTier === tier
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {tier === "basic" ? "Базовый" : getSellerPlanTierLabel(tier)}
                </button>
              ))}
            </div>
          </article>
          <article className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Growth-инструменты</h3>
            <p className="mt-1 text-xs text-slate-500">High-level доступ; детальные настройки в маркетинг-разделе.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableGrowthTools.map((tool) => (
                <span
                  key={tool.id}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {tool.label}
                </span>
              ))}
              {lockedGrowthTools.map((tool) => (
                <span
                  key={tool.id}
                  className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-400"
                >
                  {tool.label} · доступно на{" "}
                  {tool.minTier === "pro" ? subscriptionTierPresentation.pro.title : subscriptionTierPresentation.business.title}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={onOpenTariffModal}
              className="mt-3 inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Открыть сравнение тарифов
            </button>
          </article>
        </div>
      </SectionCard>
    </>
  );
}
