import { StoreCard, StoreCatalogItem } from "@/components/stores/store-card";

type RecommendedStoresProps = {
  stores: StoreCatalogItem[];
};

export function RecommendedStores({ stores }: RecommendedStoresProps) {
  if (!stores.length) {
    return null;
  }

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Рекомендуемые магазины</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Подборка с высоким доверием покупателей</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {stores.map((store) => (
          <StoreCard key={`recommended-${store.id}`} store={store} />
        ))}
      </div>
    </section>
  );
}
