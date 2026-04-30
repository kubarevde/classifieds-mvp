"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminNotesPanel } from "@/components/admin/AdminNotesPanel";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { adminPatchSubscription, getAdminInvoices, getAdminSubscriptionById } from "@/services/admin";
import { listPromotionsForSubscription } from "@/services/promotions";

export default function AdminSubscriptionDetailPage() {
  const params = useParams();
  const raw = String(params.id ?? "");
  const id = decodeURIComponent(raw);
  const [tick, setTick] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(null), 4000);
    return () => window.clearTimeout(t);
  }, [banner]);

  const sub = useMemo(() => {
    void tick;
    return getAdminSubscriptionById(id);
  }, [id, tick]);

  const invoices = useMemo(() => {
    void tick;
    if (!sub) return [];
    return getAdminInvoices()
      .filter((inv) => inv.accountLabel === sub.accountLabel)
      .slice(0, 8);
  }, [sub, tick]);

  const linkedPromos = useMemo(() => {
    void tick;
    if (!sub) return [];
    return listPromotionsForSubscription(id);
  }, [id, sub, tick]);

  const bump = (message: string) => {
    setBanner(message);
    setTick((x) => x + 1);
  };

  if (!sub) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-900">Подписка не найдена</p>
        <p className="mt-1 text-sm text-slate-600">Проверьте идентификатор в адресной строке или вернитесь к списку.</p>
        <AdminInternalLink
          href="/admin/subscriptions"
          className="mt-4 inline-flex h-10 items-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
        >
          К списку подписок
        </AdminInternalLink>
      </div>
    );
  }

  const accountHref =
    sub.accountType === "store"
      ? `/admin/stores/${encodeURIComponent(sub.accountRefId)}`
      : `/admin/users/${encodeURIComponent(sub.accountRefId === "buyer-dmitriy" ? `buyer-account:${sub.accountRefId}` : `seller-account:${sub.accountRefId}`)}`;

  return (
    <div className="space-y-6">
      {banner ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          {banner}
        </p>
      ) : null}

      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs(`/admin/subscriptions/${encodeURIComponent(id)}`)}
        title={sub.accountLabel}
        subtitle={`План: ${sub.currentPlanLabel}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <AdminInternalLink href={accountHref} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800">
              {sub.accountType === "store" ? "Открыть магазин" : "Открыть профиль"}
            </AdminInternalLink>
            {id === "sub-marina-tech" ? (
              <AdminInternalLink href="/admin/cases/case-marina-billing" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
                Сквозной кейс
              </AdminInternalLink>
            ) : null}
            <button
              type="button"
              className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
              onClick={() => {
                adminPatchSubscription(id, { status: "active", paymentStatus: "ok" });
                bump("Компенсация применена, статус активен, платёж ок (mock).");
              }}
            >
              Компенсация / восстановить
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
              onClick={() => {
                adminPatchSubscription(id, { status: "paused" });
                bump("Подписка приостановлена (mock).");
              }}
            >
              Приостановить
            </button>
            <button
              type="button"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-900"
              onClick={() => {
                adminPatchSubscription(id, { status: "canceled" });
                bump("Подписка отменена (mock).");
              }}
            >
              Отменить
            </button>
            <button
              type="button"
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900"
              onClick={() => {
                adminPatchSubscription(id, { paymentStatus: "pending" });
                bump("Платёж в очереди на повтор (mock).");
              }}
            >
              Повторить оплату
            </button>
          </div>
        }
      />

      <AdminPageSection title="Статус">
        <div className="flex flex-wrap gap-2">
          <AdminStatusBadge tone={sub.status === "active" ? "success" : "warning"}>{sub.status}</AdminStatusBadge>
          <AdminStatusBadge tone={sub.paymentStatus === "ok" ? "success" : "danger"}>{sub.paymentStatus}</AdminStatusBadge>
        </div>
      </AdminPageSection>

      <AdminPageSection title="Entitlements и продвижение">
        <p className="text-sm text-slate-600">
          План <span className="font-semibold">{sub.currentPlanLabel}</span> может включать бусты и избранное — ниже связанные строки из консоли продвижения (mock).
        </p>
        {linkedPromos.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Нет привязанных промо к этой подписке.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {linkedPromos.map((pr) => (
              <li key={pr.id}>
                <AdminInternalLink href={`/admin/promotions/${encodeURIComponent(pr.id)}`} className="font-semibold text-violet-900 hover:underline">
                  {pr.title}
                </AdminInternalLink>
                <span className="text-xs text-slate-500">
                  {" "}
                  · {pr.source} · {pr.status}
                </span>
              </li>
            ))}
          </ul>
        )}
        <AdminInternalLink href="/admin/promotions/pricing" className="mt-2 inline-block text-xs font-semibold text-sky-800 hover:underline">
          Правила цен и entitlements
        </AdminInternalLink>
      </AdminPageSection>

      <AdminPageSection title="Счета">
        {invoices.length === 0 ? (
          <p className="text-sm text-slate-600">Нет счетов, привязанных к этому аккаунту в mock-данных.</p>
        ) : (
          <ul className="text-sm">
            {invoices.map((inv) => (
              <li key={inv.id}>
                {inv.id} · {inv.amountRub.toLocaleString("ru-RU")} ₽ · {inv.status}
              </li>
            ))}
          </ul>
        )}
        <AdminInternalLink href="/admin/subscriptions/invoices" className="mt-2 inline-block text-sm font-semibold text-sky-800 hover:underline">
          Все счета
        </AdminInternalLink>
      </AdminPageSection>

      <AdminNotesPanel entityType="subscription" entityId={id} />
    </div>
  );
}
