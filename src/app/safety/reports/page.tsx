"use client";

import Link from "next/link";

import { DemoRoleGuard } from "@/components/demo-role/demo-role";
import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SafetyCaseCard } from "@/components/safety/SafetyCaseCard";
import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui";
import { useDemoRole } from "@/components/demo-role/demo-role";
import { getDemoSupportUserId } from "@/lib/support/demo-user";
import { getUserSafetyReports } from "@/services/safety";

function ReportsList() {
  const { role, currentSellerId } = useDemoRole();
  const userId = getDemoSupportUserId(role, currentSellerId);
  const reports = userId ? getUserSafetyReports(userId) : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Link href="/safety/reports/new" className={cn(buttonVariants(), "inline-flex h-10 items-center px-4")}>
          Новая жалоба
        </Link>
        <Link href="/safety" className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 items-center px-4")}>
          Центр безопасности
        </Link>
        <Link href="/support" className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 items-center px-4")}>
          Поддержка
        </Link>
      </div>
      {reports.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-600">
          Пока нет жалоб. Если столкнулись с нарушением —{" "}
          <Link href="/safety/reports/new" className="font-semibold text-blue-700">
            создайте обращение
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => (
            <li key={r.id}>
              <SafetyCaseCard report={r} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SafetyReportsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <Navbar />
      <main className="flex-1 py-8 sm:py-10">
        <Container className="space-y-6">
          <SectionHeader
            as="h1"
            title="Мои жалобы"
            description="Статусы рассмотрения: получена → на проверке → меры / решение. Данные демо хранятся в памяти до перезагрузки."
          />
          <DemoRoleGuard
            allowedRoles={["buyer", "seller", "all"]}
            title="Жалобы доступны после выбора роли"
            description="Переключитесь с гостя на покупателя или продавца, чтобы видеть свои обращения."
            ctaRoles={["buyer", "seller"]}
          >
            <ReportsList />
          </DemoRoleGuard>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
