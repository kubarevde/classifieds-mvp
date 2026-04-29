"use client";

import Link from "next/link";

import { DemoRoleGuard } from "@/components/demo-role/demo-role";
import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { TicketCard } from "@/components/support/TicketCard";
import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui";
import { useDemoRole } from "@/components/demo-role/demo-role";
import { getDemoSupportUserId } from "@/lib/support/demo-user";
import { getTicketsForUser } from "@/services/support";

function TicketsList() {
  const { role, currentSellerId } = useDemoRole();
  const userId = getDemoSupportUserId(role, currentSellerId);
  const tickets = userId ? getTicketsForUser(userId) : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Link href="/support/tickets/new" className={cn(buttonVariants(), "inline-flex h-10 items-center px-4")}>
          Новое обращение
        </Link>
        <Link
          href="/support"
          className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 items-center px-4")}
        >
          Назад в центр помощи
        </Link>
      </div>
      {tickets.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-600">
          Пока нет обращений.
        </p>
      ) : (
        <ul className="space-y-3">
          {tickets.map((t) => (
            <li key={t.id}>
              <TicketCard ticket={t} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SupportTicketsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <Navbar />
      <main className="flex-1 py-8 sm:py-10">
        <Container className="space-y-6">
          <SectionHeader
            as="h1"
            title="Мои обращения"
            description="История тикетов в демо хранится в памяти приложения до перезагрузки."
          />
          <DemoRoleGuard
            allowedRoles={["buyer", "seller", "all"]}
            title="Войдите, чтобы видеть обращения"
            description="Для гостя тикеты недоступны. Переключите демо-роль на покупателя или продавца."
            ctaRoles={["buyer", "seller"]}
          >
            <TicketsList />
          </DemoRoleGuard>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
