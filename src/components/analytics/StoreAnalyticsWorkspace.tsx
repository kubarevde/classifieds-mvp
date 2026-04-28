"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { LineChart } from "lucide-react";

import type { StoreAnalyticsPeriod, StoreAnalytics, StoreInsight } from "@/entities/analytics/model";
import type { SellerDashboardListing, SellerStorefront } from "@/lib/sellers";
import { mockStoreAnalyticsService } from "@/services/analytics";
import { FeatureGate } from "@/components/platform";
import { useAnalyticsHistoryCap } from "@/components/analytics/use-analytics-history-cap";
import { AnalyticsKpiStrip } from "@/components/analytics/AnalyticsKpiStrip";
import {
  AnalyticsPeriodContextLine,
  AnalyticsPeriodTabs,
  periodCaptionAccusative,
} from "@/components/analytics/AnalyticsPeriodTabs";
import { RevenueChart } from "@/components/analytics/RevenueChart";
import { ViewsChart } from "@/components/analytics/ViewsChart";
import { CategoryBreakdownChart } from "@/components/analytics/CategoryBreakdownChart";
import { FunnelChart } from "@/components/analytics/FunnelChart";
import { CompetitorBenchmark } from "@/components/analytics/CompetitorBenchmark";
import { TopListingsTable } from "@/components/analytics/TopListingsTable";
import { InsightCard } from "@/components/analytics/InsightCard";

function SectionEyebrow({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p
      id={id}
      className="text-[11px] font-semibold uppercase tracking-wider text-slate-500"
    >
      {children}
    </p>
  );
}

type StoreAnalyticsWorkspaceProps = {
  seller: SellerStorefront;
  listings: SellerDashboardListing[];
};

export function StoreAnalyticsWorkspace({ seller, listings }: StoreAnalyticsWorkspaceProps) {
  const historyCapDays = useAnalyticsHistoryCap();
  const [period, setPeriodInternal] = useState<StoreAnalyticsPeriod>("30d");
  const [analytics, setAnalytics] = useState<StoreAnalytics | null>(null);
  const [insights, setInsights] = useState<StoreInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const setPeriod = useCallback((next: StoreAnalyticsPeriod) => {
    setLoading(true);
    setPeriodInternal(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [a, i] = await Promise.all([
          mockStoreAnalyticsService.getStoreAnalytics(seller.id, period),
          mockStoreAnalyticsService.getStoreInsights(seller.id, period),
        ]);
        if (!cancelled) {
          setAnalytics(a);
          setInsights(i);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [seller.id, period]);

  const marketingPriceHref = `/dashboard/store?sellerId=${encodeURIComponent(seller.id)}&marketing=price_analytics`;
  const periodCap = periodCaptionAccusative(period);

  async function handleExportCsv() {
    setExporting(true);
    try {
      const csv = await mockStoreAnalyticsService.exportStoreAnalyticsCsv(seller.id, period);
      const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `store-analytics-${seller.id}-${period}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <section
      id="dashboard-store-insights"
      className="space-y-6 rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 p-4 shadow-sm sm:space-y-8 sm:p-6"
    >
      <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:pb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-900 text-white">
              <LineChart className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Аналитика магазина</h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
                Решения по трафику и карточкам на демо-рядах. Цены относительно рынка — в{" "}
                <Link
                  href={marketingPriceHref}
                  className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
                >
                  маркетинге → аналитика цен
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <SectionEyebrow>Период</SectionEyebrow>
            <AnalyticsPeriodTabs value={period} onChange={setPeriod} historyCapDays={historyCapDays} />
            <AnalyticsPeriodContextLine period={period} historyCapDays={historyCapDays} />
          </div>
        </div>
      </header>

      {loading || !analytics ? (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-600">
          Загружаем аналитику…
        </p>
      ) : (
        <div className="space-y-8">
          <section className="space-y-3" aria-labelledby="analytics-kpi-heading">
            <SectionEyebrow id="analytics-kpi-heading">Сводка</SectionEyebrow>
            <AnalyticsKpiStrip
              analytics={analytics}
              totalFollowers={seller.followersCount}
              summaryLine={`Суммы по дням ${periodCap}; конверсия и просмотры согласованы с графиками ниже.`}
            />
          </section>

          <section className="space-y-3" aria-labelledby="analytics-trends-heading">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <SectionEyebrow id="analytics-trends-heading">Тренды</SectionEyebrow>
                <p className="text-xs text-slate-500">Один и тот же период для обоих графиков.</p>
              </div>
            </div>
            <RevenueChart analytics={analytics} historyCapDays={historyCapDays} />
            <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
              <ViewsChart analytics={analytics} historyCapDays={historyCapDays} />
              <CategoryBreakdownChart rows={analytics.categoryBreakdown} />
            </div>
          </section>

          <section className="space-y-3" aria-labelledby="analytics-depth-heading">
            <div>
              <SectionEyebrow id="analytics-depth-heading">Углубление</SectionEyebrow>
              <p className="text-xs text-slate-500">Воронка и сравнение с нишей — по тарифу (без отдельных проверок плана в UI).</p>
            </div>
            <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
              <div className="flex min-h-0 flex-col rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm sm:p-4">
                <h3 className="text-sm font-semibold text-slate-900">Воронка</h3>
                <p className="text-xs text-slate-500">Просмотры → клики → контакты → сделки (агрегат за период).</p>
                <div className="mt-3 min-h-0 flex-1">
                  <FeatureGate feature="store_analytics_funnel">
                    <FunnelChart steps={analytics.funnelData} />
                  </FeatureGate>
                </div>
              </div>
              <div className="flex min-h-0 flex-col rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm sm:p-4">
                <FeatureGate feature="store_analytics_benchmark">
                  <CompetitorBenchmark
                    rows={analytics.competitorBenchmark}
                    nicheLabel={analytics.competitorBenchmark[0]?.niche ?? "ниша"}
                  />
                </FeatureGate>
              </div>
            </div>
          </section>

          <section className="space-y-3" aria-labelledby="analytics-top-heading">
            <div>
              <SectionEyebrow id="analytics-top-heading">Действия по карточкам</SectionEyebrow>
              <p className="text-xs text-slate-500">Кого усилить продвижением в первую очередь.</p>
            </div>
            <TopListingsTable rows={analytics.topListings} listings={listings} sellerId={seller.id} />
          </section>

          <section className="space-y-3" aria-labelledby="analytics-insights-heading">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <SectionEyebrow id="analytics-insights-heading">Инсайты</SectionEyebrow>
                <p className="text-xs text-slate-500">Сжатые выводы из тех же рядов, что и KPI и графики.</p>
              </div>
              <FeatureGate feature="store_analytics_export">
                <button
                  type="button"
                  disabled={exporting}
                  onClick={() => void handleExportCsv()}
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
                >
                  {exporting ? "Формируем CSV…" : "Экспорт CSV"}
                </button>
              </FeatureGate>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
