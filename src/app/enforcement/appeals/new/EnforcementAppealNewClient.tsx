"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import {
  getAppealAvailabilityReason,
  getAppealableActions,
  getEnforcementActionById,
  getUserAppeals,
} from "@/services/enforcement";
import { useDemoRole } from "@/components/demo-role/demo-role";
import { AppealForm } from "@/components/enforcement/AppealForm";
import { InlineNotice } from "@/components/platform";
import { cn, buttonVariants } from "@/components/ui";

export function EnforcementAppealNewClient() {
  const searchParams = useSearchParams();
  const { role, currentSellerId, isHydrated } = useDemoRole();

  const userId = role === "buyer" ? "buyer-dmitriy" : currentSellerId ?? "marina-tech";

  const enforcementActionId = useMemo(() => {
    const raw = searchParams.get("enforcementActionId");
    return raw ? raw.toString() : null;
  }, [searchParams]);

  const action = enforcementActionId ? getEnforcementActionById(enforcementActionId) : null;
  const existingAppeal =
    enforcementActionId && isHydrated
      ? getUserAppeals(userId).find((ap) => ap.enforcementActionId === enforcementActionId) ?? null
      : null;

  const appealAllowed = useMemo(() => {
    if (!enforcementActionId) return false;
    return getAppealableActions({ userId, enforcementActionId }).length > 0;
  }, [enforcementActionId, userId]);
  const availabilityText = action ? getAppealAvailabilityReason(action, existingAppeal) : "Для этого решения обращение на пересмотр уже недоступно.";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <Navbar />
      <main className="flex-1 py-8 sm:py-10">
        <Container className="space-y-6">
          <SectionHeader
            as="h1"
            title="Подать обращение на пересмотр"
            description="Опишите причину и приложите текстовое объяснение (mock)."
            actions={
              <Link href="/enforcement/appeals" className={cn(buttonVariants({ variant: "outline", size: "md" }), "rounded-xl")}>
                ← Назад
              </Link>
            }
          />

          {!isHydrated ? <p className="text-sm text-slate-500">Загрузка…</p> : null}

          {!enforcementActionId || !action ? (
            <InlineNotice type="error" title="Некорректная ссылка" description="Нужен enforcementActionId из query." />
          ) : null}

          {enforcementActionId && action ? (
            <>
              {appealAllowed ? null : (
                <InlineNotice
                  type="warning"
                  title="Обращение на пересмотр недоступно"
                  description={availabilityText}
                />
              )}
              <AppealForm userId={userId} enforcementActionId={enforcementActionId} />
            </>
          ) : null}
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}

