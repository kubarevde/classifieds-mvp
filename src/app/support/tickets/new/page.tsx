"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { DemoRoleGuard } from "@/components/demo-role/demo-role";
import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { NewTicketForm } from "@/components/support/NewTicketForm";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui";
import { useDemoRole } from "@/components/demo-role/demo-role";
import { getDemoSupportUserId } from "@/lib/support/demo-user";

function NewTicketFormGate() {
  const searchParams = useSearchParams();
  const { role, currentSellerId, isHydrated } = useDemoRole();
  const userId = getDemoSupportUserId(role, currentSellerId);

  if (!isHydrated) {
    return <p className="text-sm text-slate-500">Загрузка…</p>;
  }

  return <NewTicketForm key={searchParams.toString()} userId={userId} />;
}

export default function SupportNewTicketPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <Navbar />
      <main className="flex-1 py-8 sm:py-10">
        <Container className="max-w-2xl space-y-6">
          <SectionHeader as="h1" title="Новое обращение" description="Опишите проблему — ответ придёт в тикете (демо)." />
          <DemoRoleGuard
            allowedRoles={["buyer", "seller", "all"]}
            title="Создание обращения"
            description="Переключитесь с гостя на другую роль, чтобы создать тикет."
            ctaRoles={["buyer", "seller"]}
          >
            <Suspense fallback={<p className="text-sm text-slate-500">Загрузка формы…</p>}>
              <NewTicketFormGate />
            </Suspense>
          </DemoRoleGuard>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
