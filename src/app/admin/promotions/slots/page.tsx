"use client";

import { Fragment, useMemo, useState } from "react";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminSlotUtilizationBar } from "@/components/admin/AdminSlotUtilizationBar";
import { useAdminConsole } from "@/components/admin/admin-console-context";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { adminPatchPromotionSlot, listAdminPromotionSlots, listPromotionsForSlotKey } from "@/services/promotions";
import type { AdminPromotionSlot } from "@/services/promotions";

export default function AdminPromotionSlotsPage() {
  const { persona } = useAdminConsole();
  const canWrite = persona === "admin" || persona === "finance";
  const [tick, setTick] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);
  const [openKey, setOpenKey] = useState<string | null>(null);

  const slots = useMemo(() => {
    void tick;
    return listAdminPromotionSlots();
  }, [tick]);

  const bump = (msg: string) => {
    setBanner(msg);
    setTick((x) => x + 1);
    window.setTimeout(() => setBanner(null), 4500);
  };

  const rows = slots.map((s: AdminPromotionSlot) => {
    const overflow = s.activeCount > s.capacity;
    return [
      <Fragment key={`${s.id}-k`}>
        <span className="font-mono text-xs">{s.key}</span>
      </Fragment>,
      <Fragment key={`${s.id}-t`}>
        <span className="font-medium text-slate-900">{s.title}</span>
        <p className="text-xs text-slate-500">{s.scopeLabel ?? "—"}</p>
      </Fragment>,
      <Fragment key={`${s.id}-loc`}>
        <span className="text-xs capitalize">{s.location}</span>
      </Fragment>,
      <Fragment key={`${s.id}-u`}>
        <AdminSlotUtilizationBar active={s.activeCount} capacity={s.capacity} />
        {overflow ? <span className="mt-1 block text-[10px] font-bold text-amber-800">Переполнение (mock)</span> : null}
      </Fragment>,
      <Fragment key={`${s.id}-pm`}>
        <span className="text-xs">{s.pricingModel === "auction_mock" ? "Аукцион (mock)" : "Фикс"}</span>
      </Fragment>,
      <Fragment key={`${s.id}-bp`}>
        <span className="text-sm">{s.basePrice.toLocaleString("ru-RU")} ₽</span>
      </Fragment>,
      <Fragment key={`${s.id}-st`}>
        <AdminStatusBadge tone={s.status === "active" ? "success" : "warning"}>{s.status}</AdminStatusBadge>
      </Fragment>,
      <Fragment key={`${s.id}-a`}>
        <div className="flex flex-col gap-1">
          <button type="button" className="text-left text-xs font-semibold text-sky-800 hover:underline" onClick={() => setOpenKey(openKey === s.key ? null : s.key)}>
            {openKey === s.key ? "Скрыть" : "Кто в слоте"}
          </button>
          <AdminInternalLink href={`/admin/promotions/listings?placement=${encodeURIComponent(s.key)}`} className="text-xs font-semibold text-slate-700 hover:underline">
            Открыть в списке
          </AdminInternalLink>
          {canWrite ? (
            <div className="flex flex-wrap gap-1 pt-1">
              <button
                type="button"
                className="rounded border border-slate-200 px-2 py-0.5 text-[10px] font-semibold"
                onClick={() => {
                  adminPatchPromotionSlot(s.id, { status: s.status === "active" ? "paused" : "active" });
                  bump(`Слот ${s.key}: статус обновлён (mock).`);
                }}
              >
                {s.status === "active" ? "Пауза" : "Снять паузу"}
              </button>
              <button
                type="button"
                className="rounded border border-slate-200 px-2 py-0.5 text-[10px] font-semibold"
                onClick={() => {
                  adminPatchPromotionSlot(s.id, { capacity: s.capacity + 1 });
                  bump(`Ёмкость ${s.key} +1 (mock).`);
                }}
              >
                +ёмкость
              </button>
            </div>
          ) : null}
        </div>
      </Fragment>,
    ];
  });

  return (
    <div className="space-y-4">
      {banner ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          {banner}
        </p>
      ) : null}
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs("/admin/promotions/slots")}
        title="Слоты и размещения"
        subtitle="Ёмкость, заполнение и связанные промо (mock, не ad server)."
      />
      <AdminPageSection title="Очередь по слотам">
        {openKey ? (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-slate-900">Активные в «{openKey}»</p>
            <ul className="mt-2 space-y-1">
              {listPromotionsForSlotKey(openKey).map((p) => (
                <li key={p.id}>
                  <AdminInternalLink href={`/admin/promotions/${encodeURIComponent(p.id)}`} className="hover:underline">
                    {p.title}
                  </AdminInternalLink>{" "}
                  <span className="text-xs text-slate-500">({p.id})</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <AdminDataTable
          columns={[
            { key: "k", label: "Ключ" },
            { key: "t", label: "Слот" },
            { key: "loc", label: "Локация" },
            { key: "u", label: "Заполнение" },
            { key: "pm", label: "Модель" },
            { key: "bp", label: "База ₽" },
            { key: "st", label: "Статус" },
            { key: "a", label: "Действия" },
          ]}
          rows={rows}
        />
      </AdminPageSection>
    </div>
  );
}
