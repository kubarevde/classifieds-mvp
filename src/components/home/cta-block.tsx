import Link from "next/link";

import { Container } from "@/components/ui/container";

export function CtaBlock() {
  return (
    <section className="py-8 sm:py-12">
      <Container>
        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-7 sm:p-10">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
                Для продавцов и покупателей
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Разместите объявление сегодня, получите отклики уже завтра
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Создание карточки занимает пару минут: фото, описание и цена. Дальше
                алгоритм подбирает релевантную аудиторию внутри платформы.
              </p>
              <p className="mt-4 text-xs font-medium text-slate-400">
                Более 12 000 активных продавцов ежемесячно
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 md:w-auto">
              <Link
                href="/create-listing"
                className="rounded-xl bg-white px-6 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Разместить объявление
              </Link>
              <Link
                href="/listings"
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Посмотреть примеры
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 border-t border-white/10 pt-5 text-xs text-slate-300 sm:grid-cols-3 sm:text-sm">
            <p>Модерация карточек перед публикацией</p>
            <p>Понятные профили продавцов и отзывы</p>
            <p>Быстрый старт без сложной настройки</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
