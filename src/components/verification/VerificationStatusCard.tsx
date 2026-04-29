"use client";

import Link from "next/link";

import type { VerificationLevel, VerificationProfile, VerificationSubjectType } from "@/services/verification/types";
import { getVerificationBenefits } from "@/services/verification";
import { VerificationBadge } from "./VerificationBadge";
import { VerificationChecklist } from "./VerificationChecklist";

function subjectTitle(subjectType: VerificationSubjectType, level: VerificationLevel) {
  if (subjectType === "buyer") return "Личность (покупатель)";
  if (subjectType === "seller") return "Личность (продавец)";
  if (level === "business") return "Магазин (бизнес)";
  return "Профиль (бизнес)";
  // store uses `level=business` in this mock
}

export function VerificationStatusCard({
  profile,
  onFixHref,
  subjectLabel,
}: {
  profile: VerificationProfile;
  subjectLabel?: string;
  onFixHref?: string;
}) {
  const completed = profile.requirements.filter((r) => r.completed).length;
  const total = profile.requirements.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const benefits = getVerificationBenefits(profile.level);

  const nextLabel =
    profile.status === "rejected"
      ? "Нужны данные — можно исправить"
      : profile.status === "needs_review"
        ? "Нужна дополнительная проверка"
        : profile.status === "pending"
          ? "Ожидает модерации (mock)"
          : profile.status === "verified"
            ? "Подтверждено"
            : "Не начато";

  const reason = profile.status === "rejected" || profile.status === "needs_review" ? profile.rejectionReason : null;

  return (
    <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="text-base font-semibold text-slate-900">{subjectLabel ?? subjectTitle(profile.subjectType, profile.level)}</h3>
          <p className="text-sm text-slate-600">{nextLabel}</p>
          {reason ? <p className="text-xs text-rose-700">Причина: {reason}</p> : null}
        </div>
        <VerificationBadge status={profile.status} level={profile.level} size="md" variant="full" />
      </div>

      {profile.requirements.length ? (
        <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Прогресс</p>
          <p className="text-sm text-slate-700">
            {completed}/{total} требований · {percent}%
          </p>
          <VerificationChecklist requirements={profile.requirements} />
        </div>
      ) : null}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Польза</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-700">
          {benefits.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {profile.status === "rejected" || profile.status === "needs_review" ? (
        onFixHref ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Link
              href={onFixHref}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              {profile.status === "rejected" ? "Исправить данные" : "Дозаполнить шаги"}
            </Link>
          </div>
        ) : null
      ) : null}
    </article>
  );
}

