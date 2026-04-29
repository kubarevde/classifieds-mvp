"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { DemoRoleGuard } from "@/components/demo-role/demo-role";
import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SafetyCaseThread } from "@/components/safety/SafetyCaseThread";
import { Badge } from "@/components/ui";
import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";
import { Container } from "@/components/ui/container";
import { InlineNotice } from "@/components/platform";
import { reportReasonLabels } from "@/lib/safety/report-reasons";
import { useDemoRole } from "@/components/demo-role/demo-role";
import { getDemoSupportUserId } from "@/lib/support/demo-user";
import { getSafetyReportForUser, safetyStatusLabelRu, type SafetyReport } from "@/services/safety";
import { getUserEnforcementActions } from "@/services/enforcement";
import { VerificationBadgeFromTarget } from "@/components/verification/VerificationBadgeFromTarget";
import { getStorefrontSellerByListingId } from "@/lib/sellers";

function statusBadgeVariant(status: SafetyReport["status"]): "default" | "secondary" | "outline" {
  if (status === "action_taken" || status === "resolved") {
    return "default";
  }
  if (status === "under_review") {
    return "secondary";
  }
  return "outline";
}

function SafetyReportDetailBody() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params?.id[0] : "";
  const { role, currentSellerId, isHydrated } = useDemoRole();
  const userId = getDemoSupportUserId(role, currentSellerId);
  const [report, setReport] = useState<SafetyReport | null>(null);

  useEffect(() => {
    if (!isHydrated || !userId || !id) {
      return;
    }
    void Promise.resolve().then(() => {
      setReport(getSafetyReportForUser(userId, id));
    });
  }, [isHydrated, userId, id]);

  if (!isHydrated) {
    return <p className="text-sm text-slate-500">Загрузка…</p>;
  }
  if (!id || !userId) {
    return <p className="text-sm text-slate-600">Некорректная ссылка.</p>;
  }
  if (!report) {
    return (
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm text-slate-700">Жалоба не найдена или принадлежит другому пользователю.</p>
        <Link href="/safety/reports" className={cn(buttonVariants(), "inline-flex h-10 items-center px-4")}>
          К списку
        </Link>
      </div>
    );
  }

  const relatedEnforcementAction =
    report.status === "action_taken" && report.targetId
      ? getUserEnforcementActions(userId).find((a) => a.targetType === report.targetType && a.targetId === report.targetId) ?? null
      : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Link href="/safety/reports" className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 items-center px-4")}>
          ← Все жалобы
        </Link>
      </div>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusBadgeVariant(report.status)}>{safetyStatusLabelRu(report.status)}</Badge>
          <span className="text-xs text-slate-500">
            Обновлено {new Date(report.updatedAt).toLocaleString("ru-RU")}
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">{report.targetLabel ?? "Жалоба"}</h1>
        <p className="text-sm text-slate-600">
          Объект: <span className="font-medium">{report.targetType}</span>
          {report.targetId ? (
            <>
              {" "}
              · ID: <span className="font-mono text-xs">{report.targetId}</span>
            </>
          ) : null}
        </p>
        {report.targetId ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {report.targetType === "store" ? (
              <VerificationBadgeFromTarget targetId={report.targetId} subjectType="store" size="sm" variant="compact" />
            ) : null}
            {report.targetType === "user" ? (
              <VerificationBadgeFromTarget targetId={report.targetId} subjectType="buyer" size="sm" variant="compact" />
            ) : null}
            {report.targetType === "listing" ? (
              (() => {
                const storefrontSeller = getStorefrontSellerByListingId(report.targetId as string);
                if (!storefrontSeller) return null;
                return (
                  <>
                    <VerificationBadgeFromTarget targetId={storefrontSeller.id} subjectType="seller" size="sm" variant="compact" />
                    <VerificationBadgeFromTarget targetId={storefrontSeller.id} subjectType="store" size="sm" variant="compact" />
                  </>
                );
              })()
            ) : null}
          </div>
        ) : null}
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-800">Причина:</span> {reportReasonLabels[report.reason]}
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">Описание</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{report.description}</p>
      </section>

      {report.evidence.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">Доказательства</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {report.evidence.map((ev) => (
              <li key={ev.id} className="rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-xs font-semibold uppercase text-slate-500">{ev.type}</span>
                <p className="mt-1 break-all">{ev.value}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {report.adminNote ? (
        <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">Комментарий модерации</h2>
          <p className="mt-2 text-sm text-slate-700">{report.adminNote}</p>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">Этапы рассмотрения</h2>
        <p className="mt-1 text-xs text-slate-500">
          Прозрачный поток: подтверждение получения, проверка, решение. Обжалование подаётся через центр решений.
        </p>
        {relatedEnforcementAction ? (
          <div className="mt-4">
            <InlineNotice
              type="info"
              title="По этому кейсу есть решение платформы"
              description="Дальнейшее обращение на пересмотр подаётся через центр решений. Поддержка остаётся отдельным каналом для бытовых вопросов."
              action={{ label: "Открыть детали", href: `/enforcement/actions/${relatedEnforcementAction.id}` }}
            />
          </div>
        ) : null}
        <div className="mt-4">
          <SafetyCaseThread report={report} />
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link
          href={`/safety/reports/new?targetType=${report.targetType}&targetId=${encodeURIComponent(report.targetId ?? "")}&targetLabel=${encodeURIComponent(report.targetLabel ?? "")}`}
          className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 items-center justify-center px-4")}
        >
          Добавить детали (новая жалоба)
        </Link>
        <Link href="/safety" className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 items-center justify-center px-4")}>
          Центр безопасности
        </Link>
        <Link href="/support/tickets/new" className={cn(buttonVariants(), "inline-flex h-10 items-center justify-center px-4")}>
          Связаться с поддержкой
        </Link>
      </div>
    </div>
  );
}

export default function SafetyReportDetailPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <Navbar />
      <main className="flex-1 py-8 sm:py-10">
        <Container className="max-w-3xl">
          <DemoRoleGuard
            allowedRoles={["buyer", "seller", "all"]}
            title="Детали жалобы"
            description="Переключите роль с гостя, чтобы просмотреть обращение."
            ctaRoles={["buyer", "seller"]}
          >
            <SafetyReportDetailBody />
          </DemoRoleGuard>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
