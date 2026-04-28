"use client";

import { useEffect, useState } from "react";

import type { TrustScore } from "@/entities/trust/model";
import { ReviewsList, TrustScoreWidget } from "@/components/trust";
import { mockTrustService } from "@/services/trust";

type StoreReputationSectionProps = {
  sellerId: string;
};

export function StoreReputationSection({ sellerId }: StoreReputationSectionProps) {
  const [score, setScore] = useState<TrustScore | null>(null);

  useEffect(() => {
    let cancelled = false;
    void mockTrustService.getScore(sellerId).then((next) => {
      if (!cancelled) {
        setScore(next);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  return (
    <section id="dashboard-store-reputation" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Репутация</h2>
        <p className="text-sm text-slate-600">Trust Score, факторы доверия и отзывы покупателей по вашему магазину.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-3">
          <TrustScoreWidget targetId={sellerId} initialScore={score} />
          {score ? (
            <ul className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
              <li>Личность: {score.components.verified_identity ? "подтверждена" : "не подтверждена"}</li>
              <li>Бизнес: {score.components.verified_business ? "подтверждён" : "не подтверждён"}</li>
              <li>Сделки: {score.components.successful_deals}</li>
              <li>Response rate: {Math.round(score.components.response_rate * 100)}%</li>
              <li>Response time: {score.components.response_time}</li>
              <li>Профиль: {Math.round(score.components.profile_completeness * 100)}%</li>
              <li>Споры: {score.components.no_disputes ? "критичных нет" : "требуется внимание"}</li>
            </ul>
          ) : null}
        </div>
        <ReviewsList targetId={sellerId} hideWriteReview />
      </div>
    </section>
  );
}
