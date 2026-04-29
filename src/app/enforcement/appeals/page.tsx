"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { buttonVariants, cn } from "@/components/ui";
import { useDemoRole } from "@/components/demo-role/demo-role";
import { getUserAppeals } from "@/services/enforcement";
import { AppealTimeline } from "@/components/enforcement/AppealTimeline";

export default function EnforcementAppealsPage() {
  const { role, currentSellerId, isHydrated } = useDemoRole();
  const userId = role === "buyer" ? "buyer-dmitriy" : currentSellerId ?? "marina-tech";

  const appeals = useMemo(() => (isHydrated ? getUserAppeals(userId) : []), [isHydrated, userId]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <Navbar />
      <main className="flex-1 py-8 sm:py-10">
        <Container className="space-y-8">
          <SectionHeader
            as="h1"
            title="Обращения на пересмотр"
            description="История ваших обращений и их статусы (mock)."
            actions={
              <Link href="/enforcement" className={cn(buttonVariants({ variant: "outline", size: "md" }), "rounded-xl")}>
                К центру решений
              </Link>
            }
          />

          {appeals.length ? (
            <div className="space-y-4">
              {appeals.map((ap) => (
                <article key={ap.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-slate-900">
                        Обращение <span className="font-mono text-[11px] text-slate-700">{ap.id}</span>
                      </p>
                      <p className="text-sm text-slate-600">Связано с решением: {ap.enforcementActionId}</p>
                      <p className="text-xs text-slate-500">Обновлено: {new Date(ap.updatedAt).toLocaleString("ru-RU")}</p>
                    </div>
                    <Link
                      href={`/enforcement/appeals/${ap.id}`}
                      className={cn(buttonVariants({ variant: "primary", size: "md" }), "inline-flex h-10 items-center justify-center rounded-xl px-4")}
                    >
                      Детали
                    </Link>
                  </div>

                  <div className="mt-4">
                    <AppealTimeline appeal={ap} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <p className="text-sm font-semibold text-slate-900">Обращений пока нет</p>
              <p className="mt-1 text-sm text-slate-600">Если вы подадите обращение на пересмотр, оно появится здесь.</p>
              <Link
                href="/enforcement/actions"
                className={cn(buttonVariants({ variant: "outline", size: "md" }), "mt-3 inline-flex h-10 items-center justify-center rounded-xl px-4")}
              >
                Посмотреть решения
              </Link>
            </div>
          )}
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}

