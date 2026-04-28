"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useBuyer } from "@/components/buyer/buyer-provider";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { DashboardProfileCard } from "@/components/dashboard/dashboard-profile-card";
import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards";
import { DashboardFilter } from "@/components/dashboard/types";
import { MyListingsSection } from "@/components/dashboard/my-listings-section";
import { MyRequestsSection } from "@/components/dashboard/my-requests-section";
import { DEMO_STOREFRONT_SELLER_ID } from "@/lib/demo-role-constants";
import { isListingVisibleByFilter } from "@/lib/dashboard";
import { Card, buttonVariants } from "@/components/ui";
import type { BuyerRequest } from "@/entities/requests/model";
import { mockBuyerRequestsService } from "@/services/requests";

const defaultFilter: DashboardFilter = "all";

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
  const buyer = useBuyer();
  const [filter, setFilter] = useState<DashboardFilter>(defaultFilter);
  const [publicationType, setPublicationType] = useState<"sale" | "purchase">("sale");
  const [showSponsorBoardHint, setShowSponsorBoardHint] = useState(fromSponsorBoard || promoteHeroIntent);
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>([]);
  const listings = buyer.myListings;
  const currentBuyerId = "buyer-dmitriy";

  useEffect(() => {
    void mockBuyerRequestsService.getBuyerRequests({ authorId: currentBuyerId }).then((rows) => {
      setBuyerRequests(rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });
  }, []);

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
  const publicationCounts = useMemo(
    () => ({
      sale: listings.length,
      purchase: buyerRequests.length,
    }),
    [listings.length, buyerRequests.length],
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

      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-slate-900">Сохранённые поиски</h2>
          <p className="text-sm text-slate-600">
            Возвращайтесь к фильтрам каталога в один клик и включайте уведомления о новых объявлениях.
          </p>
        </div>
        <Link href="/dashboard?tab=saved-searches" className={buttonVariants({ variant: "primary" })}>
          Открыть
        </Link>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="space-y-3">
          <Card className="space-y-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">Мои публикации</h2>
                <p className="text-sm text-slate-600">
                  Выберите сценарий: опубликовать объявление о продаже или разместить запрос о покупке, чтобы получить предложения.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <Link href="/create-listing" className={buttonVariants({ variant: "primary" })}>
                  Разместить объявление о продаже
                </Link>
                <Link
                  href="/requests/new"
                  className={buttonVariants({ variant: "outline", className: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100" })}
                >
                  Разместить запрос о покупке
                </Link>
              </div>
            </div>
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50/80 p-1">
              {(
                [
                  { id: "sale", label: "О продаже" },
                  { id: "purchase", label: "О покупке" },
                ] as const
              ).map((item) => {
                const active = publicationType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPublicationType(item.id)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      active ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {publicationCounts[item.id]}
                    </span>
                  </button>
                );
              })}
            </div>
            {publicationType === "sale" ? (
              <DashboardFilters value={filter} onChange={setFilter} counts={counts} />
            ) : null}
          </Card>

          {publicationType === "sale" ? (
            <MyListingsSection
              listings={filteredListings}
              filter={filter}
              onEdit={(id) => buyer.updateListingStatus(id, "draft")}
              onArchive={(id) => buyer.updateListingStatus(id, "hidden")}
              onMarkSold={(id) => buyer.updateListingStatus(id, "sold")}
              onDelete={buyer.removeListing}
            />
          ) : (
            <MyRequestsSection
              requests={buyerRequests}
              onMarkFulfilled={async (id) => {
                const updated = await mockBuyerRequestsService.updateBuyerRequestStatus(id, "fulfilled");
                if (!updated) return;
                setBuyerRequests((prev) => prev.map((item) => (item.id === id ? updated : item)));
              }}
              onCancel={async (id) => {
                const updated = await mockBuyerRequestsService.updateBuyerRequestStatus(id, "cancelled");
                if (!updated) return;
                setBuyerRequests((prev) => prev.map((item) => (item.id === id ? updated : item)));
              }}
            />
          )}
        </section>

        <div className="space-y-3">
          <DashboardProfileCard
            profile={{
              name: buyer.profile.name,
              city: buyer.profile.city,
              avatarInitials: buyer.profile.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase(),
              phone: buyer.profile.phone,
              memberSince: "участник сообщества",
            }}
          />
          <Link href="/dashboard?tab=profile" className={`${buttonVariants({ variant: "outline" })} w-full`}>
            Мой профиль
          </Link>
        </div>
      </div>
    </div>
  );
}
