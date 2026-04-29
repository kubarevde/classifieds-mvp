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
import { useDemoRole } from "@/components/demo-role/demo-role";

import { getAppealById, getEnforcementActionById } from "@/services/enforcement";
import type { EnforcementAction } from "@/services/enforcement/types";
import { AppealTimeline } from "@/components/enforcement/AppealTimeline";

export default function EnforcementAppealDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const { role, currentSellerId, isHydrated } = useDemoRole();
  const userId = role === "buyer" ? "buyer-dmitriy" : currentSellerId ?? "marina-tech";
  const appeal = useMemo(() => {
    if (!isHydrated || !id) return null;
    return getAppealById(id);
  }, [id, isHydrated]);

  const action: EnforcementAction | null = useMemo(() => {
    if (!appeal) return null;
    return getEnforcementActionById(appeal.enforcementActionId);
  }, [appeal]);

  const allowed = useMemo(() => {
    if (!appeal) return false;
    return appeal.userId === userId;
  }, [appeal, userId]);

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

  if (!appeal || !allowed) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50/60">
        <Navbar />
        <main className="flex-1 py-8 sm:py-10">
          <Container className="max-w-2xl">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <p className="text-sm text-slate-700">Обращение не найдено или принадлежит другому пользователю.</p>
              <Link href="/enforcement/appeals" className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 items-center px-4")}>
                К списку
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionHeader
              as="h1"
              title="Детали обращения"
              description="Текст обращения, timeline статусов и итоговое решение (mock)."
            />
            <Link
              href="/enforcement/appeals"
              className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 items-center px-4")}
            >
              ← К списку
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Исходное решение платформы
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{action?.targetLabel ?? "—"}</p>
                <p className="mt-1 text-sm text-slate-600">
                  ID решения: <span className="font-mono text-xs">{appeal.enforcementActionId}</span>
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Сообщение</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{appeal.message}</p>
                <p className="mt-3 text-xs text-slate-500">
                  Создано: {new Date(appeal.createdAt).toLocaleString("ru-RU")}
                </p>
              </div>

              {appeal.resolutionNote ? (
                <InlineNotice type="success" title="Решение" description={appeal.resolutionNote} />
              ) : null}
            </section>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="text-base font-semibold text-slate-900">Timeline</h2>
                <p className="mt-1 text-xs text-slate-500">Прозрачная история пересмотра (mock).</p>
                <div className="mt-4">
                  <AppealTimeline appeal={appeal} />
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

