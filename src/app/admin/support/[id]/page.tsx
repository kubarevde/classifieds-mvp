"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminNotesPanel } from "@/components/admin/AdminNotesPanel";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { supportActorToAdminUserHref } from "@/lib/admin-support-cross-links";
import { addSupportTicketMessage, adminAssignTicket, adminSetTicketStatus, getTicketById } from "@/services/support";
import type { TicketMessage, TicketMessageAuthorRole } from "@/services/support";

function authorRoleLabel(role: TicketMessageAuthorRole): string {
  if (role === "support") return "Поддержка";
  return "Пользователь";
}

export default function AdminSupportTicketPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(null), 4000);
    return () => window.clearTimeout(t);
  }, [banner]);

  const ticket = useMemo(() => getTicketById(id), [id, refresh]); // eslint-disable-line react-hooks/exhaustive-deps

  const notify = (message: string) => {
    setBanner(message);
    setRefresh((x) => x + 1);
    router.refresh();
  };

  if (!ticket) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-900">Тикет не найден</p>
        <p className="mt-1 text-sm text-slate-600">Проверьте идентификатор или откройте список тикетов.</p>
        <AdminInternalLink
          href="/admin/support"
          className="mt-4 inline-flex h-10 items-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
        >
          К поддержке
        </AdminInternalLink>
      </div>
    );
  }

  const timeline: TicketMessage[] = ticket.messages;
  const userHref = supportActorToAdminUserHref(ticket.userId);
  const isLikelyStoreActor = ticket.userId !== "buyer-dmitriy";

  return (
    <div className="space-y-6">
      {banner ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          {banner}
        </p>
      ) : null}

      <AdminPageHeader
        breadcrumbs={buildAdminBreadcrumbs(`/admin/support/${id}`)}
        title={ticket.subject}
        subtitle={`Категория: ${ticket.category} · ${ticket.id}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
              onClick={() => {
                adminAssignTicket(id, "Мария · L2");
                notify("Тикет назначен Марии (mock).");
              }}
            >
              Назначить Марии
            </button>
            <button
              type="button"
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
              onClick={() => {
                adminSetTicketStatus(id, "in_progress");
                notify("Статус: в работе.");
              }}
            >
              В работу
            </button>
            <button
              type="button"
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900"
              onClick={() => {
                adminSetTicketStatus(id, "resolved");
                notify("Статус: решён.");
              }}
            >
              Решён
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800"
              onClick={() => {
                adminSetTicketStatus(id, "closed");
                notify("Тикет закрыт.");
              }}
            >
              Закрыть
            </button>
          </div>
        }
      />

      <AdminPageSection title="Связанные сущности">
        <ul className="space-y-2 text-sm text-slate-700">
          <li>
            Пользователь:{" "}
            <AdminInternalLink href={userHref} className="font-semibold text-sky-800 hover:underline">
              {ticket.userId}
            </AdminInternalLink>
          </li>
          {isLikelyStoreActor ? (
            <li>
              Магазин:{" "}
              <AdminInternalLink
                href={`/admin/stores/${encodeURIComponent(ticket.userId)}`}
                className="font-semibold text-sky-800 hover:underline"
              >
                Карточка магазина
              </AdminInternalLink>
            </li>
          ) : null}
          <li>
            <AdminInternalLink href="/admin/moderation/reports" className="font-semibold text-sky-800 hover:underline">
              Жалобы (связь по контексту)
            </AdminInternalLink>
          </li>
          {ticket.threadId ? (
            <li>
              Чат:{" "}
              <a href={`/messages/${encodeURIComponent(ticket.threadId)}`} className="font-semibold text-sky-800 hover:underline" target="_blank" rel="noreferrer">
                Открыть переписку (read-only)
              </a>
            </li>
          ) : null}
          {id === "ticket-2" ? (
            <li>
              <AdminInternalLink href="/admin/cases/case-marina-billing" className="font-semibold text-amber-900 hover:underline">
                Сквозной кейс (mock)
              </AdminInternalLink>
            </li>
          ) : null}
        </ul>
      </AdminPageSection>

      <AdminPageSection title="Переписка">
        <ul className="space-y-3 text-sm">
          {timeline.map((m) => (
            <li
              key={m.id}
              className={`rounded-lg border px-3 py-2 ${m.authorRole === "support" ? "border-sky-100 bg-sky-50" : "border-slate-100 bg-slate-50"}`}
            >
              <p className="text-xs text-slate-500">
                {authorRoleLabel(m.authorRole)} · {new Date(m.createdAt).toLocaleString("ru-RU")}
              </p>
              <p className="text-slate-900">{m.text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="min-h-[72px] flex-1 rounded-lg border border-slate-200 p-2 text-sm"
            placeholder="Ответ от поддержки (mock)…"
          />
          <button
            type="button"
            className="self-end rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => {
              const text = reply.trim();
              if (!text) {
                return;
              }
              addSupportTicketMessage(ticket.userId, id, text, "support");
              setReply("");
              notify("Ответ добавлен в тред.");
            }}
          >
            Отправить
          </button>
        </div>
      </AdminPageSection>

      <AdminNotesPanel entityType="support" entityId={id} />
    </div>
  );
}
