"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { InlineNotice } from "@/components/platform";
import { cn } from "@/components/ui/cn";
import { buttonVariants } from "@/lib/button-styles";
import { useDemoRole } from "@/components/demo-role/demo-role";

import { getUserEnforcementActions, getUserAppeals } from "@/services/enforcement";
import { EnforcementActionCard } from "@/components/enforcement/EnforcementActionCard";

function resolveUserId(role: string, currentSellerId: string | null) {
  return role === "buyer" ? "buyer-dmitriy" : currentSellerId ?? "marina-tech";
}

export function EnforcementHubClient() {
  const { role, currentSellerId, isHydrated } = useDemoRole();
  const userId = useMemo(() => resolveUserId(role, currentSellerId), [role, currentSellerId]);

  const actions = isHydrated ? getUserEnforcementActions(userId) : [];
  const appeals = isHydrated ? getUserAppeals(userId) : [];

  const activeActions = actions.filter((a) => a.status === "active");
  const appealsCount = appeals.length;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <Navbar />
      <main className="flex-1 py-8 sm:py-10">
        <Container className="space-y-8">
          <SectionHeader
            as="h1"
            title="Решения платформы и пересмотр"
            description="Здесь видно решения платформы по объявлениям, магазину или профилю, а также доступные шаги для обращения на пересмотр."
          />

          <InlineNotice
            type="info"
            title="Как понять причину"
            description="В карточке решения указана причина и краткое пояснение. Если есть неточность, подайте обращение на пересмотр."
            action={{ label: "Открыть список действий", href: "/enforcement/actions" }}
          />
          {activeActions.length === 0 && appealsCount === 0 ? (
            <InlineNotice
              type="success"
              title="Сейчас по вашему профилю нет ограничений и открытых обращений."
              description="Если ситуация изменится, информация появится в этом разделе."
            />
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-slate-900">Мои ограничения / активные действия</h2>
                    <p className="text-sm text-slate-600">Активных действий: {activeActions.length}</p>
                  </div>
                  <Link href="/enforcement/actions" className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 items-center justify-center px-4")}>
                    Все действия
                  </Link>
                </div>

                <div className="mt-4 space-y-3">
                  {activeActions.length ? (
                    activeActions.slice(0, 3).map((a) => <EnforcementActionCard key={a.id} action={a} />)
                  ) : (
                    <p className="text-sm text-slate-600">Пока нет активных действий.</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-slate-900">Мои обращения на пересмотр</h2>
                    <p className="text-sm text-slate-600">Всего обращений: {appealsCount}</p>
                  </div>
                  <Link href="/enforcement/appeals" className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 items-center justify-center px-4")}>
                    Все обращения
                  </Link>
                </div>

                <div className="mt-4 space-y-3">
                  {appeals.length ? (
                    appeals.slice(0, 3).map((ap) => (
                      <div key={ap.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900">
                              Обращение: <span className="font-mono text-[11px] text-slate-700">{ap.id}</span>
                            </p>
                            <p className="mt-1 text-xs text-slate-600">
                              Обновлено: {new Date(ap.updatedAt).toLocaleDateString("ru-RU")}
                            </p>
                          </div>
                          <Link
                            href={`/enforcement/appeals/${ap.id}`}
                            className={cn(buttonVariants({ variant: "primary", size: "md" }), "rounded-xl h-10 px-4")}
                          >
                            Детали
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-600">Обращений пока нет.</p>
                  )}
                </div>
              </div>
            </section>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="text-lg font-semibold text-slate-900">Справка по политике</h2>
                <p className="mt-1 text-sm text-slate-600">Нейтральные подсказки: что происходит и куда обращаться.</p>
                <div className="mt-4 space-y-2">
                  <Link
                    href="/safety"
                    className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 w-full items-center justify-center")}
                  >
                    Центр безопасности
                  </Link>
                  <Link
                    href="/support"
                    className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 w-full items-center justify-center")}
                  >
                    Центр помощи
                  </Link>
                  <Link
                    href="/verification/status"
                    className={cn(buttonVariants(), "inline-flex h-10 w-full items-center justify-center")}
                  >
                    Проверка профиля
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}

