import { notFound } from "next/navigation";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminNotesPanel } from "@/components/admin/AdminNotesPanel";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { getAdminCaseById } from "@/services/admin";

type Props = { params: Promise<{ id: string }> };

export default async function AdminCaseDetailPage({ params }: Props) {
  const { id: raw } = await params;
  const id = decodeURIComponent(raw);
  const c = getAdminCaseById(id);
  if (!c) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs(`/admin/cases/${encodeURIComponent(id)}`)}
        title={c.headline}
        subtitle={c.summary}
        actions={
          <AdminInternalLink href={c.subjectUserHref} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
            Субъект: {c.subjectLabel}
          </AdminInternalLink>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {c.blocks.map((b) => (
          <AdminPageSection key={b.title} title={b.title}>
            <p className="text-sm text-slate-700">{b.body}</p>
            {b.href ? (
              <AdminInternalLink href={b.href} className="mt-2 inline-block text-sm font-semibold text-sky-800 hover:underline">
                Перейти
              </AdminInternalLink>
            ) : null}
          </AdminPageSection>
        ))}
      </div>

      <AdminPageSection title="Таймлайн (mock)">
        <ul className="space-y-2 text-sm text-slate-700">
          {c.timeline.map((ev, i) => (
            <li key={i} className="flex gap-2 border-l-2 border-slate-200 pl-3">
              <span className="shrink-0 text-xs text-slate-500">{new Date(ev.at).toLocaleString("ru-RU")}</span>
              <span>{ev.label}</span>
            </li>
          ))}
        </ul>
      </AdminPageSection>

      <AdminNotesPanel entityType="case" entityId={id} title="Заметки по кейсу" />
    </div>
  );
}
