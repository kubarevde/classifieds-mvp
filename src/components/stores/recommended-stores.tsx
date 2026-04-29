import { StoreCard, StoreCatalogItem } from "@/components/stores/store-card";
import { SectionHeader } from "@/components/ui/section-header";

type RecommendedStoresProps = {
  stores: StoreCatalogItem[];
};

export function RecommendedStores({ stores }: RecommendedStoresProps) {
  if (!stores.length) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-none sm:p-5">
      <SectionHeader
        title="Рекомендуемые магазины"
        description="Подборка с высоким доверием покупателей — быстрый старт перед полным каталогом."
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {stores.map((store) => (
          <StoreCard key={`recommended-${store.id}`} store={store} />
        ))}
      </div>
    </section>
  );
}
