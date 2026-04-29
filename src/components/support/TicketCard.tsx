import Link from "next/link";

import type { SupportCategory, SupportTicket } from "@/services/support";
import { Badge, Card } from "@/components/ui";

const categoryLabel: Record<SupportCategory, string> = {
  account: "Аккаунт",
  listing: "Объявление",
  payment: "Оплата",
  safety: "Безопасность",
  store: "Магазин",
  other: "Другое",
};

const statusLabel: Record<SupportTicket["status"], string> = {
  open: "Открыт",
  in_progress: "В работе",
  resolved: "Решён",
  closed: "Закрыт",
};

const statusClass: Record<SupportTicket["status"], string> = {
  open: "bg-amber-50 text-amber-900 border-amber-200",
  in_progress: "bg-sky-50 text-sky-900 border-sky-200",
  resolved: "bg-emerald-50 text-emerald-900 border-emerald-200",
  closed: "bg-slate-100 text-slate-700 border-slate-200",
};

type TicketCardProps = {
  ticket: SupportTicket;
};

export function TicketCard({ ticket }: TicketCardProps) {
  const updated = new Date(ticket.updatedAt).toLocaleString("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  });
  return (
    <Link href={`/support/tickets/${ticket.id}`}>
      <Card className="p-4 transition hover:border-slate-300 hover:shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs text-slate-500">Обновлено {updated}</p>
              <Badge variant="secondary" size="sm" className="font-normal">
                {categoryLabel[ticket.category]}
              </Badge>
            </div>
            <h3 className="font-semibold text-slate-900">{ticket.subject}</h3>
            <p className="line-clamp-2 text-sm text-slate-600">{ticket.message}</p>
          </div>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass[ticket.status]}`}
          >
            {statusLabel[ticket.status]}
          </span>
        </div>
      </Card>
    </Link>
  );
}
