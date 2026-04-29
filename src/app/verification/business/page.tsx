"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { InlineNotice } from "@/components/platform";
import { Container } from "@/components/ui/container";
import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { useDemoRole } from "@/components/demo-role/demo-role";
import type { VerificationProfile, VerificationSubjectType } from "@/services/verification/types";
import { getVerificationChecklist, getVerificationProfile, startVerification, submitVerificationStep } from "@/services/verification";
import { VerificationBadge } from "@/components/verification/VerificationBadge";
import { VerificationChecklist } from "@/components/verification/VerificationChecklist";
import { VerificationPrompt } from "@/components/verification/VerificationPrompt";
import { VerificationStatusCard } from "@/components/verification/VerificationStatusCard";
import { SectionCard } from "@/components/platform/SectionCard";
import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";

const fallbackSellerId = "marina-tech";
const buyerId = "buyer-dmitriy";

export default function VerificationBusinessPage() {
  const { role, currentSellerId, isHydrated } = useDemoRole();
  const userId = role === "buyer" ? buyerId : currentSellerId ?? fallbackSellerId;
  const subjectType: VerificationSubjectType = "store";
  const level = "business";

  const baseProfile = useMemo(() => {
    if (!isHydrated) return null;
    return getVerificationProfile(userId, subjectType);
  }, [isHydrated, subjectType, userId]);

  const [profileOverride, setProfileOverride] = useState<VerificationProfile | null>(null);
  const profile = useMemo(() => {
    if (!profileOverride) return baseProfile;
    if (profileOverride.userId !== userId) return baseProfile;
    if (profileOverride.subjectType !== subjectType) return baseProfile;
    return profileOverride;
  }, [baseProfile, profileOverride, subjectType, userId]);
  const [draft, setDraft] = useState({
    shopName: "",
    inn: "",
    docUploaded: false,
    address: "",
    contact: "",
  });

  const checklist = useMemo(() => {
    if (profile) return profile.requirements;
    return getVerificationChecklist({ userId, subjectType, level });
  }, [profile, subjectType, userId]);

  const businessDocsDone = checklist.find((r) => r.id === "req-business-docs")?.completed ?? false;
  const addressDone = checklist.find((r) => r.id === "req-address")?.completed ?? false;

  const canSubmit = businessDocsDone && addressDone;

  async function handleStart() {
    const next = startVerification({ userId, subjectType, level });
    setProfileOverride(next);
  }

  async function handleCompleteBusinessDocs() {
    const next = submitVerificationStep({
      userId,
      subjectType,
      level,
      requirementKey: "business_docs",
      requirementId: "req-business-docs",
      finalize: false,
    });
    setProfileOverride(next);
  }

  async function handleCompleteAddress() {
    const next = submitVerificationStep({
      userId,
      subjectType,
      level,
      requirementKey: "address",
      requirementId: "req-address",
      finalize: false,
    });
    setProfileOverride(next);
  }

  async function handleSubmit() {
    const next = submitVerificationStep({
      userId,
      subjectType,
      level,
      requirementKey: "address",
      requirementId: "req-address",
      finalize: true,
    });
    setProfileOverride(next);
  }

  const isBuyer = role === "buyer";

  if (isBuyer) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50/60">
        <Navbar />
        <main className="flex-1 py-8 sm:py-10">
          <Container className="space-y-6">
            <InlineNotice
              type="warning"
              title="Бизнес-проверка доступна владельцам магазинов"
              description="В демо переключите роль на «Продавец / Магазин», чтобы пройти шаги подтверждения бизнеса."
              action={{ label: "К подтверждению профиля", href: "/verification" }}
            />
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
        <Container className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Подтверждение магазина</h1>
              <p className="text-sm text-slate-600">Подтверждённый магазин вызывает больше доверия и повышает отклик.</p>
            </div>
            <div className="flex items-center gap-2">
              {profile ? <VerificationBadge status={profile.status} level={profile.level} size="md" variant="compact" /> : null}
              <Link href="/verification/status" className={cn(buttonVariants({ variant: "outline", size: "md" }), "rounded-xl")}>
                Статус
              </Link>
            </div>
          </div>

          {!profile || profile.status === "not_started" ? (
            <VerificationPrompt
              title="Подтвердите магазин, чтобы повысить доверие"
              description="Покупателям проще принимать решение, когда профиль магазина подтверждён."
              bullets={["Подтверждённый магазин вызывает больше доверия", "Покупатели чаще пишут подтверждённым продавцам"]}
            />
          ) : null}

          <SectionCard padding="sm" className="rounded-2xl border border-slate-200 bg-white p-0 shadow-sm">
            <div className="border-b border-slate-200/70 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">Шаги подтверждения магазина</p>
                <p className="text-xs text-slate-500">Прогресс по шагам</p>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="text-slate-600">Название магазина</span>
                  <input
                    value={draft.shopName}
                    onChange={(e) => setDraft((d) => ({ ...d, shopName: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                    placeholder="Напр. АгроТех Торговый двор"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-slate-600">ИНН / регистрационные данные</span>
                  <input
                    value={draft.inn}
                    onChange={(e) => setDraft((d) => ({ ...d, inn: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                    placeholder="ИНН (mock)"
                  />
                </label>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Документы / лицензия</p>
                <p className="mt-1 text-sm text-slate-600">Загрузка документа (mock). Для демо отметим требование после нажатия.</p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className={cn("text-sm font-semibold", businessDocsDone ? "text-emerald-800" : "text-slate-700")}>
                    {businessDocsDone ? "✓ Документы подтверждены" : "Не подтверждено"}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleCompleteBusinessDocs()}
                    className={cn(
                      buttonVariants({ variant: businessDocsDone ? "secondary" : "primary", size: "md" }),
                      "rounded-xl",
                    )}
                    disabled={!draft.inn.trim() && !draft.shopName.trim()}
                  >
                    {businessDocsDone ? "Обновить" : "Загрузить (mock)"}
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Адрес / контакт</p>
                <p className="mt-1 text-sm text-slate-600">Заполните поля и отметьте требование (mock).</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm">
                    <span className="text-slate-600">Адрес</span>
                    <input
                      value={draft.address}
                      onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                      placeholder="Город, улица, дом (mock)"
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-slate-600">Контакт</span>
                    <input
                      value={draft.contact}
                      onChange={(e) => setDraft((d) => ({ ...d, contact: e.target.value }))}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                      placeholder="Телефон / email (mock)"
                    />
                  </label>
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className={cn("text-sm font-semibold", addressDone ? "text-emerald-800" : "text-slate-700")}>
                    {addressDone ? "✓ Адрес/контакт подтверждены" : "Не подтверждено"}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleCompleteAddress()}
                    className={cn(buttonVariants({ variant: addressDone ? "secondary" : "primary", size: "md" }), "rounded-xl")}
                    disabled={!draft.address.trim() && !draft.contact.trim()}
                  >
                    {addressDone ? "Обновить" : "Подтвердить (mock)"}
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Чеклист</p>
                <div className="mt-3">
                  <VerificationChecklist requirements={checklist} />
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  {!profile || profile.status === "not_started" ? (
                    <button type="button" onClick={() => void handleStart()} className={cn(buttonVariants({ variant: "primary", size: "md" }), "rounded-xl")}>
                      Начать
                    </button>
                  ) : null}

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
                    Отправить на проверку
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">После отправки статус перейдёт в «На проверке».</p>
              </div>
            </div>
          </SectionCard>

          {profile && profile.status !== "not_started" ? (
            <VerificationStatusCard profile={profile} subjectLabel="Проверка бизнеса" onFixHref="/verification/business" />
          ) : null}
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}

