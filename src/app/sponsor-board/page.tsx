import Link from "next/link";

import { HeroBoardPlacementCard } from "@/components/hero-board/hero-board-placement-card";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";
import { getCurrentHeroBoardPlacement, getHeroBoardPlacementForWorld } from "@/lib/sellers";

export default function SponsorBoardPage() {
  const globalPlacement = getCurrentHeroBoardPlacement();
  const agriculturePlacement = getHeroBoardPlacementForWorld("agriculture");

  return (
    <div className="min-h-screen bg-slate-50/70">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="space-y-4 sm:space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Новый маркетинговый продукт</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Герой доски + благотворительность
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
              Выделенное место на общей доске: для магазинов, бизнеса и частных продавцов. Часть суммы (20%) отмечается как
              благотворительное отчисление.
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
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Как это работает</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {[
                "1. Выбираете магазин или конкретное объявление.",
                "2. Выбираете охват: вся платформа или конкретный мир.",
                "3. Выбираете период: день, неделя или месяц.",
                "4. Получаете выделенное место, а 20% суммы уходит на благотворительность (mock).",
              ].map((step) => (
                <p key={step} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {step}
                </p>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Как это выглядит</h2>
            <p className="mt-1 text-sm text-slate-600">Один и тот же формат, но разный охват: вся платформа или конкретный мир.</p>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {globalPlacement ? <HeroBoardPlacementCard placement={globalPlacement} /> : null}
              {agriculturePlacement ? <HeroBoardPlacementCard placement={agriculturePlacement} compact /> : null}
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}
