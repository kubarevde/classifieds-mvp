"use client";

import { CheckCircle2, Clock3, ShieldCheck, XCircle } from "lucide-react";

import type { VerificationLevel, VerificationStatus } from "@/services/verification/types";

type VerificationBadgeProps = {
  status: VerificationStatus;
  level: VerificationLevel;
  size: "sm" | "md" | "lg";
  variant: "compact" | "full";
};

function statusIcon(status: VerificationStatus) {
  if (status === "verified") {
    return <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />;
  }
  if (status === "pending") {
    return <Clock3 className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />;
  }
  if (status === "needs_review") {
    return <Clock3 className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />;
  }
  if (status === "rejected") {
    return <XCircle className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />;
  }
  return <CheckCircle2 className="h-3.5 w-3.5 opacity-50" strokeWidth={1.8} aria-hidden />;
}

function labelByStatusAndLevel(status: VerificationStatus, level: VerificationLevel, variant: "compact" | "full") {
  if (variant === "compact") {
    if (status === "verified") {
      if (level === "business") return "✓ Магазин проверен";
      if (level === "identity") return "✓ Личность подтверждена";
      if (level === "trusted_plus") return "✓ Trusted+";
      return "✓ Проверен";
    }
    if (status === "pending") {
      return "Проверка в процессе";
    }
    if (status === "needs_review") return "Нужна доп. проверка";
    if (status === "rejected") return "Нужны данные";
    return "Не подтвержден";
  }

  // full
  if (status === "verified") {
    if (level === "business") return "Подтверждение магазина";
    if (level === "identity") return "Подтверждение личности";
    if (level === "trusted_plus") return "Trusted+ (демо)";
    return "Подтверждение профиля";
  }
  if (status === "pending") return "Проверка в процессе";
  if (status === "needs_review") return "Нужна дополнительная проверка";
  if (status === "rejected") return "Нужны данные";
  return "Проверка не начата";
}

export function VerificationBadge({ status, level, size, variant }: VerificationBadgeProps) {
  const label = labelByStatusAndLevel(status, level, variant);

  const tone =
    status === "verified"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "pending"
        ? "border-sky-200 bg-sky-50 text-sky-950"
        : status === "needs_review"
          ? "border-amber-200 bg-amber-50 text-amber-950"
          : status === "rejected"
            ? "border-rose-200 bg-rose-50 text-rose-950"
            : "border-slate-200 bg-white text-slate-700";

  const sizeClass =
    size === "sm" ? "px-2 py-0.5 text-[11px]" : size === "lg" ? "px-3 py-1 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border font-semibold shadow-sm",
        tone,
        sizeClass,
        variant === "full" ? "rounded-xl" : null,
      ].filter(Boolean).join(" ")}
      title={variant === "full" ? "Демо-статус проверки профиля" : undefined}
    >
      {statusIcon(status)}
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
}

