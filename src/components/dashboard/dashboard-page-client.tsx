"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useBuyer } from "@/components/buyer/buyer-provider";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { DashboardProfileCard } from "@/components/dashboard/dashboard-profile-card";
import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards";
import { DashboardFilter } from "@/components/dashboard/types";
import { useDemoRole } from "@/components/demo-role/demo-role";
import { MessagesSplitView } from "@/components/messages/messages-split-view";
import { MyListingsSection } from "@/components/dashboard/my-listings-section";
import { MyRequestsSection } from "@/components/dashboard/my-requests-section";
import { DEMO_STOREFRONT_SELLER_ID } from "@/lib/demo-role-constants";
import { DEMO_BUYER_USER_ID } from "@/lib/messages-actors";
import { resolveActorIdsForRole } from "@/lib/messages-actors";
import { isListingVisibleByFilter } from "@/lib/dashboard";
import { Card, buttonVariants, cn } from "@/components/ui";
import type { BuyerRequest } from "@/entities/requests/model";
import { mockBuyerRequestsService } from "@/services/requests";
import { REQUESTS_NEW_PATH } from "@/services/requests/intent-adapter";
import { getUserAppeals, getUserEnforcementActions } from "@/services/enforcement";
import { messagesService, type MessageThread } from "@/services/messages";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role, currentSellerId } = useDemoRole();
  const [filter, setFilter] = useState<DashboardFilter>(defaultFilter);
  const publicationType: "sale" | "purchase" = searchParams.get("publication") === "purchase" ? "purchase" : "sale";
  const [showSponsorBoardHint, setShowSponsorBoardHint] = useState(fromSponsorBoard || promoteHeroIntent);
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>([]);
  const [latestThreads, setLatestThreads] = useState<MessageThread[]>([]);
  const actorIds = useMemo(() => resolveActorIdsForRole(role, currentSellerId), [role, currentSellerId]);
  const listings = buyer.myListings;
  const currentBuyerId = "buyer-dmitriy";
  const section = searchParams.get("section");
  const selectedThreadId = searchParams.get("thread");

  const enforcementCounts = useMemo(() => {
    const actions = getUserEnforcementActions(currentBuyerId);
    const activeActionsCount = actions.filter((a) => a.status === "active").length;
    const appealsCount = getUserAppeals(currentBuyerId).length;
    return { activeActionsCount, appealsCount };
  }, [currentBuyerId]);

  useEffect(() => {
    void mockBuyerRequestsService.getBuyerRequests({ authorId: currentBuyerId }).then((rows) => {
      setBuyerRequests(rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });
    void messagesService.getMyThreads(DEMO_BUYER_USER_ID).then((rows) => {
      setLatestThreads(rows.slice(0, 3));
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

  if (section === "messages") {
    return (
      <div className="space-y-4 sm:space-y-5">
        <Link href="/dashboard" className="inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-900">
          ← Назад в кабинет
        </Link>
        <MessagesSplitView
          actorIds={actorIds.length > 0 ? actorIds : [DEMO_BUYER_USER_ID]}
          title="Сообщения"
          subtitle="Общайтесь с продавцами по объявлениям, запросам и заказам."
          fullscreenHref="/messages?from=dashboard"
          backHref="/dashboard"
          backLabel="Назад в кабинет"
          selectedThreadId={selectedThreadId}
          onSelectedThreadChange={(threadId) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("section", "messages");
            if (threadId) params.set("thread", threadId);
            else params.delete("thread");
            router.replace(`/dashboard?${params.toString()}`);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {showSponsorBoardHint ? (
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-none">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-semibold text-slate-900">Продвижение в формате «Герой доски»</p>
            {promoteHeroIntent ? (
              <>
                <p className="text-sm leading-relaxed text-slate-600">
                  Короткий путь для частного продавца (демо): сначала объявление, затем размещение в премиальном слоте
                  через магазин или напрямую из маркетинга.
                </p>
                <ol className="list-decimal space-y-1 pl-4 text-sm leading-relaxed text-slate-600">
                  <li>При необходимости подайте или обновите объявление.</li>
                  <li>Для hero-слота откройте кабинет магазина — там форма «Герой доски».</li>
                  <li>Активные размещения всегда видны на странице /sponsor-board.</li>
                </ol>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-3 sm:gap-y-2">
                  <Link href="/create-listing?world=all" className={cn(buttonVariants({ variant: "secondary", size: "md" }), "justify-center rounded-xl")}>
                    Подать объявление
                  </Link>
                  <Link
                    href={`/dashboard/store?sellerId=${DEMO_STOREFRONT_SELLER_ID}&section=hero-board&from=sponsor-board`}
                    className={cn(buttonVariants({ variant: "secondary", size: "md" }), "justify-center rounded-xl")}
                  >
                    Форма в кабинете магазина
                  </Link>
                  <Link href="/sponsor-board" className={cn(buttonVariants({ variant: "secondary", size: "md" }), "justify-center rounded-xl")}>
                    Витрина «Герои в эфире»
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm leading-relaxed text-slate-600">
                  Вы открыли кабинет со страницы размещений. Для магазина сценарий настраивается в маркетинге.
                </p>
                <Link
                  href={`/dashboard/store?sellerId=${DEMO_STOREFRONT_SELLER_ID}&section=hero-board&from=sponsor-board`}
                  className={cn(buttonVariants({ variant: "secondary", size: "md" }), "inline-flex justify-center rounded-xl")}
                >
                  Открыть форму размещения в кабинете магазина
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowSponsorBoardHint(false)}
            className={cn(buttonVariants({ variant: "secondary", size: "md" }), "shrink-0 justify-center rounded-xl")}
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
        <div className="min-w-0 space-y-1">
          <h2 className="text-sm font-semibold text-slate-900">Ограничения и проверки</h2>
          <p className="text-sm text-slate-600">Ваши активные решения и обращения на пересмотр.</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700">
              Активных действий: {enforcementCounts.activeActionsCount}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700">
              Обращений: {enforcementCounts.appealsCount}
            </span>
          </div>
        </div>
        <Link href="/enforcement" className={cn(buttonVariants({ variant: "primary", size: "md" }), "justify-center")}>
          Открыть центр
        </Link>
      </Card>

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

      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900">Сообщения</h2>
            <p className="text-sm text-slate-600">Последние диалоги по объявлениям и запросам.</p>
          </div>
          <Link href="/messages?from=dashboard" className={buttonVariants({ variant: "secondary", size: "md" })}>
            Все сообщения
          </Link>
        </div>
        {latestThreads.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Диалогов пока нет.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {latestThreads.map((thread) => (
              <li key={thread.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <Link href={`/messages/${encodeURIComponent(thread.id)}`} className="line-clamp-1 text-sm font-semibold text-slate-900 hover:underline">
                  {thread.lastMessage}
                </Link>
                <p className="text-xs text-slate-500">{new Date(thread.lastMessageAt).toLocaleString("ru-RU")}</p>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-500">Полная история переписки доступна в режиме split‑view и на странице «Сообщения».</p>
          <Link href="/dashboard?section=messages" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Открыть в кабинете
          </Link>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="space-y-3">
          <Card className="space-y-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">Мои публикации</h2>
                <p className="text-sm text-slate-600">
                  Выберите сценарий: разместить объявление или запрос, чтобы получить отклики.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <Link href="/create-listing" className={buttonVariants({ variant: "primary" })}>
                  Разместить объявление
                </Link>
                <Link
                  href={REQUESTS_NEW_PATH}
                  className={buttonVariants({ variant: "outline", className: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100" })}
                >
                  Создать запрос
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
                    onClick={() => {
                      const next = item.id === "purchase" ? "purchase" : "sale";
                      const params = new URLSearchParams(searchParams.toString());
                      params.set("tab", "listings");
                      if (next === "purchase") {
                        params.set("publication", "purchase");
                      } else {
                        params.delete("publication");
                      }
                      const qs = params.toString();
                      router.replace(qs ? `/dashboard?${qs}` : "/dashboard");
                    }}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
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
