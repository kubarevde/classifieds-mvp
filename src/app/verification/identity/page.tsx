"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { SectionCard } from "@/components/platform";
import { Container } from "@/components/ui/container";
import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { useDemoRole } from "@/components/demo-role/demo-role";
import type { VerificationProfile, VerificationRequirement, VerificationSubjectType } from "@/services/verification/types";
import { getVerificationProfile, getVerificationChecklist, startVerification, submitVerificationStep } from "@/services/verification";
import { VerificationBadge } from "@/components/verification/VerificationBadge";
import { VerificationChecklist } from "@/components/verification/VerificationChecklist";
import { VerificationPrompt } from "@/components/verification/VerificationPrompt";
import { VerificationStatusCard } from "@/components/verification/VerificationStatusCard";
import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";

type StepDef = {
  id: string;
  title: string;
  requirementId: string | null;
  requirementKey: VerificationRequirement["key"] | null;
};

const identitySteps: StepDef[] = [
  { id: "phone", title: "Подтвердить телефон", requirementId: "req-phone", requirementKey: "phone" },
  { id: "email", title: "Подтвердить email", requirementId: "req-email", requirementKey: "email" },
  { id: "doc", title: "Загрузить документ", requirementId: "req-identity-doc", requirementKey: "identity" },
  { id: "selfie", title: "Selfie / live-check", requirementId: "req-identity-selfie", requirementKey: "identity" },
];

const fallbackSellerId = "marina-tech";

