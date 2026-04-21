import { categories } from "@/lib/mock-data";
import { Container } from "@/components/ui/container";

export function CategoriesGrid() {
  return (
    <section id="categories" className="py-8 sm:py-12">
      <Container>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Популярные категории
            </h2>
            <p className="mt-1 text-sm text-slate-600">Часто используемые направления платформы</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <article
              key={category.id}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-xl transition group-hover:bg-slate-900 group-hover:text-white">
                  {category.icon}
                </div>
                <span className="text-xs font-medium text-slate-400">→</span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{category.label}</h3>
              <p className="mt-1 min-h-10 text-sm text-slate-600">{category.caption}</p>
              <p className="mt-3 text-xs font-medium text-slate-500">{category.listingCount}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
