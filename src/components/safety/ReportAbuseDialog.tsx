"use client";

import Link from "next/link";
import { useEffect } from "react";

import type { ReportTargetType } from "@/services/safety";
import { buildSafetyReportNewUrl } from "@/lib/safety/build-report-new-url";
import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";

type ReportAbuseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: ReportTargetType;
  targetId?: string | null;
  targetLabel?: string | null;
};

const targetTypeLabels: Record<ReportTargetType, string> = {
  listing: "Объявление",
  store: "Магазин / витрина",
  user: "Пользователь",
  request: "Запрос / отклик",
  message: "Сообщение / переписка",
  transaction: "Сделка / оплата",
  other: "Другое",
};

export function ReportAbuseDialog({
  open,
  onOpenChange,
  targetType,
  targetId,
  targetLabel,
}: ReportAbuseDialogProps) {
  const href = buildSafetyReportNewUrl({ targetType, targetId, targetLabel });

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Закрыть"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-abuse-title"
        className="relative z-[61] w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        <h2 id="report-abuse-title" className="text-lg font-semibold text-slate-900">
          Жалоба в службу доверия
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Вы собираетесь сообщить о нарушении. Это отдельный поток от обычной поддержки (аккаунт, тарифы, баги).
        </p>
        <dl className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Объект</dt>
            <dd className="font-medium text-slate-900">{targetTypeLabels[targetType]}</dd>
          </div>
          {targetLabel ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Описание</dt>
              <dd className="text-slate-800">{targetLabel}</dd>
            </div>
          ) : null}
          {targetId ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">ID</dt>
              <dd className="font-mono text-xs text-slate-700">{targetId}</dd>
            </div>
          ) : null}
        </dl>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className={cn(buttonVariants({ variant: "outline" }), "h-10 w-full sm:w-auto")}
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </button>
          <Link
            href={href}
            className={cn(buttonVariants(), "inline-flex h-10 w-full items-center justify-center sm:w-auto")}
            onClick={() => onOpenChange(false)}
          >
            Перейти к форме жалобы
          </Link>
        </div>
      </div>
    </div>
  );
}
