"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { VerificationLevel, VerificationStatus } from "@/services/verification/types";
import { VerificationBadge } from "./VerificationBadge";

type VerificationTierCardProps = {
  title: string;
  subtitle: string;
  level: VerificationLevel;
  status: VerificationStatus;
  href: string;
};

export function VerificationTierCard({ title, subtitle, level, status, href }: VerificationTierCardProps) {
  const size = "sm" as const;

  return (
    <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>
        <VerificationBadge status={status} level={level} size={size} variant="compact" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Шаги ниже</span>
        <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:underline underline-offset-4">
          Начать
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

