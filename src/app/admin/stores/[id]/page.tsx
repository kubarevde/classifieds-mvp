import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminMockActionRow } from "@/components/admin/AdminMockActionRow";
import { AdminNotesPanel } from "@/components/admin/AdminNotesPanel";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { getAdminListings, getAdminPayouts, getAdminStoreById, getAdminSubscriptions } from "@/services/admin";
import { listPromotionsForStore } from "@/services/promotions";

type Props = { params: Promise<{ id: string }> };

export default async function AdminStoreDetailPage({ params }: Props) {
  const { id } = await params;
  const store = await getAdminStoreById(id);
  if (!store) {
    notFound();
  }
  const listings = (await getAdminListings()).filter((l) => l.sellerUserId.includes(id));
  const sub = getAdminSubscriptions().find((s) => s.accountRefId === id);
  const payout = getAdminPayouts().find((p) => p.storeId === id);
  const promos = listPromotionsForStore(id);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs(`/admin/stores/${id}`)}
        title={store.name}
        subtitle={`Фокус: ${store.worldFocus}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href={`/stores/${id}`} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
              Витрина
            </Link>
            <AdminInternalLink href={`/admin/users/${encodeURIComponent(store.ownerUserId)}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800">
              Владелец
            </AdminInternalLink>
          </div>
        }
      />

      <AdminPageSection title="Сводка">
        <div className="flex flex-wrap gap-2">
          <AdminStatusBadge tone={store.status === "active" ? "success" : "warning"}>{store.status}</AdminStatusBadge>
          <AdminStatusBadge tone={store.verified ? "success" : "neutral"}>{store.verified ? "Верифицирован" : "Не верифицирован"}</AdminStatusBadge>
        </div>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">План</dt>
            <dd className="font-medium">{store.planLabel}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Активные объявления</dt>
            <dd className="font-medium">{store.activeListings}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Trust</dt>
            <dd className="font-medium">{store.trustScore}</dd>
          </div>
          {sub ? (
            <div>
              <dt className="text-xs text-slate-500">Подписка</dt>
              <dd>
                <AdminInternalLink href={`/admin/subscriptions/${encodeURIComponent(sub.id)}`} className="font-medium text-sky-800 hover:underline">
                  {sub.currentPlanLabel}
                </AdminInternalLink>
              </dd>
            </div>
          ) : null}
          {payout ? (
            <div>
              <dt className="text-xs text-slate-500">Выплата (mock)</dt>
              <dd className="font-medium">
                {payout.amountRub.toLocaleString("ru-RU")} ₽ · {payout.status}
              </dd>
            </div>
          ) : null}
        </dl>
      </AdminPageSection>

      <AdminPageSection title="Активные продвижения">
        {promos.length === 0 ? (
          <p className="text-sm text-slate-600">Нет промо-записей по магазину (mock).</p>
        ) : (
          <ul className="text-sm">
            {promos.slice(0, 8).map((pr) => (
              <li key={pr.id}>
                <AdminInternalLink href={`/admin/promotions/${encodeURIComponent(pr.id)}`} className="font-semibold text-violet-900 hover:underline">
                  {pr.title}
                </AdminInternalLink>{" "}
                <span className="text-xs text-slate-500">
                  ({pr.type}, {pr.status})
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs">
          <AdminInternalLink href="/admin/promotions" className="font-semibold text-sky-800 hover:underline">
            Консоль продвижения
          </AdminInternalLink>
        </p>
      </AdminPageSection>

      <AdminPageSection title="Объявления магазина">
        <ul className="text-sm">
          {listings.slice(0, 12).map((l) => (
            <li key={l.id}>
              <AdminInternalLink href={`/admin/listings/${l.id}`} className="hover:underline">
                {l.title}
              </AdminInternalLink>
            </li>
          ))}
        </ul>
      </AdminPageSection>

      <AdminPageSection title="Связанные разделы">
        <ul className="flex flex-wrap gap-3 text-sm font-semibold text-sky-800">
          <li>
            <AdminInternalLink href="/admin/subscriptions/payouts" className="hover:underline">
              Выплаты
            </AdminInternalLink>
          </li>
          <li>
            <AdminInternalLink href="/admin/moderation/reports" className="hover:underline">
              Жалобы
            </AdminInternalLink>
          </li>
          {id === "marina-tech" ? (
            <li>
              <AdminInternalLink href="/admin/cases/case-marina-billing" className="hover:underline text-amber-900">
                Сквозной кейс (mock)
              </AdminInternalLink>
            </li>
          ) : null}
        </ul>
      </AdminPageSection>

      <AdminNotesPanel entityType="store" entityId={id} />

      <AdminPageSection title="Действия (mock)">
        <AdminMockActionRow storeId={id} />
      </AdminPageSection>
    </div>
  );
}
