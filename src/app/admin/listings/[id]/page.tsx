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
import { dealsService } from "@/services/deals";
import { messagesService } from "@/services/messages";
import { reviewsService } from "@/services/reviews";

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
  const relatedThreads = await messagesService.getThreadsByListingId(listing.id);
  const activeDeals = dealsService.getActiveDealsForListing(listing.id);
  const listingReviews = reviewsService.getReviewsForListing(listing.id);

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

      <AdminPageSection title="Связанные диалоги (mock)">
        {relatedThreads.length ? (
          <ul className="space-y-1 text-sm">
            {relatedThreads.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-2">
                <AdminInternalLink href={`/messages/${encodeURIComponent(t.id)}`} className="font-semibold hover:underline">
                  {t.id}
                </AdminInternalLink>
                <span className="text-xs text-slate-600">{t.type}</span>
                <span className="text-xs text-slate-500 line-clamp-1">{t.lastMessage}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Нет тредов по этому объявлению.</p>
        )}
      </AdminPageSection>

      <AdminPageSection title="Отзывы по сделкам объявления">
        {listingReviews.length === 0 ? (
          <p className="text-sm text-slate-500">Нет отзывов, привязанных к сделкам этого листинга.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {listingReviews.map((r) => (
              <li key={r.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <AdminInternalLink href={`/admin/reviews/${encodeURIComponent(r.id)}`} className="font-semibold text-sky-900 hover:underline">
                  {r.id}
                </AdminInternalLink>{" "}
                <span className="text-xs text-slate-600">
                  сделка{" "}
                  <AdminInternalLink href={`/deals/${encodeURIComponent(r.dealId)}`} className="hover:underline">
                    {r.dealId}
                  </AdminInternalLink>
                </span>
                <span className="text-xs text-amber-700"> · {r.rating}★</span> · {r.status}
                <span className="mt-1 block text-slate-700 line-clamp-2">{r.text}</span>
              </li>
            ))}
          </ul>
        )}
      </AdminPageSection>

      <AdminPageSection title="Активные сделки">
        {activeDeals.length ? (
          <ul className="space-y-2 text-sm">
            {activeDeals.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-2 last:border-0">
                <AdminInternalLink href={`/deals/${encodeURIComponent(d.id)}`} className="font-semibold text-slate-900 hover:underline">
                  {d.id}
                </AdminInternalLink>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-700">{d.status}</span>
                <span className="text-xs text-slate-600">{d.amount.toLocaleString("ru-RU")} ₽</span>
                <span className="text-xs text-slate-500">покупатель {d.buyerId}</span>
                <span className="text-xs text-slate-500">продавец {d.sellerId}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Нет активных или спорных сделок по этому объявлению.</p>
        )}
      </AdminPageSection>

      <AdminListingActions listingId={listing.id} sellerUserId={listing.sellerUserId} />

      <AdminNotesPanel entityType="listing" entityId={listing.id} />
    </div>
  );
}
