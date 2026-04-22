import Link from "next/link";

import { HeroBoardPlacementCard } from "@/components/hero-board/hero-board-placement-card";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";
import { getActiveHeroBanner, getActiveHeroBannerForWorld, heroBoardCharityStats } from "@/lib/hero-board";

export default function SponsorBoardPage() {
  const globalPlacement = getActiveHeroBanner();
  const agriculturePlacement = getActiveHeroBannerForWorld("agriculture");
  const electronicsPlacement = getActiveHeroBannerForWorld("electronics");

  return (
    <div className="min-h-screen bg-slate-50/70">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="space-y-4 sm:space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Новый рекламный формат</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Рекламная доска платформы
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
              Герой доски — это отдельный баннерный слот в духе рекламной стены: глобально на платформе или в конкретном
              мире. 20% условной стоимости размещения отмечаются как благотворительное отчисление в рамках демо-механики.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/dashboard/store?sellerId=marina-tech&marketing=hero_board"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Стать героем доски
              </Link>
              <Link
                href="/listings"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Смотреть каталог
              </Link>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Условно на благотворительность отправлено{" "}
              <span className="font-semibold text-slate-800">
                {heroBoardCharityStats.charityAmount.toLocaleString("ru-RU")} ₽
              </span>{" "}
              (20% от {heroBoardCharityStats.totalAmount.toLocaleString("ru-RU")} ₽, слотов: {heroBoardCharityStats.totalSlots}).
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Как это работает</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {[
                "1. Выбираете формат: глобальный герой платформы или герой конкретного мира.",
                "2. Настраиваете баннер: заголовок, текст, изображение и ссылку.",
                "3. Выбираете период: день, неделя или месяц.",
                "4. Баннер появляется на главной или в выбранном мире.",
                "5. 20% условной стоимости учитываются как благотворительная часть (демо).",
              ].map((step) => (
                <p key={step} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {step}
                </p>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              В этом MVP нет реальных платежей и переводов: это концептуальный mock-слой.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Примеры размещения</h2>
            <p className="mt-1 text-sm text-slate-600">
              Один формат баннера, два сценария показа: глобальный слот на главной и слот внутри тематического мира.
            </p>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              {globalPlacement ? <HeroBoardPlacementCard placement={globalPlacement} /> : null}
              {agriculturePlacement ? <HeroBoardPlacementCard placement={agriculturePlacement} compact /> : null}
              {electronicsPlacement ? <HeroBoardPlacementCard placement={electronicsPlacement} compact /> : null}
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}
