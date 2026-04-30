"use client";

import { Fragment, useMemo, useState } from "react";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAdminConsole } from "@/components/admin/admin-console-context";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { getAdminPlans } from "@/services/admin";
import { adminTogglePricingRule, listAdminPromotionPricingRules, type AdminPromotionPricingRule } from "@/services/promotions";

const SCOPE_RU: Record<AdminPromotionPricingRule["targetScope"], string> = {
  default: "По умолчанию",
  world: "Мир",
  category: "Категория",
  plan: "План",
};

export default function AdminPromotionPricingPage() {
  const { persona } = useAdminConsole();
  const canWrite = persona === "admin" || persona === "finance";
  const [tick, setTick] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);

  const rules = useMemo(() => {
    void tick;
    return listAdminPromotionPricingRules();
  }, [tick]);

  const plans = useMemo(() => getAdminPlans(), []);

  const rows = rules.map((r: AdminPromotionPricingRule) => [
    <Fragment key={`${r.id}-t`}>
      <span className="text-xs font-semibold uppercase text-violet-800">{r.promotionType}</span>
    </Fragment>,
    <Fragment key={`${r.id}-sc`}>
      <span className="text-sm">{SCOPE_RU[r.targetScope]}</span>
      <p className="font-mono text-xs text-slate-600">{r.targetValue}</p>
    </Fragment>,
    <Fragment key={`${r.id}-bp`}>
      <span className="text-sm font-medium">{r.basePrice.toLocaleString("ru-RU")} ₽</span>
    </Fragment>,
    <Fragment key={`${r.id}-d`}>
      <span className="text-xs">{r.durationDays != null ? `${r.durationDays} дн.` : "—"}</span>
    </Fragment>,
    <Fragment key={`${r.id}-a`}>
      <AdminStatusBadge tone={r.active ? "success" : "neutral"}>{r.active ? "Активно" : "Выкл."}</AdminStatusBadge>
    </Fragment>,
    <Fragment key={`${r.id}-h`}>
      <span className="text-xs text-slate-600">{r.entitlementHint ?? "—"}</span>
    </Fragment>,
    <Fragment key={`${r.id}-x`}>
      {canWrite ? (
        <button
          type="button"
          className="text-xs font-semibold text-sky-800 hover:underline"
          onClick={() => {
            adminTogglePricingRule(r.id, !r.active);
            setBanner(`Правило ${r.id}: ${!r.active ? "включено" : "выключено"} (mock).`);
            setTick((x) => x + 1);
          }}
        >
          Вкл/выкл
        </button>
      ) : (
        <span className="text-xs text-slate-400">Только просмотр</span>
      )}
    </Fragment>,
  ]);

  return (
    <div className="space-y-6">
      {banner ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          {banner}
        </p>
      ) : null}
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs("/admin/promotions/pricing")}
        title="Цены и правила"
        subtitle="Внутренние правила ценообразования и связь с entitlements тарифов (mock)."
      />

      <AdminPageSection title="Тарифы и promo perks (mock)">
        <p className="mb-3 text-sm text-slate-600">
          Ниже — выжимка из каталога планов: лимиты и бусты. Реальная биллинг-матрица подключится позже; сейчас для согласованности UI.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {plans.map((p) => (
            <li key={p.id} className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm">
              <span className="font-semibold text-slate-900">{p.name}</span>
              <p className="text-xs text-slate-600">{p.limitsSummary}</p>
              <p className="text-xs text-slate-500">{p.featureSummary}</p>
              <AdminInternalLink href="/admin/subscriptions/plans" className="mt-1 inline-block text-xs font-semibold text-sky-800 hover:underline">
                Тарифы
              </AdminInternalLink>
            </li>
          ))}
        </ul>
      </AdminPageSection>

      <AdminPageSection title="Правила по типам продвижения">
        <AdminDataTable
          columns={[
            { key: "t", label: "Тип" },
            { key: "sc", label: "Область" },
            { key: "bp", label: "База" },
            { key: "d", label: "Длительность" },
            { key: "a", label: "Статус" },
            { key: "h", label: "Entitlement / комментарий" },
            { key: "x", label: "" },
          ]}
          rows={rows}
        />
      </AdminPageSection>
    </div>
  );
}
