"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useDemoRole } from "@/components/demo-role/demo-role";
import { TicketCard } from "@/components/support/TicketCard";
import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";
import { getDemoSupportUserId } from "@/lib/support/demo-user";
import { getTicketsForUser } from "@/services/support";

export function SupportTicketsPanel() {
  const { role, currentSellerId } = useDemoRole();
  const userId = getDemoSupportUserId(role, currentSellerId);
  const tickets = useMemo(() => (userId ? getTicketsForUser(userId) : []), [userId]);
  const recent = useMemo(() => tickets.slice(0, 3), [tickets]);
  const openCount = useMemo(() => tickets.filter((t) => t.status === "open" || t.status === "in_progress").length, [tickets]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Поддержка</h2>
        <Link href="/support/tickets/new" className={cn(buttonVariants(), "inline-flex h-10 items-center px-4")}>
          Новое обращение
        </Link>
      </div>
      <p className="text-sm text-slate-600">
        Активных обращений: {openCount}. Все тикеты — в{" "}
        <Link href="/support/tickets" className="font-semibold text-blue-700 hover:text-blue-800">
          разделе «Мои обращения»
        </Link>
        .
      </p>
      {recent.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
          Пока нет обращений.{" "}
          <Link href="/support/tickets/new" className="font-semibold text-blue-700">
            Создать первое
          </Link>
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Последние обращения</p>
          <ul className="space-y-3">
            {recent.map((ticket) => (
              <li key={ticket.id}>
                <TicketCard ticket={ticket} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Link href="/support" className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 items-center px-4")}>
          Открыть центр помощи
        </Link>
        <Link href="/support/tickets" className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 items-center px-4")}>
          Все обращения
        </Link>
      </div>
    </div>
  );
}
