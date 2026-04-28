"use client";

import { useEffect, useState } from "react";

import type { TrustScore } from "@/entities/trust/model";
import { mockTrustService } from "@/services/trust";

import { TrustBadge } from "./TrustBadge";
import { trustLevelLabel, trustLevelTone } from "./trust-utils";

type TrustScoreWidgetProps = {
  targetId: string;
  compact?: boolean;
  initialScore?: TrustScore | null;
};

export function TrustScoreWidget({ targetId, compact = false, initialScore }: TrustScoreWidgetProps) {
  const [score, setScore] = useState<TrustScore | null | undefined>(initialScore ?? undefined);

  useEffect(() => {
    let cancelled = false;
    void mockTrustService.getScore(targetId).then((next) => {
      if (!cancelled) {
        setScore(next);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [targetId]);

  if (score === undefined) {
    return <div className={`animate-pulse rounded-xl border border-slate-200 bg-slate-100 ${compact ? "h-8" : "h-24"}`} />;
  }

  if (!score) {
    return (
      <div className={`rounded-xl border border-slate-200 bg-slate-50 text-slate-600 ${compact ? "px-2 py-1 text-[11px]" : "p-3 text-sm"}`}>
        Нет trust-данных
      </div>
    );
  }

  const progressStyle = {
    background: `conic-gradient(rgb(15 23 42) ${score.overall * 3.6}deg, rgb(226 232 240) ${score.overall * 3.6}deg)`,
  };

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
        <div className="grid h-6 w-6 place-items-center rounded-full p-[2px]" style={progressStyle}>
          <div className="grid h-full w-full place-items-center rounded-full bg-white text-[10px] font-semibold text-slate-800">
            {score.overall}
          </div>
        </div>
        <span className="text-[11px] font-medium text-slate-700">{trustLevelLabel[score.level]}</span>
      </div>
    );
  }

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-full p-[3px]" style={progressStyle}>
          <div className="grid h-full w-full place-items-center rounded-full bg-white text-sm font-semibold text-slate-900">
            {score.overall}
          </div>
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-slate-900">Trust Score</p>
          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${trustLevelTone(score.level)}`}>
            {trustLevelLabel[score.level]}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {score.badges.slice(0, 4).map((badge) => (
          <TrustBadge key={`${score.userId}-${badge.type}-${badge.label}`} badge={badge} />
        ))}
      </div>
      {score.level === "new" ? (
        <p className="text-xs text-slate-600">
          Профиль новый: рейтинг доверия сформируется после первых подтверждённых сделок и отзывов.
        </p>
      ) : null}
    </section>
  );
}
