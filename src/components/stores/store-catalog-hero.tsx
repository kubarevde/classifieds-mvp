type StoreCatalogHeroProps = {
  query: string;
  onQueryChange: (value: string) => void;
  totalStores: number;
};

export function StoreCatalogHero({ query, onQueryChange, totalStores }: StoreCatalogHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-[linear-gradient(140deg,#ffffff_0%,#f6f8fb_56%,#eef2f7_100%)] p-5 shadow-sm sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-slate-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-6 h-36 w-36 rounded-full bg-white/80 blur-2xl" />
      <div className="relative space-y-4">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Каталог магазинов</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Найдите магазин под вашу задачу</h1>
          <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
            Проверенные витрины продавцов и бизнесов в спокойном каталоге: фильтруйте по миру, рейтингу и городу.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Поиск по названию, специализации или городу"
            className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />
          <p className="text-sm text-slate-500">
            Магазинов в каталоге: <span className="font-semibold text-slate-800">{totalStores}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
