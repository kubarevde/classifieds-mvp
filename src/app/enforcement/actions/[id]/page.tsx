"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { InlineNotice } from "@/components/platform";
import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";

import {
  getAppealAvailabilityReason,
  getAppealableActions,
  getEnforcementActionById,
  getUserAppeals,
} from "@/services/enforcement";
import type { EnforcementAction } from "@/services/enforcement/types";
import { EnforcementStatusBadge } from "@/components/enforcement/EnforcementStatusBadge";
import { PolicyNotice } from "@/components/enforcement/PolicyNotice";

import { AppealTimeline } from "@/components/enforcement/AppealTimeline";
import type { AppealStatus } from "@/services/enforcement/types";

import { useDemoRole } from "@/components/demo-role/demo-role";

export default function EnforcementActionDetailsPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const { role, currentSellerId, isHydrated } = useDemoRole();
  const userId = role === "buyer" ? "buyer-dmitriy" : currentSellerId ?? "marina-tech";

  const action = useMemo<EnforcementAction | null>(() => {
    if (!isHydrated || !id) return null;
    return getEnforcementActionById(id);
  }, [id, isHydrated]);

  const appealCases = useMemo(() => (isHydrated ? getUserAppeals(userId) : []), [userId, isHydrated]);
  const currentAppeal = useMemo(
    () => (action ? appealCases.find((ap) => ap.enforcementActionId === action.id) ?? null : null),
    [appealCases, action],
  );

  const appealAllowed = useMemo(() => {
    if (!action) return false;
    return getAppealableActions({ userId, enforcementActionId: action.id }).length > 0;
  }, [action, userId]);
  const appealAvailabilityText = action
    ? getAppealAvailabilityReason(action, currentAppeal)
    : "Для этого решения обращение на пересмотр уже недоступно.";
  const verificationHref =
    action?.actionType === "verification_required"
      ? action.targetType === "store"
        ? "/verification/business"
        : "/verification/identity"
      : null;

  function appealStatusLabelRu(status: AppealStatus): string {
    switch (status) {
      case "submitted":
        return "Отправлено";
      case "in_review":
        return "На рассмотрении";
      case "upheld":
        return "Решение в силе";
      case "rejected":
        return "Пересмотрено";
      case "resolved":
        return "Закрыто";
      default:
        return status;
    }
  }

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50/60">
        <Navbar />
        <main className="flex-1 py-8 sm:py-10">
          <Container>
            <p className="text-sm text-slate-500">Загрузка…</p>
          </Container>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!action) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50/60">
        <Navbar />
        <main className="flex-1 py-8 sm:py-10">
          <Container className="max-w-2xl">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <p className="text-sm text-slate-700">Действие не найдено.</p>
              <Link href="/enforcement" className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 items-center justify-center px-4")}>
                К центру решений
              </Link>
            </div>
          </Container>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <Navbar />
      <main className="flex-1 py-8 sm:py-10">
        <Container className="space-y-8">
          <SectionHeader
            as="h1"
            title="Детали действия"
            description="Причина и прозрачный timeline решения (mock)."
            actions={
              <div className="flex flex-wrap gap-2">
                <Link href="/enforcement/actions" className={cn(buttonVariants({ variant: "outline", size: "md" }), "rounded-xl")}>
                  ← К списку
                </Link>
              </div>
            }
          />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <h2 className="text-lg font-semibold text-slate-900">{action.targetLabel}</h2>
                    <p className="text-sm text-slate-600">
                      Объект: {action.targetType} · ID: <span className="font-mono text-xs">{action.targetId}</span>
                    </p>
                  </div>
                  <EnforcementStatusBadge actionType={action.actionType} status={action.status} />
                </div>

                <div className="mt-4">
                  <PolicyNotice
                    reasonTitle={action.reasonTitle}
                    policySummary={action.policySummary}
                    whatItMeans="Это значит, что решение применяется к указанному объекту в демо-режиме. В будущем эти данные будут приходить из backend moderation."
                    nextSteps={[
                      { title: "Проверьте причину решения", description: "Сверьте пояснение и статус решения перед следующими шагами.", href: "#policy" },
                      { title: "Подайте обращение на пересмотр", description: "Если решение ещё активно, отправьте обращение из формы пересмотра.", href: appealAllowed ? `/enforcement/appeals/new?enforcementActionId=${action.id}` : undefined },
                      verificationHref
                        ? {
                            title: "Пройдите подтверждение профиля",
                            description: "Пройдите подтверждение профиля и вернитесь к публикации.",
                            href: verificationHref,
                          }
                        : { title: "Проверьте правила безопасности", description: "Посмотрите рекомендации перед следующей публикацией.", href: "/safety" },
                    ]}
                  />
                </div>
                {action.actionType === "verification_required" && verificationHref ? (
                  <div className="mt-4">
                    <InlineNotice
                      type="info"
                      title="Для снятия ограничения требуется подтверждение профиля."
                      description="Пройдите подтверждение профиля и вернитесь к публикации."
                      action={{ label: "Открыть подтверждение", href: verificationHref }}
                    />
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <h3 className="text-base font-semibold text-slate-900">Timeline</h3>
                <p className="mt-1 text-xs text-slate-500">Прозрачность для пользователя: когда принято решение (mock).</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Принято</p>
                    <p className="mt-1">{new Date(action.createdAt).toLocaleString("ru-RU")}</p>
                  </li>
                  {action.expiresAt ? (
                    <li className="rounded-lg bg-slate-50 px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ограничение действует до</p>
                      <p className="mt-1">{new Date(action.expiresAt).toLocaleString("ru-RU")}</p>
                    </li>
                  ) : null}
                </ul>
              </div>
            </section>

            <aside className="space-y-4">
              {currentAppeal ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                  <h3 className="text-base font-semibold text-slate-900">Ваше обращение на пересмотр</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Статус: <span className="font-semibold text-slate-900">{appealStatusLabelRu(currentAppeal.status)}</span>
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{currentAppeal.message}</p>
                  <div className="mt-4">
                    <AppealTimeline appeal={currentAppeal} />
                  </div>
                  {currentAppeal.resolutionNote ? (
                    <InlineNotice type="success" title="Решение по пересмотру" description={currentAppeal.resolutionNote} />
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                  <h3 className="text-base font-semibold text-slate-900">Обжалование</h3>
                  <p className="mt-1 text-sm text-slate-600">{appealAvailabilityText}</p>
                  {appealAllowed && action.expiresAt ? (
                    <p className="mt-1 text-xs text-slate-500">
                      Подать обращение можно, пока ограничение действует до{" "}
                      {new Date(action.expiresAt).toLocaleDateString("ru-RU")}.
                    </p>
                  ) : null}
                  {appealAllowed ? (
                    <Link
                      href={`/enforcement/appeals/new?enforcementActionId=${action.id}`}
                      className={cn(buttonVariants({ variant: "primary", size: "md" }), "mt-3 inline-flex h-10 items-center justify-center rounded-xl w-full")}
                    >
                      Подать обращение на пересмотр
                    </Link>
                  ) : null}
                  {!appealAllowed && verificationHref ? (
                    <Link
                      href={verificationHref}
                      className={cn(buttonVariants({ variant: "outline", size: "md" }), "mt-3 inline-flex h-10 items-center justify-center rounded-xl w-full")}
                    >
                      Пройти подтверждение профиля
                    </Link>
                  ) : null}
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <h3 className="text-base font-semibold text-slate-900">Нужна поддержка</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Это отдельный поток от обычных тикетов. Для технических вопросов используйте support.
                </p>
                <Link href="/support/tickets/new" className={cn(buttonVariants({ variant: "outline", size: "md" }), "mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl")}>
                  Открыть тикет поддержки
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}

