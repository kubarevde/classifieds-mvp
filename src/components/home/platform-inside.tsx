import { Container } from "@/components/ui/container";

const platformCapabilities = [
  {
    id: "worlds",
    title: "Миры под ваши задачи",
    description:
      "Электроника, автомобили, агро, недвижимость, работа и услуги работают как отдельные режимы внутри одного продукта.",
  },
  {
    id: "stores",
    title: "Магазины и mini‑витрины",
    description: "У продавцов есть storefront с лентой публикаций, акциями и выделенными объявлениями.",
  },
  {
    id: "pro",
    title: "Pro‑кабинет и продвижение",
    description: "Купоны, аналитика цен, кампании, поднятия и суперобъявления в одной панели управления.",
  },
  {
    id: "media",
    title: "Медиа и лента магазинов",
    description: "Контент магазина, подписчики и будущие видео‑форматы помогают строить аудиторию вокруг витрины.",
  },
];

export function PlatformInside() {
  return (
    <section className="py-8 sm:py-12">
      <Container>
        <div className="mb-5">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Что внутри платформы</h2>
          <p className="mt-1 text-sm text-slate-600">
            Продукт уже глубже классической доски объявлений и объединяет каталоги, магазины и инструменты роста.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {platformCapabilities.map((capability) => (
            <article key={capability.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">{capability.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{capability.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
