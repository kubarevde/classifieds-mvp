import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminListingActions } from "@/components/admin/AdminListingActions";
import { AdminNotesPanel } from "@/components/admin/AdminNotesPanel";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { getAdminListingById } from "@/services/admin";
import { listPromotionsForListing } from "@/services/promotions";

type Props = { params: Promise<{ id: string }> };

export default async function AdminListingDetailPage({ params }: Props) {
  const { id } = await params;
  const listing = await getAdminListingById(id);
  if (!listing) {
    notFound();
  }

  const storeFromSeller = listing.sellerUserId.match(/^seller-account:(.+)$/);
  const storeAdminHref = storeFromSeller ? `/admin/stores/${encodeURIComponent(storeFromSeller[1])}` : null;
  const promos = listPromotionsForListing(listing.id);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs(`/admin/listings/${id}`)}
        title={listing.title}
        subtitle={`${listing.worldLabel} · ${listing.categoryLabel}`}
      />

      <AdminPageSection title="Сводка" actions={<AdminStatusBadge tone="neutral">{listing.status}</AdminStatusBadge>}>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Продавец</dt>
            <dd>
              <AdminInternalLink href={`/admin/users/${encodeURIComponent(listing.sellerUserId)}`} className="font-medium text-slate-900 hover:underline">
                {listing.sellerLabel}
              </AdminInternalLink>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Цена</dt>
            <dd className="font-medium">{listing.priceLabel}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Промо (каталог)</dt>
            <dd className="font-medium">{listing.isBoosted || listing.isPromoted ? "Да (mock)" : "Нет"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Флаги</dt>
            <dd className="font-medium">{listing.flagsCount}</dd>
          </div>
        </dl>
      </AdminPageSection>

      <AdminPageSection title="Продвижение (ops)">
        {promos.length === 0 ? (
          <p className="text-sm text-slate-600">Нет записей в консоли продвижения для этого объявления.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {promos.map((pr) => (
              <li key={pr.id} className="flex flex-wrap items-center gap-2">
                <AdminInternalLink href={`/admin/promotions/${encodeURIComponent(pr.id)}`} className="font-semibold text-violet-900 hover:underline">
                  {pr.id}
                </AdminInternalLink>
                <span className="text-xs text-slate-600">
                  {pr.type} · {pr.status} · {pr.price.toLocaleString("ru-RU")} ₽
                </span>
                {pr.flagged ? <span className="rounded bg-rose-100 px-1.5 text-[10px] font-bold text-rose-900">Риск</span> : null}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-slate-500">
          <AdminInternalLink href="/admin/promotions/listings" className="font-semibold text-sky-800 hover:underline">
            Все размещения
          </AdminInternalLink>
        </p>
      </AdminPageSection>

      <AdminPageSection title="Связи">
        <ul className="space-y-1 text-sm text-slate-700">
          <li>
            <AdminInternalLink href="/admin/moderation/reports" className="font-semibold hover:underline">
              История модерации
            </AdminInternalLink>{" "}
            (очередь)
          </li>
          {storeAdminHref ? (
            <li>
              <AdminInternalLink href={storeAdminHref} className="font-semibold hover:underline">
                Магазин продавца
              </AdminInternalLink>
            </li>
          ) : null}
          <li>
            <Link href={`/listings/${listing.id}`} className="font-semibold hover:underline">
              Публичная карточка
            </Link>
          </li>
          <li>
            <AdminInternalLink href="/admin/cases/case-marina-billing" className="font-semibold text-amber-900 hover:underline">
              Сквозной кейс (mock)
            </AdminInternalLink>
          </li>
        </ul>
      </AdminPageSection>

      <AdminListingActions listingId={listing.id} sellerUserId={listing.sellerUserId} />

      <AdminNotesPanel entityType="listing" entityId={listing.id} />
    </div>
  );
}
