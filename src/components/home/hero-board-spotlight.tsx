import Link from "next/link";

import { HeroBoardPlacementCard } from "@/components/hero-board/hero-board-placement-card";
import { Container } from "@/components/ui/container";
import { HeroBoardPlacement } from "@/lib/sellers";

type HeroBoardSpotlightProps = {
  placement: HeroBoardPlacement | null;
};

export function HeroBoardSpotlight({ placement }: HeroBoardSpotlightProps) {
  if (!placement) {
    return null;
  }

  return (
    <section className="py-8 sm:py-12">
      <Container>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Герой доски</h2>
            <p className="mt-1 text-sm text-slate-600">
              Выделенное место на платформе с благотворительным компонентом.
            </p>
          </div>
          <Link
            href="/sponsor-board"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Как сюда попасть?
          </Link>
        </div>
        <HeroBoardPlacementCard placement={placement} />
      </Container>
    </section>
  );
}
