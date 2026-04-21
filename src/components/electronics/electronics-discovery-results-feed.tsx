import { VerticalListingCard } from "@/components/agriculture/vertical-listing-card";
import { DiscoveryListing, ElectronicsDiscoveryAnswers } from "@/lib/discovery";

type ElectronicsDiscoveryResultsFeedProps = {
  listings: DiscoveryListing[];
  answers: ElectronicsDiscoveryAnswers;
  onReset: () => void;
};

function getFeedHeadline(answers: ElectronicsDiscoveryAnswers) {
  const budgetMap = {
    budget: "до 60 000 ₽",
    mid: "60 000 - 130 000 ₽",
    premium: "верхний сегмент",
  };
  const useCaseMap = {
    work: "для работы и учёбы",
    gaming: "для игр",
    content: "для контента",
    study: "для учёбы",
    cheap: "с бюджетным фокусом",
  };
  const conditionMap = {
    new: "новое / как новое",
    used: "б/у",
    any: "без фильтра по состоянию",
  };

  return `${budgetMap[answers.budget]}, ${useCaseMap[answers.useCase]}, ${conditionMap[answers.condition]}`;
}

export function ElectronicsDiscoveryResultsFeed({
  listings,
  answers,
  onReset,
}: ElectronicsDiscoveryResultsFeedProps) {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-300 bg-slate-50/90 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Discovery feed</p>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              {getFeedHeadline(answers)}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Discovery-режим электроники в едином каталоге: быстрый отбор по бюджету, задаче и состоянию.
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Пересобрать подборку
          </button>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          Под эти параметры пока нет карточек. Попробуйте более широкий сценарий.
        </div>
      ) : (
        <div className="h-[72vh] snap-y snap-mandatory overflow-y-auto rounded-3xl border border-slate-300 bg-[linear-gradient(to_bottom,#f7f9fc,#eef3f8)] p-3 sm:p-4">
          <div className="space-y-4">
            {listings.map((listing) => (
              <VerticalListingCard key={listing.id} listing={listing} tone="electronics" />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
