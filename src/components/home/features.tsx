import { features } from "@/lib/mock-data";
import { Container } from "@/components/ui/container";

export function Features() {
  return (
    <section id="features" className="py-8 sm:py-12">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Путь покупателя и продавца внутри одной платформы
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            Покупатель получает понятный выбор и storefront магазинов, продавец — инструменты роста без перехода в отдельные сервисы.
          </p>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-3">
          {features.slice(0, 3).map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-lg">
                {feature.icon}
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
