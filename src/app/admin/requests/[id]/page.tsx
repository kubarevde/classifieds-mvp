import { notFound } from "next/navigation";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminRequestActions } from "@/components/admin/AdminRequestActions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { getAdminRequestById } from "@/services/admin";
import { getResponsesForRequest } from "@/services/requests";

type Props = { params: Promise<{ id: string }> };

export default async function AdminRequestDetailPage({ params }: Props) {
  const { id } = await params;
  const req = await getAdminRequestById(id);
  if (!req) {
    notFound();
  }
  const responses = await getResponsesForRequest(id);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs(`/admin/requests/${id}`)}
        title={req.title}
        subtitle={`Бюджет ${req.budgetLabel} · ${req.worldLabel}`}
      />
      <AdminPageSection title="Покупатель">
        <AdminInternalLink href={`/admin/users/${encodeURIComponent(req.buyerUserId)}`} className="text-sm font-semibold text-slate-900 hover:underline">
          {req.buyerLabel}
        </AdminInternalLink>
      </AdminPageSection>
      <AdminPageSection title="Отклики продавцов (mock)">
        <ul className="space-y-2 text-sm">
          {responses.map((resp) => (
            <li key={resp.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              <span className="font-medium">{resp.sellerName}</span> · {resp.message.slice(0, 120)}…
            </li>
          ))}
        </ul>
      </AdminPageSection>
      <AdminPageSection title="Операции">
        <AdminRequestActions requestId={id} />
        <p className="mt-2 text-xs text-slate-500">Кнопки только mock-лог в консоль.</p>
      </AdminPageSection>
      <AdminPageSection title="Связи">
        <AdminInternalLink href="/admin/moderation/reports" className="text-sm font-semibold text-slate-900 hover:underline">
          Жалобы / модерация
        </AdminInternalLink>
      </AdminPageSection>
    </div>
  );
}
