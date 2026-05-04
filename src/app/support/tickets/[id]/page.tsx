"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { DemoRoleGuard } from "@/components/demo-role/demo-role";
import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { TicketThread } from "@/components/support/TicketThread";
import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";
import { Container } from "@/components/ui/container";
import { useDemoRole } from "@/components/demo-role/demo-role";
import { getDemoSupportUserId } from "@/lib/support/demo-user";
import { getTicketForUser, type SupportTicket } from "@/services/support";

function TicketDetailBody() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params?.id[0] : "";
  const { role, currentSellerId, isHydrated } = useDemoRole();
  const userId = getDemoSupportUserId(role, currentSellerId);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);

  useEffect(() => {
    if (!isHydrated || !userId || !id) {
      return;
    }
    void Promise.resolve().then(() => {
      setTicket(getTicketForUser(userId, id));
    });
  }, [isHydrated, userId, id]);

  if (!isHydrated) {
    return <p className="text-sm text-slate-500">Загрузка…</p>;
  }
  if (!id || !userId) {
    return <p className="text-sm text-slate-600">Некорректная ссылка.</p>;
  }
  if (!ticket) {
    return (
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm text-slate-700">Обращение не найдено или принадлежит другому пользователю.</p>
        <Link href="/support/tickets" className={cn(buttonVariants(), "inline-flex h-10 items-center px-4")}>
          К списку
        </Link>
      </div>
    );
  }

  const statusLabel: Record<string, string> = {
    open: "Открыт",
    in_progress: "В работе",
    resolved: "Решён",
    closed: "Закрыт",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Link href="/support/tickets" className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 items-center px-4")}>
          ← Все обращения
        </Link>
      </div>
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{statusLabel[ticket.status]}</p>
        <h1 className="text-2xl font-semibold text-slate-900">{ticket.subject}</h1>
        <p className="text-sm text-slate-600">Категория: {ticket.category}</p>
        {ticket.threadId ? (
          <p className="text-sm">
            <Link href={`/messages/${encodeURIComponent(ticket.threadId)}`} className="font-semibold text-sky-800 hover:underline">
              Открыть связанный диалог в сообщениях
            </Link>
          </p>
        ) : null}
      </header>
      <TicketThread ticket={ticket} onUpdated={setTicket} />
    </div>
  );
}

export default function SupportTicketDetailPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <Navbar />
      <main className="flex-1 py-8 sm:py-10">
        <Container className="max-w-3xl">
          <DemoRoleGuard
            allowedRoles={["buyer", "seller", "all"]}
            title="Тикет доступен после входа"
            description="Переключите роль с гостя, чтобы открыть обращение."
            ctaRoles={["buyer", "seller"]}
          >
            <TicketDetailBody />
          </DemoRoleGuard>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
