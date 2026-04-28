type StoreCatalogHeroProps = {
  totalStores: number;
};

/** Hero copy + catalog size only — query entry is the unified search shell above/beside this block. */
export function StoreCatalogHero({ totalStores }: StoreCatalogHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-white via-slate-50/80 to-slate-100/40 p-4 shadow-none sm:p-5">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-slate-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-6 h-36 w-36 rounded-full bg-white/70 blur-2xl" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Каталог магазинов</p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Найдите магазин под вашу задачу</h1>
          <p className="max-w-2xl text-sm text-slate-600">
            Проверенные витрины продавцов и бизнесов: уточняйте мир, рейтинг и город в блоке ниже.
          </p>
        </div>
        <p className="shrink-0 text-sm text-slate-500">
          В каталоге: <span className="font-semibold text-slate-800">{totalStores}</span>
        </p>
      </div>
    </section>
  );
}
