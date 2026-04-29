"use client";

import Link from "next/link";
import { Flag, ListChecks, ShieldAlert, UserX } from "lucide-react";

import { buildSafetyReportNewUrl } from "@/lib/safety/build-report-new-url";
import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";

const cardClass =
  "flex min-h-[88px] flex-col justify-center gap-1 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md";

export function SafetyQuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Link
        href={buildSafetyReportNewUrl({ targetType: "listing" })}
        className={cn(cardClass, "border-amber-100 bg-amber-50/40")}
      >
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Flag className="h-4 w-4 text-amber-700" strokeWidth={1.5} aria-hidden />
          Сообщить о нарушении в объявлении
        </span>
        <span className="text-xs text-slate-600">Фейк, мошенничество, запрещённый товар</span>
      </Link>
      <Link
        href={buildSafetyReportNewUrl({ targetType: "user" })}
        className={cn(cardClass, "border-slate-200 bg-white")}
      >
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <UserX className="h-4 w-4 text-slate-600" strokeWidth={1.5} aria-hidden />
          Сообщить о нарушении пользователя
        </span>
        <span className="text-xs text-slate-600">Оскорбления, спам, выдача себя за другого</span>
      </Link>
      <Link
        href={buildSafetyReportNewUrl({ targetType: "other", targetLabel: "Сообщение о мошенничестве" })}
        className={cn(cardClass, "border-rose-100 bg-rose-50/40")}
      >
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <ShieldAlert className="h-4 w-4 text-rose-700" strokeWidth={1.5} aria-hidden />
          Сообщить о мошенничестве
        </span>
        <span className="text-xs text-slate-600">Оплата вне платформы, давление, схемы</span>
      </Link>
      <Link href="/safety/reports" className={cardClass}>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <ListChecks className="h-4 w-4 text-slate-600" strokeWidth={1.5} aria-hidden />
          Мои жалобы
        </span>
        <span className="text-xs text-slate-600">Статусы и история рассмотрения</span>
      </Link>
      <Link
        href="/safety/reports/new"
        className={cn(buttonVariants({ variant: "outline" }), "flex min-h-[88px] items-center justify-center sm:col-span-2")}
      >
        Универсальная форма жалобы
      </Link>
    </div>
  );
}
