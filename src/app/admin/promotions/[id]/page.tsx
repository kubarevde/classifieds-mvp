"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminNotesPanel } from "@/components/admin/AdminNotesPanel";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { AdminPromotionTypeBadge } from "@/components/admin/AdminPromotionTypeBadge";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTimeline } from "@/components/admin/AdminTimeline";
import { useAdminConsole } from "@/components/admin/admin-console-context";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import {
  adminPatchPromotion,
  getAdminPromotionById,
  getAdminPromotionTimeline,
} from "@/services/promotions";

const SOURCE_RU = {
  paid_purchase: "Оплата",
  subscription_entitlement: "Подписка / entitlement",
  admin_grant: "Админский грант",
} as const;

function statusTone(s: string): "neutral" | "success" | "warning" | "danger" {
  if (s === "active") return "success";
  if (s === "paused" || s === "scheduled") return "warning";
  if (s === "expired" || s === "rejected") return "danger";
  return "neutral";
}

export default function AdminPromotionDetailPage() {
  const params = useParams();
  const raw = String(params.id ?? "");
  const id = decodeURIComponent(raw);
  const { persona } = useAdminConsole();
  const canWrite = persona === "admin" || persona === "finance";
  const [tick, setTick] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);

  const p = useMemo(() => {
    void tick;
    return getAdminPromotionById(id);
  }, [id, tick]);

  const timeline = useMemo(() => {
    void tick;
    return getAdminPromotionTimeline(id);
  }, [id, tick]);

  if (!p) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-900">Размещение не найдено</p>
        <AdminInternalLink href="/admin/promotions/listings" className="mt-3 inline-block text-sm font-semibold text-sky-800 hover:underline">
          К списку
        </AdminInternalLink>
      </div>
    );
  }

  const targetHref =
    p.targetType === "listing" ? `/admin/listings/${encodeURIComponent(p.targetId)}` : `/admin/stores/${encodeURIComponent(p.targetId)}`;

  return (
    <div className="space-y-6">
      {banner ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          {banner}
        </p>
      ) : null}
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs(`/admin/promotions/${encodeURIComponent(id)}`)}
        title={p.title}
        subtitle={`${p.id} · ${SOURCE_RU[p.source]}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <AdminPromotionTypeBadge type={p.type} />
            <AdminStatusBadge tone={statusTone(p.status)}>{p.status}</AdminStatusBadge>
          </div>
        }
      />

      <AdminPageSection title="Сводка">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Цена</dt>
            <dd className="font-medium">
              {p.price.toLocaleString("ru-RU")} {p.currency}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Биллинг</dt>
            <dd className="font-medium">{p.billingModel === "duration_based" ? "По сроку" : "Разово"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Показы / клики / CTR</dt>
            <dd className="font-medium">
              {p.impressions.toLocaleString("ru-RU")} · {p.clicks} · {(p.ctr * 100).toFixed(2)}%
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Слот</dt>
            <dd className="font-medium">{p.placementKey ?? "—"}</dd>
          </div>
          {(p.flagged || p.suspiciousCtr) && (
            <div className="sm:col-span-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
              {p.suspiciousCtr ? "Подозрительный CTR. " : ""}
              {p.flagged ? "Помечено для модерации/риска. " : ""}
              <AdminInternalLink href="/admin/moderation/reports" className="font-semibold underline">
                Модерация
              </AdminInternalLink>
              {" · "}
              <AdminInternalLink href="/admin/cases/case-buyer-safety" className="font-semibold underline">
                Пример кейса
              </AdminInternalLink>
            </div>
          )}
        </dl>
      </AdminPageSection>

      <AdminPageSection title="Цель и владелец">
        <ul className="space-y-2 text-sm">
          <li>
            <AdminInternalLink href={targetHref} className="font-semibold text-sky-800 hover:underline">
              {p.targetType === "listing" ? "Объявление" : "Магазин"}: {p.targetId}
            </AdminInternalLink>
          </li>
          <li>
            <AdminInternalLink href={`/admin/users/${encodeURIComponent(p.ownerId)}`} className="font-semibold text-sky-800 hover:underline">
              Владелец: {p.ownerId}
            </AdminInternalLink>
          </li>
          {p.storeId ? (
            <li>
              <AdminInternalLink href={`/admin/stores/${encodeURIComponent(p.storeId)}`} className="font-semibold text-sky-800 hover:underline">
                Магазин: {p.storeId}
              </AdminInternalLink>
            </li>
          ) : null}
        </ul>
      </AdminPageSection>

      <AdminPageSection title="Биллинг и кампании">
        <ul className="space-y-1 text-sm text-slate-700">
          {p.linkedSubscriptionId ? (
            <li>
              Подписка:{" "}
              <AdminInternalLink href={`/admin/subscriptions/${encodeURIComponent(p.linkedSubscriptionId)}`} className="font-semibold hover:underline">
                {p.linkedSubscriptionId}
              </AdminInternalLink>
            </li>
          ) : (
            <li>Подписка: —</li>
          )}
          {p.linkedInvoiceId ? (
            <li>
              Счёт:{" "}
              <AdminInternalLink href="/admin/subscriptions/invoices" className="font-semibold hover:underline">
                {p.linkedInvoiceId}
              </AdminInternalLink>{" "}
              (см. список счетов)
            </li>
          ) : (
            <li>Счёт: —</li>
          )}
          {p.campaignId ? (
            <li>
              Кампания:{" "}
              <AdminInternalLink href={`/admin/promotions/campaigns/${encodeURIComponent(p.campaignId)}`} className="font-semibold hover:underline">
                {p.campaignId}
              </AdminInternalLink>
            </li>
          ) : (
            <li>Кампания: —</li>
          )}
        </ul>
      </AdminPageSection>

      <AdminTimeline events={timeline} title="События" />

      <AdminNotesPanel entityType="promotion" entityId={id} />

      {canWrite ? (
        <AdminPageSection title="Действия">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white"
              onClick={() => {
                adminPatchPromotion(id, { status: "paused" });
                setBanner("Статус: пауза (mock).");
                setTick((x) => x + 1);
              }}
            >
              Пауза
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
              onClick={() => {
                adminPatchPromotion(id, { status: "active" });
                setBanner("Статус: активно (mock).");
                setTick((x) => x + 1);
              }}
            >
              Возобновить
            </button>
            <button
              type="button"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-900"
              onClick={() => {
                adminPatchPromotion(id, { status: "expired", endsAt: new Date().toISOString() });
                setBanner("Принудительно истекло (mock).");
                setTick((x) => x + 1);
              }}
            >
              Истечь
            </button>
            <button
              type="button"
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950"
              onClick={() => {
                adminPatchPromotion(id, { source: "admin_grant", price: 0 });
                setBanner("Выдан админский грант (mock).");
                setTick((x) => x + 1);
              }}
            >
              Админ-грант
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
              onClick={() => {
                adminPatchPromotion(id, { source: "paid_purchase", price: Math.max(p.price, 290) });
                setBanner("Грант отозван → оплата (mock).");
                setTick((x) => x + 1);
              }}
            >
              Отозвать грант
            </button>
          </div>
        </AdminPageSection>
      ) : null}
    </div>
  );
}
