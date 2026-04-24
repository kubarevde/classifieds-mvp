"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useState } from "react";

import { HeroBoardPlacementCard } from "@/components/hero-board/hero-board-placement-card";
import { Container } from "@/components/ui/container";
import type { HeroBoardCharityStats, HeroBoardContributorRow, HeroBannerPlacement } from "@/lib/hero-board";
import { getWorldLabel } from "@/lib/listings";
import { getSellerTypeLabel, getStorefrontSellerById } from "@/lib/sellers";

type CoverageFilter = "all" | "global" | "world";

type SponsorBoardPageClientProps = {
  placements: HeroBannerPlacement[];
  topContributors: HeroBoardContributorRow[];
  charityStats: HeroBoardCharityStats;
};

const STORE_PLACEMENT_URL = "/dashboard/store?sellerId=marina-tech&marketing=hero_board&from=sponsor-board";
const USER_PROMOTE_FLOW = "/dashboard?from=sponsor-board&intent=promote-hero";
const CREATE_LISTING_ENTRY = "/create-listing?world=all";

export function SponsorBoardPageClient({ placements, topContributors, charityStats }: SponsorBoardPageClientProps) {
  const [coverage, setCoverage] = useState<CoverageFilter>("all");
  const [helpOpen, setHelpOpen] = useState(false);
  const helpTitleId = useId();

  const globalPlacements = useMemo(() => placements.filter((p) => p.scope === "global"), [placements]);
  const worldPlacements = useMemo(() => placements.filter((p) => p.scope === "world"), [placements]);

  const worldsWithLiveHero = useMemo(() => {
    const ids = new Set(
      worldPlacements.map((p) => p.worldId).filter((id): id is NonNullable<typeof id> => Boolean(id)),
    );
    return ids.size;
  }, [worldPlacements]);

  const contributorRows = useMemo(() => {
    return topContributors.map((row, index) => {
      const seller = getStorefrontSellerById(row.sellerId);
      const name = seller?.storefrontName ?? row.sellerId;
      const typeLabel = seller ? getSellerTypeLabel(seller.type) : "Продавец";
      const scopeTags = new Set<string>();
      placements.forEach((p) => {
        if (!p.isActive || p.sellerId !== row.sellerId) {
          return;
        }
        if (p.scope === "global") {
          scopeTags.add("Портал");
        }
        if (p.scope === "world" && p.worldId) {
          scopeTags.add(getWorldLabel(p.worldId));
        }
      });
      return {
        rank: index + 1,
        sellerId: row.sellerId,
        name,
        typeLabel,
        charityRub: row.charityRub,
        href: `/sellers/${row.sellerId}`,
        tags: [...scopeTags].slice(0, 2),
      };
    });
  }, [placements, topContributors]);

  const closeHelp = useCallback(() => setHelpOpen(false), []);

  useEffect(() => {
    if (!helpOpen) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeHelp();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [helpOpen, closeHelp]);

  const showPortalBlock = coverage === "all" || coverage === "global";
  const showWorldBlock = coverage === "all" || coverage === "world";

  return (
    <main className="py-3 sm:py-5">
      <Container className="space-y-3 sm:space-y-4">
        {/* Hero */}
        <section className="rounded-2xl border border-slate-200/90 bg-white px-3 py-3 shadow-sm sm:px-4 sm:py-3.5">
          <div className="flex flex-wrap items-start justify-between gap-2.5">
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Classify · Герой доски
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">Герои в эфире</h1>
                <button
                  type="button"
                  onClick={() => setHelpOpen(true)}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-white hover:text-slate-900"
                  aria-label="Справка: витрина и показ в мирах"
                  title="Справка"
                >
                  <HelpCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>
              <p className="max-w-xl text-xs leading-snug text-slate-600 sm:text-sm">
                Живая витрина премиальных слотов: всё, что сейчас куплено и показывается в формате героя доски.
              </p>
              <p className="text-[11px] font-medium tabular-nums text-slate-500">
                {placements.length} в эфире
                <span className="mx-1.5 text-slate-300">·</span>
                {globalPlacements.length} на портале
                <span className="mx-1.5 text-slate-300">·</span>
                {worldPlacements.length} в мирах
                {worldsWithLiveHero > 0 ? (
                  <>
                    <span className="mx-1.5 text-slate-300">·</span>
                    {worldsWithLiveHero} {worldsWithLiveHero === 1 ? "мир" : "миров"}
                  </>
                ) : null}
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-wrap gap-1.5 sm:w-auto sm:justify-end">
              <Link
                href={STORE_PLACEMENT_URL}
                className="inline-flex h-8 items-center justify-center rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-800 sm:text-sm"
              >
                Подать как магазин
              </Link>
              <Link
                href={USER_PROMOTE_FLOW}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 transition hover:bg-slate-50 sm:text-sm"
              >
                Продвинуть как пользователь
              </Link>
            </div>
          </div>
        </section>

        {/* TOP-5 — компактный leaderboard */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/90 to-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-3 py-2 sm:px-3.5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">ТОП‑5 благотворителей</h2>
            <span className="text-[10px] text-slate-500">демо · 20%</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {contributorRows.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-slate-600">Нет активных размещений.</li>
            ) : (
              contributorRows.map((row) => (
                <li key={row.sellerId}>
                  <Link
                    href={row.href}
                    className="group flex items-center gap-2.5 px-2.5 py-2 transition hover:bg-slate-50/90 sm:px-3 sm:py-2"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-900 text-[11px] font-bold text-white">
                      {row.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-900 group-hover:text-slate-950 sm:text-sm">
                        {row.name}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
                        <span className="rounded bg-slate-100 px-1 py-0.5 font-medium text-slate-600">{row.typeLabel}</span>
                        {row.tags.map((tag) => (
                          <span key={tag} className="rounded bg-emerald-50/90 px-1 py-0.5 font-medium text-emerald-900">
                            {tag}
                          </span>
                        ))}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-emerald-800 sm:text-sm">
                      {row.charityRub.toLocaleString("ru-RU")} ₽
                    </span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Inventory */}
        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-2 border-b border-slate-100 pb-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">Инвентарь слотов</h2>
              <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
                Сначала охват всего портала, затем миры. Фильтр не скрывает логику — только сужает список.
              </p>
            </div>
            <div className="inline-flex shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              {(
                [
                  { id: "all" as const, label: "Все" },
                  { id: "global" as const, label: "Портал" },
                  { id: "world" as const, label: "Миры" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCoverage(tab.id)}
                  className={`rounded-md px-2 py-1 text-[11px] font-semibold sm:px-2.5 sm:text-xs ${
                    coverage === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 space-y-5">
            {showPortalBlock ? (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b8956a]" aria-hidden />
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5c4a38]">
                    Весь портал
                  </h3>
                </div>
                {globalPlacements.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-[#d8c4a8]/60 bg-[#fdfbf7]/50 px-3 py-4 text-center text-xs text-[#5c4a38]/90">
                    Нет активных глобальных слотов.
                  </p>
                ) : (
                  <div className="grid gap-2.5 md:grid-cols-2">
                    {globalPlacements.map((placement) => (
                      <HeroBoardPlacementCard
                        key={placement.id}
                        placement={placement}
                        compact={false}
                        inventory
                        visualTier="portal"
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {showWorldBlock ? (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" aria-hidden />
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                    Тематические миры
                  </h3>
                </div>
                {worldPlacements.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-3 py-4 text-center text-xs text-slate-600">
                    Нет активных слотов в мирах.
                  </p>
                ) : (
                  <div className="grid gap-2 md:grid-cols-2">
                    {worldPlacements.map((placement) => (
                      <HeroBoardPlacementCard
                        key={placement.id}
                        placement={placement}
                        compact
                        inventory
                        visualTier="world"
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </section>

        {/* Подача */}
        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <h2 className="text-sm font-semibold text-slate-900">Подача размещения</h2>
          <p className="mt-1 text-[11px] text-slate-600 sm:text-xs">
            Магазин — зона «Маркетинг и продвижение» в кабинете. Пользователь — объявление, затем сценарий продвижения.
          </p>
          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            <Link
              href={STORE_PLACEMENT_URL}
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 transition hover:border-slate-300 hover:bg-white"
            >
              <p className="text-xs font-semibold text-slate-900 sm:text-sm">Магазин</p>
              <p className="mt-1 text-[11px] leading-snug text-slate-600">
                Откроется маркетинг → «Герой доски» с подсказкой, что вы из этой витрины.
              </p>
            </Link>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5">
              <p className="text-xs font-semibold text-slate-900 sm:text-sm">Частный продавец</p>
              <p className="mt-1 text-[11px] leading-snug text-slate-600">
                Сначала карточка объявления, затем переход в сценарий продвижения из кабинета.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href={CREATE_LISTING_ENTRY}
                  className="inline-flex text-[11px] font-semibold text-slate-800 underline decoration-slate-300 underline-offset-2"
                >
                  Новое объявление
                </Link>
                <Link
                  href={USER_PROMOTE_FLOW}
                  className="inline-flex text-[11px] font-semibold text-slate-800 underline decoration-slate-300 underline-offset-2"
                >
                  Сценарий продвижения
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="flex flex-col justify-between gap-2.5 rounded-2xl border border-slate-900/10 bg-slate-900 px-3 py-3 text-slate-100 sm:flex-row sm:items-center sm:px-4">
          <p className="text-xs text-slate-300 sm:text-sm">
            <span className="font-semibold text-white">Демо.</span> Mock-благотворительность:{" "}
            {charityStats.charityAmount.toLocaleString("ru-RU")} ₽ из {charityStats.totalAmount.toLocaleString("ru-RU")} ₽
            по слотам данных.
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Link
              href={STORE_PLACEMENT_URL}
              className="inline-flex h-8 items-center justify-center rounded-lg bg-white px-3 text-xs font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Магазин
            </Link>
            <Link
              href="/listings"
              className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-600 px-3 text-xs font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              Каталог
            </Link>
          </div>
        </section>
      </Container>

      {helpOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]"
            aria-label="Закрыть справку"
            onClick={closeHelp}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={helpTitleId}
            className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[85vh] sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
              <h2 id={helpTitleId} className="pr-6 text-base font-semibold text-slate-900">
                Справка: Герой доски
              </h2>
              <button
                type="button"
                onClick={closeHelp}
                className="shrink-0 rounded-lg border border-transparent px-2 py-1 text-sm font-medium text-slate-500 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800"
              >
                Закрыть
              </button>
            </div>
            <div className="overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
              <div className="space-y-5 text-sm leading-relaxed text-slate-700">
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Витрина</h3>
                  <p className="mt-1">
                    На этой странице показаны <strong>все активные</strong> hero-размещения формата — открытый инвентарь
                    площадки.
                  </p>
                </section>
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Миры и ротация</h3>
                  <p className="mt-1">
                    В каталоге тематического мира отображается <strong>один</strong> hero-слот на страницу. Если
                    кампаний несколько, они <strong>ротируются</strong> между сессиями и показами (в демо — от сессии
                    браузера). Так лента не перегружается, а показ остаётся ценным.
                  </p>
                </section>
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Подача</h3>
                  <p className="mt-1">
                    Магазин: кабинет → маркетинг → «Герой доски». Пользователь: объявление в кабинете / подача, затем
                    сценарий продвижения по подсказкам из кабинета.
                  </p>
                </section>
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Демо</h3>
                  <p className="mt-1 text-xs text-slate-600">Платежи и переводы не выполняются — mock-данные и UI.</p>
                </section>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