export default function VerificationIdentityPage() {
  const { currentSellerId, isHydrated } = useDemoRole();
  const userId = currentSellerId ?? fallbackSellerId;
  const subjectType: VerificationSubjectType = "seller";
  const level = "identity";

  const baseProfile = useMemo(() => {
    if (!isHydrated) return null;
    return getVerificationProfile(userId, subjectType);
  }, [isHydrated, subjectType, userId]);

  const [profileOverride, setProfileOverride] = useState<VerificationProfile | null>(null);
  const activeProfile = useMemo(() => {
    if (!profileOverride) return baseProfile;
    if (profileOverride.userId !== userId) return baseProfile;
    if (profileOverride.subjectType !== subjectType) return baseProfile;
    return profileOverride;
  }, [baseProfile, profileOverride, subjectType, userId]);

  const steps = identitySteps;

  const shouldStartIdentityFlow =
    !activeProfile || activeProfile.status === "not_started" || activeProfile.level !== "identity";
  const actionsDisabled = shouldStartIdentityFlow;

  const completedRequirementIds = useMemo(() => {
    if (!activeProfile) return new Set<string>();
    return new Set(activeProfile.requirements.filter((r) => r.completed).map((r) => r.id));
  }, [activeProfile]);

  const currentStepIndex = useMemo(() => {
    const firstIncomplete = steps.findIndex((s) => (s.requirementId ? !completedRequirementIds.has(s.requirementId) : false));
    return firstIncomplete === -1 ? steps.length : firstIncomplete;
  }, [completedRequirementIds, steps]);

  const canSubmit = !actionsDisabled && currentStepIndex >= steps.length;

  async function handleStart() {
    const next = startVerification({ userId, subjectType, level });
    setProfileOverride(next);
  }

  async function handleCompleteStep(step: StepDef) {
    if (!step.requirementId || !step.requirementKey) return;

    const next = submitVerificationStep({
      userId,
      subjectType,
      level,
      requirementKey: step.requirementKey,
      requirementId: step.requirementId,
      finalize: false,
    });
    setProfileOverride(next);
  }

  async function handleSubmit() {
    // Finalize: в демо ставим pending, даже если требования уже заполнены.
    const last = steps[steps.length - 1];
    const next = submitVerificationStep({
      userId,
      subjectType,
      level,
      requirementKey: last?.requirementKey ?? "identity",
      requirementId: last?.requirementId ?? undefined,
      finalize: true,
    });
    setProfileOverride(next);
  }

  const checklist = activeProfile ? activeProfile.requirements : getVerificationChecklist({ userId, subjectType, level });
  const suggestedButtonLabel =
    activeProfile?.status === "pending"
      ? "Продолжить позже"
      : activeProfile?.status === "verified"
        ? "Готово"
        : "Отправить на модерацию";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <Navbar />
      <main className="flex-1 py-8 sm:py-10">
        <Container className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Подтверждение личности</h1>
              <p className="text-sm text-slate-600">
                Подтвердите телефон, email и личность, чтобы повысить доверие к профилю.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {activeProfile ? (
                <VerificationBadge status={activeProfile.status} level={activeProfile.level} size="md" variant="compact" />
              ) : null}
              <Link href="/verification/status" className={cn(buttonVariants({ variant: "outline", size: "md" }), "rounded-xl")}>
                Статус
              </Link>
            </div>
          </div>

          {shouldStartIdentityFlow ? (
            <VerificationPrompt
              title="Подтвердите личность продавца"
              description="Подтверждённый профиль вызывает больше доверия и помогает быстрее получать отклики."
              bullets={
                ["Подтверждённая личность", "Больше доверия в карточках и деталях"]
              }
            />
          ) : null}

          <SectionCard padding="sm" className="rounded-2xl border border-slate-200 bg-white p-0 shadow-sm sm:p-0">
            <div className="border-b border-slate-200/70 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">
                  Шаги подтверждения профиля{" "}
                  <span className="text-slate-500">
                    ({Math.min(currentStepIndex, steps.length)}/{steps.length})
                  </span>
                </p>
                <p className="text-xs text-slate-500">Прогресс по шагам</p>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <ol className="space-y-3">
                {steps.map((s, idx) => {
                  const done = s.requirementId ? completedRequirementIds.has(s.requirementId) : false;
                  const isActive = idx === currentStepIndex && !done;

                  return (
                    <li
                      key={s.id}
                      className={[
                        "rounded-xl border p-3 transition",
                        done ? "border-emerald-200 bg-emerald-50" : isActive ? "border-slate-300 bg-white" : "border-slate-200 bg-white",
                      ].join(" ")}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">{idx + 1}. {s.title}</p>
                          <p className="mt-0.5 text-xs text-slate-600">
                            {done ? "Готово" : "Нажмите, чтобы завершить шаг (mock)."}
                          </p>
                        </div>
                        {done ? (
                          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                            ✓ Выполнено
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleCompleteStep(s)}
                            className={cn(buttonVariants({ variant: isActive ? "primary" : "secondary", size: "md" }), "rounded-xl")}
                            disabled={actionsDisabled}
                          >
                            {isActive ? "Подтвердить" : "Выполнить"}
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Чеклист</p>
                <div className="mt-3">
                  <VerificationChecklist requirements={checklist} />
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  {shouldStartIdentityFlow ? (
                    <button
                      type="button"
                      onClick={() => void handleStart()}
                      className={cn(buttonVariants({ variant: "primary", size: "md" }), "rounded-xl")}
                    >
                      Начать
                    </button>
                  ) : null}

                  {activeProfile && activeProfile.status !== "pending" && activeProfile.status !== "verified" ? null : null}

                  <button
                    type="button"
                    disabled={!canSubmit}
                    onClick={() => void handleSubmit()}
                    className={cn(
                      buttonVariants({ variant: "primary", size: "md" }),
                      "rounded-xl",
                      !canSubmit ? "opacity-50 cursor-not-allowed" : "",
                    )}
                  >
                    {canSubmit ? suggestedButtonLabel : "Заполните все шаги"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  После отправки статус перейдёт в «На проверке».
                </p>
              </div>
            </div>
          </SectionCard>

          {activeProfile && activeProfile.status !== "not_started" ? (
            <VerificationStatusCard
              profile={activeProfile}
              subjectLabel="Проверка личности"
              onFixHref="/verification/identity"
            />
          ) : null}
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}

