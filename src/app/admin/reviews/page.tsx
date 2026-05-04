import Link from "next/link";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { reviewsService } from "@/services/reviews";

export default function AdminReviewsQueuePage() {
  const flagged = reviewsService.getFlaggedReviews();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs("/admin/reviews")}
        title="Отзывы на модерации"
        subtitle="Жалобы по отзывам после сделок (mock P33)."
      />
      <AdminPageSection title="Очередь flagged">
        {flagged.length === 0 ? (
          <p className="text-sm text-slate-600">Нет отзывов в статусе «на модерации».</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {flagged.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <AdminInternalLink href={`/admin/reviews/${encodeURIComponent(r.id)}`} className="font-semibold text-slate-900 hover:underline">
                  {r.id}
                </AdminInternalLink>
                <span className="text-xs text-slate-600">{r.rating}★</span>
                <span className="text-xs text-rose-700">{r.flagReason}</span>
                <Link href={`/deals/${encodeURIComponent(r.dealId)}`} className="text-xs text-sky-800 hover:underline">
                  Сделка
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AdminPageSection>
    </div>
  );
}
