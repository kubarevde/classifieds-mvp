"use client";

import Link from "next/link";

import { X } from "lucide-react";

import { cn } from "@/components/ui/cn";
import { buttonVariants } from "@/lib/button-styles";
import type { VerificationSubjectType } from "@/services/verification/types";
import { VerificationBadge } from "./VerificationBadge";

export function StartVerificationDialog({
  open,
  onOpenChange,
  currentRoleSubjectType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** В демо: buyer/seller/all выбирают разные subjectType для identity/business. */
  currentRoleSubjectType: VerificationSubjectType;
}) {
  if (!open) return null;

  const identityHref = currentRoleSubjectType === "buyer" ? "/verification/identity" : "/verification/identity";
  const businessHref = currentRoleSubjectType === "buyer" ? "/verification/business" : "/verification/business";

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
        className="relative z-[61] w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">Начать подтверждение</h2>
            <p className="text-sm text-slate-600">Выберите, что подтверждать: личность или бизнес.</p>
          </div>
          <button
            type="button"
            className={cn(buttonVariants({ variant: "ghost" }), "h-10 w-10")}
            onClick={() => onOpenChange(false)}
            aria-label="Закрыть"
          >
            <X className="h-4 w-4" strokeWidth={1.6} aria-hidden />
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Личность</p>
            <p className="mt-1 text-sm text-slate-600">Телефон/email + документ и live-check (mock).</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <VerificationBadge status="not_started" level={currentRoleSubjectType === "buyer" ? "basic" : "identity"} size="sm" variant="compact" />
              <Link
                href={identityHref}
                onClick={() => onOpenChange(false)}
                className={cn(buttonVariants({ variant: "primary", size: "md" }), "min-h-10")}
              >
                Начать
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Магазин / бизнес</p>
            <p className="mt-1 text-sm text-slate-600">Документы + адрес/контакт (mock).</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <VerificationBadge status="not_started" level="business" size="sm" variant="compact" />
              <Link
                href={businessHref}
                onClick={() => onOpenChange(false)}
                className={cn(buttonVariants({ variant: "primary", size: "md" }), "min-h-10")}
              >
                Начать
              </Link>
            </div>
          </div>

          <Link
            href="/verification/status"
            onClick={() => onOpenChange(false)}
            className={cn(buttonVariants({ variant: "outline", size: "md" }), "w-full justify-center")}
          >
            Посмотреть статус
          </Link>
        </div>
      </div>
    </div>
  );
}

