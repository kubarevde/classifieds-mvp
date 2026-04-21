import { VerticalListingCard } from "@/components/agriculture/vertical-listing-card";
import { DiscoveryAnswers, DiscoveryListing } from "@/lib/discovery";

type DiscoveryResultsFeedProps = {
  listings: DiscoveryListing[];
  answers: DiscoveryAnswers;
  onReset: () => void;
};

function getFeedHeadline(answers: DiscoveryAnswers) {
  const priceMap = {
    expensive: "Топ по стоимости",
    cheap: "Бюджетные находки",
  };
  const geoMap = {
    my_city: "в вашем городе",
    all_russia: "по всей России",
  };
  const intentMap = {
    machinery: "с фокусом на технику",
    materials: "по материалам и расходникам",
    service: "по сервису и поддержке",
    farming: "для растениеводства и земли",
    any: "без ограничений по категории",
  };

  return `${priceMap[answers.price]} ${geoMap[answers.geo]}, ${intentMap[answers.intent]}`;
}

export function DiscoveryResultsFeed({ listings, answers, onReset }: DiscoveryResultsFeedProps) {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-emerald-200 bg-white/80 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Discovery feed</p>
            <h2 className="text-xl font-semibold tracking-tight text-emerald-950 sm:text-2xl">
              {getFeedHeadline(answers)}
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Тематическая лента внутри общего каталога: листайте карточки и возвращайтесь к общей выдаче в один тап.
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-900 transition hover:bg-emerald-50"
          >
            Пересобрать подборку
          </button>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-300 bg-white p-8 text-center text-stone-600">
          Под ваши ответы пока нет карточек. Попробуйте другой сценарий.
        </div>
      ) : (
        <div className="h-[72vh] snap-y snap-mandatory overflow-y-auto rounded-3xl border border-emerald-200 bg-[#f2f8f1] p-3 sm:p-4">
          <div className="space-y-4">
            {listings.map((listing) => (
              <VerticalListingCard key={listing.id} listing={listing} tone="agriculture" />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
