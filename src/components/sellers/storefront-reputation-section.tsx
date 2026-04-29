"use client";

import { useEffect } from "react";

import { ReviewsList } from "@/components/trust/ReviewsList";

type StorefrontReputationSectionProps = {
  targetId: string;
};

/**
 * Репутация витрины: единый полный список отзывов без дубля trust-summary из hero.
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

      <div className="min-w-0">
        <ReviewsList targetId={targetId} compactHeader sectionId="store-reviews-full" />
      </div>
    </section>
  );
}
