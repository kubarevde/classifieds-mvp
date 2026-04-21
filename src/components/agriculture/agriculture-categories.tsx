import { agricultureCategories } from "@/lib/agriculture";

export function AgricultureCategories() {
  return (
    <section className="space-y-4 rounded-3xl border border-emerald-200/70 bg-white/80 p-4 shadow-sm shadow-emerald-900/5 backdrop-blur sm:p-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-emerald-950 sm:text-2xl">
          Категории раздела
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Отдельный контур для агро-объявлений: продукция, техника, земля и действующий бизнес.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {agricultureCategories.map((category) => (
          <article
            key={category.id}
            className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/50 p-4"
          >
            <h3 className="text-base font-semibold text-emerald-950">{category.label}</h3>
            <p className="mt-1 text-sm text-stone-600">{category.description}</p>
            {category.children?.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {category.children.map((subCategory) => (
                  <span
                    key={subCategory}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-900"
                  >
                    {subCategory}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
