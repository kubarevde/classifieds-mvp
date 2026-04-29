import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui";
import { InlineNotice, SectionCard, StatTile } from "@/components/platform";
import { getNextPlan, getUsagePercent, type BillingState, type SubscriptionPlan } from "@/entities/billing/model";
import { getSellerPlanTierLabel, getSellerTypeLabel } from "@/lib/sellers";
import type { SellerDashboardListing, SellerStorefront } from "@/lib/sellers";
import { mockBillingService } from "@/services/billing";
import { mockBuyerRequestsService } from "@/services/requests";
import { getUserEnforcementActions } from "@/services/enforcement";
import { detectListingRisk } from "@/services/risk";
import type { InvoiceRecord, PaymentRecord } from "@/services/billing";
import type { RequestMatchResult } from "@/services/requests/matching";
import { getVerificationProfile } from "@/services/verification";
import { VerificationChecklist } from "@/components/verification/VerificationChecklist";
import { VerificationBadge } from "@/components/verification/VerificationBadge";

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
  const [billingState, setBillingState] = useState<BillingState | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [matchingRequests, setMatchingRequests] = useState<RequestMatchResult[]>([]);
  const [matchingTotal, setMatchingTotal] = useState(0);
  const { heroMetrics, currentTierPresentation, availableGrowthTools, lockedGrowthTools } =
    useStoreOverviewSectionData({
      seller,
      listings,
      currentSubscriptionTier,
    });
  useEffect(() => {
    void Promise.all([
      mockBillingService.getCurrentBillingState(seller.id),
      mockBillingService.getPlans(),
      mockBillingService.getPaymentHistory(seller.id),
      mockBillingService.getInvoices(seller.id),
    ]).then(([state, nextPlans, nextPayments, nextInvoices]) => {
        setBillingState(state);
        setPlans(nextPlans);
        setPayments(nextPayments);
        setInvoices(nextInvoices);
      });
  }, [seller.id]);
  useEffect(() => {
    void mockBuyerRequestsService.getMatchingRequestsForSellerDetailed(seller.id).then((rows) => {
      setMatchingTotal(rows.length);
      setMatchingRequests(rows.slice(0, 3));
    });
  }, [seller.id]);

  const currentPlan = billingState?.currentPlan;
  const nextPlan = currentPlan ? getNextPlan(currentPlan) : null;
  const currentPlanData = useMemo(() => plans.find((p) => p.id === currentPlan), [plans, currentPlan]);
  const nextPlanData = useMemo(() => plans.find((p) => p.id === nextPlan), [plans, nextPlan]);

  const createHref = `/create-listing?world=${seller.worldHint}&sellerId=${seller.id}`;
  const storeVerification = getVerificationProfile(seller.id, "store")!;
  const storeReviewsCount = Math.max(8, Math.round(seller.followersCount * 0.16));
  const activeListingsCount = seller.listingRefs.filter((item) => item.status === "active").length;
  const storeStatusLabel = activeListingsCount > 0 ? "Активен" : "Приостановлен";
  const verificationStatusText =
    storeVerification.status === "verified"
      ? "Магазин подтверждён"
      : storeVerification.status === "pending"
        ? "Магазин на проверке"
        : storeVerification.status === "needs_review"
          ? "Магазину нужны доработки"
          : storeVerification.status === "rejected"
            ? "Отказано в подтверждении"
            : "Проверка не начата";
  const hasHighValueRiskListing = listings.some(
    (listing) =>
      detectListingRisk(
        {
          id: listing.id,
          title: listing.title,
          priceValue: listing.priceValue,
          categoryId: listing.categoryId,
        },
        { id: seller.id, memberSinceYear: seller.memberSinceYear },
      ).find((signal) => signal.level === "high") != null,
  );
  const hasVerificationRequiredAction = getUserEnforcementActions(seller.id).some(
    (action) => action.actionType === "verification_required" && action.status === "active",
  );
  const shouldShowRiskHint =
    (storeVerification.status !== "verified" && hasHighValueRiskListing) || hasVerificationRequiredAction;

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
        <div className="space-y-6">
          {/* Hero: операционная панель магазина */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                Store Dashboard
              </p>

              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                  {seller.avatarLabel}
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{seller.storefrontName}</h1>
                  <p className="mt-1 text-sm text-slate-600">
                    {getSellerTypeLabel(seller.type)} · Тариф: {getStoreTierLabel(currentSubscriptionTier)}
                  </p>
                </div>
              </div>

              <p className="max-w-2xl text-sm text-slate-600 sm:text-base">{seller.shortDescription}</p>
            </div>

            <aside className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:w-auto sm:justify-end">
              <div className="flex flex-wrap items-center gap-2">
                <VerificationBadge status={storeVerification.status} level={storeVerification.level} size="sm" variant="compact" />
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  ★ {seller.metrics.rating.toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-slate-600">{storeReviewsCount} отзывов</span>
              </div>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                {storeStatusLabel}
              </span>
            </aside>
          </div>

          {/* Two-column layout */}
          <section>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              {/* Левая колонка */}
              <div className="space-y-6">
                {/* Основная verification-карточка */}
                <article
                  id="store-verification-card"
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <h2 className="text-xl font-semibold tracking-tight text-slate-900">Подтверждение магазина</h2>
                      <p className="text-sm text-slate-600">{verificationStatusText}</p>
                    </div>
                    <VerificationBadge status={storeVerification.status} level={storeVerification.level} size="md" variant="full" />
                  </div>

                  {storeVerification.status === "rejected" || storeVerification.status === "needs_review" ? (
                    <div className="mt-4">
                      <InlineNotice
                        type={storeVerification.status === "rejected" ? "error" : "warning"}
                        title={storeVerification.status === "rejected" ? "Отказ в подтверждении" : "Нужны дополнительные данные"}
                        description={
                          storeVerification.rejectionReason ??
                          "В демо причина задаётся через debug-панель verification."
                        }
                      />
                    </div>
                  ) : null}

                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-slate-900">Зачем это</h3>
                    <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                      <li className="flex gap-2">
                        <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden />
                        Подтверждённый магазин вызывает больше доверия у покупателей.
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden />
                        Покупатели чаще пишут и покупают у проверенных магазинов.
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden />
                        В будущем это даст доступ к расширенным возможностям магазина (mock).
                      </li>
                    </ul>
                  </div>
                  {shouldShowRiskHint ? (
                    <div className="mt-4">
                      <InlineNotice
                        type="warning"
                        title="Для дорогих категорий подтверждённый магазин вызывает больше доверия."
                        description="Это снижает количество сомнений у покупателей и помогает быстрее пройти этапы сделки."
                        action={{ label: "Пройти подтверждение", href: "/verification/business" }}
                      />
                    </div>
                  ) : null}

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Требования</p>
                    <div className="mt-3">
                      <VerificationChecklist requirements={storeVerification.requirements} />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                    <Link
                      href="/verification/business"
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Открыть проверку
                    </Link>
                    {storeVerification.status === "rejected" || storeVerification.status === "needs_review" ? (
                      <Link
                        href="/verification/business"
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                      >
                        Исправить данные
                      </Link>
                    ) : null}
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    В демо статусы и чеклист обновляются в обучающем режиме (mock).
                  </p>
                </article>

                {/* Запросы (мобильный порядок) */}
                <div className="lg:hidden">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Запросы</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      Новых подходящих запросов: {matchingTotal}
                    </p>
                    <div className="mt-2 space-y-1.5">
                      {matchingRequests.map((match) => (
                        <Link
                          key={match.request.id}
                          href={`/requests/${match.request.id}`}
                          className="block rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <p className="font-semibold text-slate-800">{match.request.title}</p>
                          <p className="text-[11px] text-slate-500">
                            Match {match.matchScore} · {match.matchReasons[0]}
                          </p>
                        </Link>
                      ))}
                    </div>
                    <Link href="/requests" className="mt-2 inline-flex text-xs font-semibold text-slate-700 underline underline-offset-2">
                      Смотреть все
                    </Link>
                  </div>
                </div>

                {/* KPI / метрики */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {heroMetrics.map((metric) => (
                    <StatTile
                      key={metric.id}
                      label={metric.label}
                      value={metric.value}
                      icon={<MetricIcon id={metric.id} />}
                      hint={metric.id === "conversion" ? <>Отношение откликов к просмотрам за выбранный период.</> : undefined}
                    />
                  ))}
                </div>
              </div>

              {/* Правая колонка */}
              <aside className="space-y-4">
                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-900">Быстрые действия</p>
                  <div className="space-y-2">
                    <Link
                      href={createHref}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      Создать объявление
                    </Link>
                    <Link
                      href={`/stores/${seller.id}`}
                      className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Посмотреть магазин
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
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Подтверждение</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{verificationStatusText}</p>
                    </div>
                    <VerificationBadge status={storeVerification.status} level={storeVerification.level} size="sm" variant="compact" />
                  </div>

                  <Link
                    href="/verification/business"
                    className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Подробнее о подтверждении
                  </Link>
                </div>

                <div className="hidden lg:block rounded-lg border border-slate-200 bg-white p-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Запросы</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Новых подходящих запросов: {matchingTotal}
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {matchingRequests.map((match) => (
                      <Link
                        key={match.request.id}
                        href={`/requests/${match.request.id}`}
                        className="block rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <p className="font-semibold text-slate-800">{match.request.title}</p>
                        <p className="text-[11px] text-slate-500">
                          Match {match.matchScore} · {match.matchReasons[0]}
                        </p>
                      </Link>
                    ))}
                  </div>
                  <Link href="/requests" className="mt-2 inline-flex text-xs font-semibold text-slate-700 underline underline-offset-2">
                    Смотреть все
                  </Link>
                </div>
              </aside>
            </div>
          </section>
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

        {billingState && currentPlanData ? (
          <div className="grid gap-3 lg:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">Usage overview</h3>
              <div className="mt-3 space-y-3 text-xs text-slate-600">
                {[
                  {
                    label: "Активные объявления",
                    used: billingState.usage.active_listings,
                    limit: currentPlanData.limits.active_listings,
                  },
                  {
                    label: "Бусты за месяц",
                    used: billingState.usage.boosts_used_this_month,
                    limit: currentPlanData.limits.boosts_per_month,
                  },
                  {
                    label: "Активные кампании",
                    used: billingState.usage.campaigns_active,
                    limit: currentPlanData.limits.campaigns_active,
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between">
                      <span>{item.label}</span>
                      <span className="font-semibold text-slate-800">
                        {item.used}/{item.limit < 0 ? "∞" : item.limit}
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-100">
                      <div
                        className={`h-2 rounded-full ${getUsagePercent(item.used, item.limit) >= 85 ? "bg-amber-500" : "bg-slate-900"}`}
                        style={{ width: `${getUsagePercent(item.used, item.limit)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">Почему апгрейд может понадобиться</h3>
              {nextPlanData ? (
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  <li>Следующий план: {nextPlanData.name}</li>
                  <li>Лимит объявлений: {currentPlanData.limits.active_listings} {"->"} {nextPlanData.limits.active_listings < 0 ? "∞" : nextPlanData.limits.active_listings}</li>
                  <li>Кампании: {currentPlanData.limits.campaigns_active} {"->"} {nextPlanData.limits.campaigns_active}</li>
                  <li>История аналитики: {currentPlanData.limits.analytics_history_days} {"->"} {nextPlanData.limits.analytics_history_days} дней</li>
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-600">У вас максимальный план.</p>
              )}
            </article>
          </div>
        ) : null}

        <div className="grid gap-3 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">История платежей</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {payments.map((item) => (
                <li key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  {new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", year: "numeric" }).format(
                    new Date(item.createdAt),
                  )}{" "}
                  · {item.amount} ₽ · {item.status === "paid" ? "Успешно" : item.status}
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">Инвойсы</h3>
            <div className="mt-2 space-y-2 text-sm">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <span>{invoice.number}</span>
                  <button type="button" className="text-xs font-semibold text-slate-700 underline underline-offset-2">
                    Скачать PDF
                  </button>
                </div>
              ))}
            </div>
          </article>
        </div>
      </SectionCard>
    </>
  );
}
