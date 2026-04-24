"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { DashboardProfileCard } from "@/components/dashboard/dashboard-profile-card";
import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards";
import { DashboardFilter, DashboardListing, DashboardListingStatus } from "@/components/dashboard/types";
import { MyListingsSection } from "@/components/dashboard/my-listings-section";
import { DEMO_STOREFRONT_SELLER_ID } from "@/lib/demo-role-constants";
import { sellerProfileMock, myListingsMock } from "@/lib/dashboard-mock-data";
import { isListingVisibleByFilter } from "@/lib/dashboard";

const defaultFilter: DashboardFilter = "all";

function updateStatus(
  listings: DashboardListing[],
  listingId: string,
  nextStatus: DashboardListingStatus,
) {
  return listings.map((listing) =>
    listing.id === listingId ? { ...listing, status: nextStatus } : listing,
  );
}

type DashboardPageClientProps = {
  /** Переход с витрины «Герой доски» — подсказка по сценарию продвижения. */
  fromSponsorBoard?: boolean;
  /** Явный сценарий «продвинуть героя» с витрины. */
  promoteHeroIntent?: boolean;
};

export function DashboardPageClient({
  fromSponsorBoard = false,
  promoteHeroIntent = false,
}: DashboardPageClientProps) {
  const [filter, setFilter] = useState<DashboardFilter>(defaultFilter);
  const [listings, setListings] = useState<DashboardListing[]>(myListingsMock);
  const [showSponsorBoardHint, setShowSponsorBoardHint] = useState(fromSponsorBoard || promoteHeroIntent);

  const counts = useMemo(
    () => ({
      all: listings.length,
      active: listings.filter((listing) => listing.status === "active").length,
      draft: listings.filter((listing) => listing.status === "draft").length,
      sold: listings.filter((listing) => listing.status === "sold").length,
      hidden: listings.filter((listing) => listing.status === "hidden").length,
    }),
    [listings],
  );

  const filteredListings = useMemo(
    () => listings.filter((listing) => isListingVisibleByFilter(listing.status, filter)),
    [listings, filter],
  );

  const views = useMemo(
    () => listings.reduce((accumulator, listing) => accumulator + listing.views, 0),
    [listings],
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      {showSponsorBoardHint ? (
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-semibold text-sky-950">Продвижение в формате «Герой доски»</p>
            {promoteHeroIntent ? (
              <>
                <p className="text-xs leading-relaxed text-sky-900/90">
                  Короткий путь для частного продавца (демо): сначала объявление, затем размещение в премиальном слоте
                  через магазин или напрямую из маркетинга.
                </p>
                <ol className="list-decimal space-y-1 pl-4 text-xs leading-relaxed text-sky-900/95">
                  <li>При необходимости подайте или обновите объявление.</li>
                  <li>Для hero-слота откройте кабинет магазина — там форма «Герой доски».</li>
                  <li>Активные размещения всегда видны на витрине /sponsor-board.</li>
                </ol>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <Link
                    href="/create-listing?world=all"
                    className="text-xs font-semibold text-sky-950 underline decoration-sky-300 underline-offset-2"
                  >
                    Подать объявление
                  </Link>
                  <Link
                    href={`/dashboard/store?sellerId=${DEMO_STOREFRONT_SELLER_ID}&section=hero-board&from=sponsor-board`}
                    className="text-xs font-semibold text-sky-950 underline decoration-sky-300 underline-offset-2"
                  >
                    Форма в кабинете магазина
                  </Link>
                  <Link href="/sponsor-board" className="text-xs font-semibold text-sky-950 underline decoration-sky-300 underline-offset-2">
                    Витрина «Герои в эфире»
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs leading-relaxed text-sky-900/90">
                  Вы открыли кабинет со страницы витрины размещений. Для магазина сценарий настраивается в маркетинге.
                </p>
                <Link
                  href={`/dashboard/store?sellerId=${DEMO_STOREFRONT_SELLER_ID}&section=hero-board&from=sponsor-board`}
                  className="inline-flex text-xs font-semibold text-sky-950 underline decoration-sky-300 underline-offset-2"
                >
                  Открыть форму размещения в кабинете магазина
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowSponsorBoardHint(false)}
            className="shrink-0 rounded-lg border border-sky-300 bg-white px-2.5 py-1 text-xs font-semibold text-sky-900 transition hover:bg-sky-100"
          >
            Скрыть
          </button>
        </div>
      ) : null}

      <DashboardSummaryCards
        total={counts.all}
        active={counts.active}
        sold={counts.sold}
        views={views}
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-slate-900">Сохранённые поиски</h2>
          <p className="text-sm text-slate-600">
            Возвращайтесь к фильтрам каталога в один клик и включайте уведомления о новых объявлениях.
          </p>
        </div>
        <Link
          href="/saved-searches"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Открыть
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="space-y-3">
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Мои объявления</h2>
              <p className="text-sm text-slate-600">
                Управляйте статусами, редактируйте карточки и отслеживайте активность.
              </p>
            </div>
            <DashboardFilters value={filter} onChange={setFilter} counts={counts} />
          </div>

          <MyListingsSection
            listings={filteredListings}
            filter={filter}
            onEdit={(id) => setListings((prev) => updateStatus(prev, id, "draft"))}
            onArchive={(id) => setListings((prev) => updateStatus(prev, id, "hidden"))}
            onMarkSold={(id) => setListings((prev) => updateStatus(prev, id, "sold"))}
            onDelete={(id) => setListings((prev) => prev.filter((listing) => listing.id !== id))}
          />
        </section>

        <div className="space-y-3">
          <DashboardProfileCard profile={sellerProfileMock} />
          <Link
            href="/profile"
            className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            Профиль и настройки
          </Link>
        </div>
      </div>
    </div>
  );
}
