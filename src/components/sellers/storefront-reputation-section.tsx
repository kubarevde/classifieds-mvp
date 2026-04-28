"use client";

import { useEffect } from "react";

import { ReviewsList } from "@/components/trust/ReviewsList";
import { TrustScoreWidget } from "@/components/trust/TrustScoreWidget";

type StorefrontReputationSectionProps = {
  targetId: string;
};

/**
 * Единый блок «Репутация и отзывы»: TrustScore слева, полный ReviewsList справа (без превью и без expand).
 */
export function StorefrontReputationSection({ targetId }: StorefrontReputationSectionProps) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const hash = window.location.hash;
    if (hash !== "#store-reviews-full" && hash !== "#store-reputation") {
      return;
    }
    const id = hash === "#store-reviews-full" ? "store-reviews-full" : "store-reputation";
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <section
      id="store-reputation"
      className="space-y-5 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-6"
    >
      <header className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Репутация и отзывы</h2>
        <p className="max-w-2xl text-sm text-slate-600">
          Показатель доверия платформы и отзывы покупателей — фильтры, сортировка и оценка ниже.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start">
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Доверие к продавцу</h3>
          <TrustScoreWidget targetId={targetId} />
        </div>

        <div className="min-w-0">
          <ReviewsList targetId={targetId} compactHeader sectionId="store-reviews-full" />
        </div>
      </div>
    </section>
  );
}
