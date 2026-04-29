"use client";

import { TrustSummaryFromTarget } from "@/components/trust";
import { VerificationBadgeFromTarget } from "@/components/verification/VerificationBadgeFromTarget";

type StorefrontHeroTrustHintProps = {
  targetId: string;
  memberSinceLabel?: string;
};

/**
 * Минимальный trust в hero: одна строка + ссылка на основной блок репутации (без дублирования breakdown).
 */
export function StorefrontHeroTrustHint({ targetId, memberSinceLabel }: StorefrontHeroTrustHintProps) {
  return (
    <a href="#store-reputation" className="block">
      <TrustSummaryFromTarget
        targetId={targetId}
        variant="full"
        memberSinceLabel={memberSinceLabel}
        className="transition hover:border-slate-300"
      />
      <div className="mt-2">
        <VerificationBadgeFromTarget targetId={targetId} subjectType="store" size="sm" variant="compact" />
      </div>
      <span className="mt-1 inline-flex text-[11px] font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900">
        Подробная репутация и отзывы
      </span>
    </a>
  );
}
