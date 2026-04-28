"use client";

import { useEffect, useState } from "react";

import type { TrustScore } from "@/entities/trust/model";
import { ratingLabel, trustLevelLabel } from "@/components/trust/trust-utils";
import { mockTrustService, type ReviewStats } from "@/services/trust";

type StorefrontHeroTrustHintProps = {
  targetId: string;
};

/**
 * Минимальный trust в hero: одна строка + ссылка на основной блок репутации (без дублирования breakdown).
 */
export function StorefrontHeroTrustHint({ targetId }: StorefrontHeroTrustHintProps) {
  const [score, setScore] = useState<TrustScore | null | undefined>(undefined);
  const [stats, setStats] = useState<ReviewStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([mockTrustService.getScore(targetId), mockTrustService.getReviewStats(targetId)]).then(
      ([nextScore, nextStats]) => {
        if (!cancelled) {
          setScore(nextScore);
          setStats(nextStats);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [targetId]);

  if (score === undefined) {
    return <div className="h-14 animate-pulse rounded-xl bg-slate-100/80" aria-hidden />;
  }

  if (!score) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
        Репутация и отзывы появятся после первых подтверждённых сделок.
      </div>
    );
  }

  const reviewHint = stats ? `${ratingLabel(stats.overallRating)}/5 · ${stats.total} отзывов` : "оценка формируется";
  const badges = score.badges.slice(0, 2);

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5 font-semibold text-slate-700">
          {trustLevelLabel[score.level]}
        </span>
        <span className="text-slate-600">Доверие {score.overall}/100</span>
        <span className="text-slate-400">·</span>
        <span className="text-slate-600">{reviewHint}</span>
      </div>
      {badges.length ? (
        <div className="flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <span
              key={`${score.userId}-${badge.type}`}
              className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600"
            >
              {badge.label}
            </span>
          ))}
        </div>
      ) : null}
      <a
        href="#store-reputation"
        className="inline-flex text-[11px] font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
      >
        Подробная репутация и отзывы
      </a>
    </div>
  );
}
