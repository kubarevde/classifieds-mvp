"use client";

import Link from "next/link";
import { useMemo } from "react";

import { InlineNotice } from "@/components/platform";
import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Container } from "@/components/ui/container";
import { useDemoRole } from "@/components/demo-role/demo-role";
import type { VerificationProfile } from "@/services/verification/types";
import { getVerificationProfile } from "@/services/verification";
import { VerificationStatusCard } from "@/components/verification/VerificationStatusCard";
import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";

const fallbackSellerId = "marina-tech";

export default function VerificationStatusPage() {
  const { role, currentSellerId, isHydrated } = useDemoRole();

  const sellerUserId = currentSellerId ?? fallbackSellerId;

  const identitySubject = "seller" as const;
  const identityUserId = sellerUserId;

  const businessEnabled = role === "seller" || role === "all";
  const businessUserId = sellerUserId;

  const identityProfile: VerificationProfile | null = useMemo(() => {
    if (!isHydrated) return null;
    return getVerificationProfile(identityUserId, identitySubject);
  }, [identitySubject, identityUserId, isHydrated]);

  const businessProfile: VerificationProfile | null = useMemo(() => {
    if (!isHydrated || !businessEnabled) return null;
    return getVerificationProfile(businessUserId, "store");
  }, [businessEnabled, businessUserId, isHydrated]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <Navbar />
      <main className="flex-1 py-8 sm:py-10">
        <Container className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Статус подтверждения профиля</h1>
              <p className="text-sm text-slate-600">Текущий статус подтверждения профиля, прогресс по шагам и следующий рекомендованный шаг.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/verification" className={cn(buttonVariants({ variant: "outline", size: "md" }), "rounded-xl")}>
                К подтверждению профиля
              </Link>
              <Link href="/verification/identity" className={cn(buttonVariants({ variant: "secondary", size: "md" }), "rounded-xl")}>
                Личность
              </Link>
              <Link href="/verification/business" className={cn(buttonVariants({ variant: "secondary", size: "md" }), "rounded-xl", !businessEnabled ? "opacity-60 pointer-events-none" : "")}>
                Магазин
              </Link>
            </div>
          </div>

          {!isHydrated ? <p className="text-sm text-slate-500">Загрузка…</p> : null}

          {identityProfile ? (
            <VerificationStatusCard
              profile={identityProfile}
              subjectLabel="Проверка личности"
              onFixHref="/verification/identity"
            />
          ) : null}

          {businessProfile ? (
            <VerificationStatusCard profile={businessProfile} subjectLabel="Проверка бизнеса (магазина)" onFixHref="/verification/business" />
          ) : null}

          {!businessEnabled && role !== "buyer" ? null : null}

          {!identityProfile ? (
            <InlineNotice
              type="info"
              title="Подтверждение ещё не начато"
              description="Начните с подтверждения личности или магазина — это повышает доверие к профилю."
            />
          ) : null}
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}

