"use client";

import { useMemo, useState } from "react";

import { AgricultureCategories } from "@/components/agriculture/agriculture-categories";
import { DiscoveryFlowModal } from "@/components/agriculture/discovery-flow-modal";
import { DiscoveryResultsFeed } from "@/components/agriculture/discovery-results-feed";
import { agricultureListings } from "@/lib/agriculture";
import {
  DISCOVERY_DEFAULT_CITY,
  DiscoveryAnswers,
  resolveDiscoveryListings,
} from "@/lib/discovery";

export function AgriculturePageClient() {
  const [isFlowOpen, setIsFlowOpen] = useState(false);
  const [answers, setAnswers] = useState<DiscoveryAnswers | null>(null);

  const discoveryListings = useMemo(() => {
    if (!answers) {
      return [];
    }

    return resolveDiscoveryListings(answers, DISCOVERY_DEFAULT_CITY);
  }, [answers]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="rounded-3xl border border-emerald-200/80 bg-white/85 p-4 shadow-sm shadow-emerald-900/5 backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Отдельный раздел</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-emerald-950 sm:text-3xl">
              Сельское хозяйство
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-stone-600 sm:text-base">
              Специальная атмосфера для агро-объявлений: от продукции и земли до техники и готового бизнеса.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFlowOpen(true)}
            className="sticky top-20 inline-flex h-11 items-center justify-center rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-700 to-green-600 px-4 text-sm font-semibold text-white shadow-md shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:brightness-105"
          >
            ✨ Умная агро-лента
          </button>
        </div>
      </section>

      <AgricultureCategories />

      {answers ? (
        <DiscoveryResultsFeed listings={discoveryListings} answers={answers} onReset={() => setIsFlowOpen(true)} />
      ) : (
        <section className="rounded-3xl border border-stone-200 bg-white p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">Актуальные объявления раздела</h2>
          <p className="mt-1 text-sm text-stone-600">
            Пока вы не выбрали персональный сценарий, показываем базовую подборку по сельскому хозяйству.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {agricultureListings.slice(0, 6).map((listing) => (
              <article key={listing.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">{listing.categoryLabel}</p>
                <p className="mt-1 text-base font-semibold text-stone-900">{listing.title}</p>
                <p className="mt-1 text-sm font-semibold text-emerald-900">{listing.price}</p>
                <p className="mt-1 text-xs text-stone-500">📍 {listing.location}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <DiscoveryFlowModal
        isOpen={isFlowOpen}
        onClose={() => setIsFlowOpen(false)}
        onComplete={(flowAnswers) => setAnswers(flowAnswers)}
      />
    </div>
  );
}
