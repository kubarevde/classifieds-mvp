"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminNotesPanel } from "@/components/admin/AdminNotesPanel";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTimeline } from "@/components/admin/AdminTimeline";
import { useAdminConsole } from "@/components/admin/admin-console-context";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import type { AdminAuditEvent } from "@/services/admin/types";
import {
  adminDuplicateCampaign,
  adminPatchPromoCampaign,
  getAdminPromotionById,
  getAdminPromoCampaignById,
} from "@/services/promotions";

export default function AdminPromoCampaignDetailPage() {
  const params = useParams();
  const raw = String(params.id ?? "");
  const id = decodeURIComponent(raw);
  const { persona } = useAdminConsole();
  const canWrite = persona === "admin" || persona === "finance";
  const [tick, setTick] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);

  const camp = useMemo(() => {
    void tick;
    return getAdminPromoCampaignById(id);
  }, [id, tick]);

  const timeline: AdminAuditEvent[] = useMemo(() => {
    if (!camp) return [];
    return [
      {
        id: "c1",
        at: new Date(camp.startsAt).toLocaleString("ru-RU"),
        actor: "marketing_mock",
        action: "Кампания создана",
        detail: `Охват: ${camp.targetScope}`,
      },
      {
        id: "c2",
        at: new Date().toLocaleString("ru-RU"),
        actor: "ops_console",
        action: "Сводка",
        detail: `Связано промо: ${camp.linkedPromotionIds.length}, spent ${camp.spent.toLocaleString("ru-RU")} ₽`,
      },
    ];
  }, [camp]);

  if (!camp) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-900">Кампания не найдена</p>
        <AdminInternalLink href="/admin/promotions/campaigns" className="mt-3 inline-block text-sm font-semibold text-sky-800 hover:underline">
          К списку
        </AdminInternalLink>
      </div>
    );
  }

  const pct = camp.budget > 0 ? Math.min(100, Math.round((camp.spent / camp.budget) * 100)) : 0;

  return (
    <div className="space-y-6">
      {banner ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          {banner}
        </p>
      ) : null}
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs(`/admin/promotions/campaigns/${encodeURIComponent(id)}`)}
        title={camp.title}
        subtitle={`Охват: ${camp.targetScope}${camp.targetScopeLabel ? ` · ${camp.targetScopeLabel}` : ""}`}
      />

      <AdminPageSection title="Сводка">
        <div className="flex flex-wrap gap-2">
          <AdminStatusBadge tone={camp.status === "active" ? "success" : camp.status === "paused" ? "warning" : "neutral"}>{camp.status}</AdminStatusBadge>
        </div>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Бюджет</dt>
            <dd className="font-medium">{camp.budget.toLocaleString("ru-RU")} ₽</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Потрачено</dt>
            <dd className="font-medium">{camp.spent.toLocaleString("ru-RU")} ₽ ({pct}%)</dd>
          </div>
        </dl>
        <div className="mt-3 h-2 w-full max-w-md overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-violet-600" style={{ width: `${pct}%` }} />
        </div>
      </AdminPageSection>

      <AdminPageSection title="Связанные промо">
        {camp.linkedPromotionIds.length === 0 ? (
          <p className="text-sm text-slate-600">Нет привязанных строк (mock).</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {camp.linkedPromotionIds.map((pid) => {
              const p = getAdminPromotionById(pid);
              return (
                <li key={pid}>
                  <AdminInternalLink href={`/admin/promotions/${encodeURIComponent(pid)}`} className="font-semibold hover:underline">
                    {p?.title ?? pid}
                  </AdminInternalLink>
                </li>
              );
            })}
          </ul>
        )}
      </AdminPageSection>

      <AdminTimeline events={timeline} title="Хронология (mock)" />

      <AdminNotesPanel entityType="promo_campaign" entityId={id} title="Заметки по кампании" />

      {canWrite ? (
        <AdminPageSection title="Действия">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
              onClick={() => {
                adminPatchPromoCampaign(id, { status: "active" });
                setBanner("Кампания активирована (mock).");
                setTick((x) => x + 1);
              }}
            >
              Активировать
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
              onClick={() => {
                adminPatchPromoCampaign(id, { status: "paused" });
                setBanner("Кампания на паузе (mock).");
                setTick((x) => x + 1);
              }}
            >
              Пауза
            </button>
            <button
              type="button"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-900"
              onClick={() => {
                adminPatchPromoCampaign(id, { status: "cancelled" });
                setBanner("Кампания отменена (mock).");
                setTick((x) => x + 1);
              }}
            >
              Отменить
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
              onClick={() => {
                const copy = adminDuplicateCampaign(id);
                setBanner(copy ? `Создана копия: ${copy.id}` : "Не удалось (mock).");
                setTick((x) => x + 1);
              }}
            >
              Дублировать
            </button>
          </div>
        </AdminPageSection>
      ) : null}
    </div>
  );
}
