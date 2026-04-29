"use client";

import Link from "next/link";

import { useDemoRole } from "@/components/demo-role/demo-role";
import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { VerificationTierCard } from "@/components/verification/VerificationTierCard";
import { getVerificationProfile } from "@/services/verification";
import { VerificationBadge } from "@/components/verification/VerificationBadge";

const buyerUserIdFallback = "buyer-dmitriy";

export function VerificationHubClient() {
  const { role, currentSellerId, isHydrated } = useDemoRole();
  const isStoreOwner = role === "seller" || role === "all";

  // В демо:
  // - buyer persona — это частный продавец (identity в subjectType="seller")
  // - seller/all — магазин (business в subjectType="store", identity в subjectType="seller")
  const userId = currentSellerId ?? (isStoreOwner ? "marina-tech" : buyerUserIdFallback);

  const storeProfile = isHydrated ? getVerificationProfile(userId, "store") : null;
  const identityProfile = isHydrated ? getVerificationProfile(userId, "seller") : null;

  const primaryIsBusiness = isStoreOwner;

  const primaryCard = primaryIsBusiness
    ? {
        title: "Подтверждение магазина",
        subtitle: "Документы магазина и контактные данные.",
        level: storeProfile?.level ?? "business",
        status: storeProfile?.status ?? "not_started",
        href: "/verification/business",
      }
    : {
        title: "Подтверждение личности",
        subtitle: "Телефон, email, документ и проверка личности.",
        level: identityProfile?.level ?? "identity",
        status: identityProfile?.status ?? "not_started",
        href: "/verification/identity",
      };

  const secondaryCard = primaryIsBusiness
    ? {
        title: "Подтверждение личности",
        subtitle: "Подтверждение личности продавца.",
        level: identityProfile?.level ?? "identity",
        status: identityProfile?.status ?? "not_started",
        href: "/verification/identity",
      }
    : {
        title: "Подтверждение магазина",
        subtitle: "Подтверждение магазина повышает доверие покупателей.",
        level: storeProfile?.level ?? "business",
        status: storeProfile?.status ?? "not_started",
        href: "/verification/business",
      };

  const storeBadge = storeProfile ? (
    <VerificationBadge status={storeProfile.status} level={storeProfile.level} size="sm" variant="compact" />
  ) : null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <Navbar />
      <main className="flex-1 py-8 sm:py-10">
        <Container className="space-y-8">
          <SectionHeader
            as="h1"
            title="Подтверждение профиля"
            description="Подтверждённый магазин вызывает больше доверия у покупателей, а проверенная личность помогает быстрее получить ответ."
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/verification/status"
                  className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Посмотреть статус
                </Link>
                {storeBadge}
              </div>
            }
          />

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Рекомендуем для вас</h2>
              <p className="text-sm text-slate-600">Выбираем приоритет по вашей роли (mock).</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="ring-1 ring-slate-900/10">
                <VerificationTierCard {...primaryCard} />
              </div>
              <VerificationTierCard {...secondaryCard} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-base font-semibold text-slate-900">Статус проверки</h2>
            <p className="mt-2 text-sm text-slate-600">
              Текущий статус и прогресс по требованиям — чтобы вы могли быстрее вернуться в нужный шаг.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Link
                href="/verification/status"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Открыть статус
              </Link>
              <Link href={primaryCard.href} className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                К шагам
              </Link>
            </div>
          </section>

          <p className="text-xs text-slate-500">
            В демо-версии шаги подтверждения работают в учебном режиме без реальной внешней проверки.
          </p>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}

