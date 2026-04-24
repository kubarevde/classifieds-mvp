import Link from "next/link";
import { createElement } from "react";

import { Container } from "@/components/ui/container";
import { catalogWorldLucideIcons } from "@/config/icons";
import { getWorldPresentation } from "@/lib/worlds";

const worldCards = [
  getWorldPresentation("electronics"),
  getWorldPresentation("autos"),
  getWorldPresentation("agriculture"),
  getWorldPresentation("real_estate"),
  getWorldPresentation("jobs"),
  getWorldPresentation("services"),
];

export function WorldsEntry() {
  return (
    <section id="worlds" className="py-8 sm:py-12">
      <Container>
        <div className="mb-5">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Миры как режимы платформы</h2>
          <p className="mt-1 text-sm text-slate-600">
            Мир — верхний тематический режим, а категории внутри мира уточняют конкретный тип объявления.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {worldCards.map((world) => {
            const worldCardIcon = catalogWorldLucideIcons[world.world];
            return (
            <article
              key={world.world}
              className={`relative overflow-hidden rounded-3xl border p-5 shadow-sm ${world.homeCardToneClass}`}
            >
              <div className={`pointer-events-none absolute inset-0 ${world.heroDecorClass}`} />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className={`text-sm font-semibold ${world.homeCardAccentClass}`}>
                    <span className="mr-1 inline-flex shrink-0 align-middle" aria-hidden>
                      {createElement(worldCardIcon, { className: "h-4 w-4", strokeWidth: 1.5 })}
                    </span>
                    {world.title}
                  </p>
                  <p className={`mt-2 text-sm ${world.world === "electronics" ? "text-slate-100/90" : "text-slate-600"}`}>
                    {world.heroDescription}
                  </p>
                </div>
                <span className="rounded-full border border-white/40 bg-white/80 px-2.5 py-1 text-xs text-slate-500">Мир</span>
              </div>
              <div className="relative mt-3 flex flex-wrap gap-1.5">
                {world.homeCardHints.map((hint) => (
                  <span
                    key={hint}
                    className={`rounded-full border px-2.5 py-1 text-xs ${
                      world.world === "electronics"
                        ? "border-white/30 bg-white/10 text-slate-100"
                        : "border-white bg-white/80 text-slate-600"
                    }`}
                  >
                    {hint}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/listings?world=${world.world}`}
                  className="rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Перейти в мир {world.title.toLowerCase()}
                </Link>
                <Link
                  href={`/create-listing?world=${world.world}`}
                  className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Разместить объявление в мире
                </Link>
              </div>
            </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
