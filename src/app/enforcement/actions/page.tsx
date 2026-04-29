"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/components/ui/cn";
import { buttonVariants } from "@/lib/button-styles";
import { useDemoRole } from "@/components/demo-role/demo-role";
import { EnforcementActionCard } from "@/components/enforcement/EnforcementActionCard";
import { getUserEnforcementActions } from "@/services/enforcement";

function resolveUserId(role: "guest" | "buyer" | "seller" | "all", currentSellerId: string | null) {
  return role === "buyer" ? "buyer-dmitriy" : currentSellerId ?? "marina-tech";
}

export default function EnforcementActionsPage() {
  const { role, currentSellerId, isHydrated } = useDemoRole();
  const userId = useMemo(() => resolveUserId(role, currentSellerId), [role, currentSellerId]);

  const actions = isHydrated ? getUserEnforcementActions(userId) : [];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <Navbar />
      <main className="flex-1 py-8 sm:py-10">
        <Container className="space-y-8">
          <SectionHeader
            as="h1"
            title="Действия и решения"
            description="Здесь отображаются ваши активные решения и ограничения, а также доступность пересмотра."
            actions={
              <Link
                href="/enforcement"
                className={cn(buttonVariants({ variant: "outline", size: "md" }), "rounded-xl")}
              >
                Назад
              </Link>
            }
          />

          {actions.length ? (
            <div className="grid gap-4">
              {actions.map((a) => (
                <EnforcementActionCard key={a.id} action={a} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <p className="text-base font-semibold text-slate-900">Активных ограничений нет</p>
              <p className="mt-1 text-sm text-slate-600">
                Если платформа применит решение к вашему контенту или профилю, информация появится здесь.
              </p>
              <Link
                href="/safety"
                className={cn(buttonVariants({ variant: "outline", size: "md" }), "mt-3 inline-flex h-10 items-center justify-center rounded-xl px-4")}
              >
                О правилах и безопасности
              </Link>
            </div>
          )}
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}

