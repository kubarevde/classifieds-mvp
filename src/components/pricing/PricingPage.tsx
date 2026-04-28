"use client";

import { useEffect, useMemo, useState } from "react";

import { formatPlanPrice, type Plan, type SubscriptionPlan } from "@/entities/billing/model";
import { mockBillingService } from "@/services/billing";
import { useSubscription } from "@/components/subscription/subscription-provider";

const compareRows = [
  { key: "active_listings", label: "Активные объявления" },
  { key: "photos_per_listing", label: "Фото на объявление" },
  { key: "listing_duration_days", label: "Срок объявления" },
  { key: "analytics_history_days", label: "История аналитики" },
  { key: "campaigns_active", label: "Кампании" },
  { key: "boosts_per_month", label: "Бусты в месяц" },
  { key: "featured_days_per_month", label: "Featured days" },
  { key: "team_members", label: "Участники команды" },
] as const;

function planSort(a: SubscriptionPlan, b: SubscriptionPlan) {
  const rank: Record<Plan, number> = { free: 0, starter: 1, pro: 2, business: 3 };
  return rank[a.id] - rank[b.id];
}

function formatLimit(value: number, suffix = "") {
  if (value < 0) return "Без лимита";
  return `${value}${suffix}`;
}

export function PricingPage() {
  const subscription = useSubscription();
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");
  const [showCompare, setShowCompare] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    void mockBillingService.getPlans().then((items) => setPlans(items.sort(planSort)));
  }, []);

  const currentStorePlanLabel = useMemo(() => {
    if (subscription.storePlan === "business") return "business";
    if (subscription.storePlan === "pro") return "pro";
    return "starter";
  }, [subscription.storePlan]);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Тарифы для магазинов</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Планы построены вокруг лимитов объявлений, продвижения и аналитики: оплачиваете только тот объем роста,
          который нужен вашему магазину.
        </p>
        <div className="inline-flex items-center rounded-lg border border-slate-200 p-1 text-sm">
          <button
            type="button"
            onClick={() => setCycle("monthly")}
            className={`rounded-md px-3 py-1.5 ${cycle === "monthly" ? "bg-slate-900 text-white" : "text-slate-700"}`}
          >
            Ежемесячно
          </button>
          <button
            type="button"
            onClick={() => setCycle("annual")}
            className={`rounded-md px-3 py-1.5 ${cycle === "annual" ? "bg-slate-900 text-white" : "text-slate-700"}`}
          >
            Ежегодно
          </button>
          <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
            -20%
          </span>
        </div>
      </header>

      <section className="grid gap-3 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = currentStorePlanLabel === plan.id;
          return (
            <article
              key={plan.id}
              className={`rounded-2xl border p-4 ${plan.popular ? "border-slate-900 shadow-md" : "border-slate-200"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900">{plan.name}</h2>
                {plan.badge ? <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs">{plan.badge}</span> : null}
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatPlanPrice(plan, cycle)}</p>
              <ul className="mt-3 space-y-1 text-xs text-slate-600">
                <li>До {formatLimit(plan.limits.active_listings)} объявлений</li>
                <li>{formatLimit(plan.limits.photos_per_listing)} фото на карточку</li>
                <li>{formatLimit(plan.limits.campaigns_active)} кампаний одновременно</li>
                <li>{formatLimit(plan.limits.analytics_history_days)} дней аналитики</li>
              </ul>
              <button className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white">
                {isCurrent ? "Текущий тариф" : "Выбрать тариф"}
              </button>
            </article>
          );
        })}
      </section>

      <section>
        <button
          type="button"
          onClick={() => setShowCompare((v) => !v)}
          className="text-sm font-semibold text-slate-800 underline underline-offset-2"
        >
          {showCompare ? "Скрыть детальное сравнение" : "Показать детальное сравнение"}
        </button>
        {showCompare ? (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="px-3 py-2">Параметр</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="px-3 py-2">{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row) => (
                  <tr key={row.key} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-700">{row.label}</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-3 py-2 text-slate-700">
                        {formatLimit(plan.limits[row.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-semibold text-slate-900">FAQ</h3>
        <p className="text-sm text-slate-700">Чем отличается Free от Starter? Starter дает больше лимитов и рост-инструменты.</p>
        <p className="text-sm text-slate-700">Когда нужен Pro? Когда упираетесь в лимиты кампаний и глубины аналитики.</p>
        <p className="text-sm text-slate-700">Можно ли перейти назад? Да, downgrade доступен в любой момент.</p>
        <p className="text-sm text-slate-700">Что будет с объявлениями при downgrade? Лишние позиции останутся, но новые создать нельзя до лимита.</p>
        <p className="text-sm text-slate-700">Как работают лимиты? Лимиты считаются по текущему billing-cycle и usage snapshot.</p>
        <p className="text-sm text-slate-700">Платежи реальные? Сейчас demo/mock, но сервис и контракты готовы к backend payments stage.</p>
      </section>
    </div>
  );
}
