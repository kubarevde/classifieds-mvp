"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useDemoRole } from "@/components/demo-role/demo-role";
import { RequestCard } from "@/components/requests/RequestCard";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/components/ui/cn";
import { buttonVariants } from "@/lib/button-styles";
import type { BuyerRequest } from "@/entities/requests/model";
import { REQUESTS_NEW_PATH } from "@/services/requests/intent-adapter";
import { mockBuyerRequestsService } from "@/services/requests";
import type { RequestMatchResult } from "@/services/requests/matching";

type RequestsBoardClientProps = {
  initialRequests: BuyerRequest[];
};

type BoardTab = "all" | "seller" | "mine";

export function RequestsBoardClient({ initialRequests: requests }: RequestsBoardClientProps) {
  const { role, currentSellerId } = useDemoRole();
  const [tab, setTab] = useState<BoardTab>("all");
  const [worldFilter, setWorldFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | BuyerRequest["urgency"]>("all");
  const [budgetFilter, setBudgetFilter] = useState<"all" | "under_100k" | "100_500" | "500_plus">("all");
  const [sellerMatchedIds, setSellerMatchedIds] = useState<string[]>([]);
  const [sellerMatches, setSellerMatches] = useState<Record<string, RequestMatchResult>>({});

  useEffect(() => {
    if (!currentSellerId) {
      return;
    }
    void mockBuyerRequestsService.getMatchingRequestsForSeller(currentSellerId).then((rows) => {
      setSellerMatchedIds(rows.map((row) => row.id));
    });
    void mockBuyerRequestsService.getMatchingRequestsForSellerDetailed(currentSellerId).then((rows) => {
      setSellerMatches(
        rows.reduce<Record<string, RequestMatchResult>>((acc, row) => {
          acc[row.request.id] = row;
          return acc;
        }, {}),
      );
    });
  }, [currentSellerId]);

  const visibleRequests = useMemo(() => {
    const filtered = requests.filter((request) => {
      if (tab === "mine" && request.authorId !== "buyer-dmitriy") return false;
      if (tab === "seller" && role !== "seller" && role !== "all") return false;
      if (tab === "seller" && sellerMatchedIds.length > 0 && !sellerMatchedIds.includes(request.id)) return false;
      if (tab !== "mine" && request.status !== "active") return false;
      if (worldFilter !== "all" && request.worldId !== worldFilter) return false;
      if (locationFilter !== "all" && request.location !== locationFilter) return false;
      if (urgencyFilter !== "all" && request.urgency !== urgencyFilter) return false;
      if (budgetFilter !== "all") {
        const top = request.budget.max ?? request.budget.min ?? 0;
        if (budgetFilter === "under_100k" && top > 100000) return false;
        if (budgetFilter === "100_500" && (top < 100000 || top > 500000)) return false;
        if (budgetFilter === "500_plus" && top < 500000) return false;
      }
      return true;
    });
    if (tab === "seller") {
      return filtered.sort((a, b) => (sellerMatches[b.id]?.matchScore ?? 0) - (sellerMatches[a.id]?.matchScore ?? 0));
    }
    return filtered;
  }, [requests, tab, role, worldFilter, locationFilter, urgencyFilter, budgetFilter, sellerMatchedIds, sellerMatches]);

  const roleForCard: "buyer" | "seller" | "neutral" =
    role === "seller" ? "seller" : role === "buyer" ? "buyer" : "neutral";
  const locations = Array.from(new Set(requests.map((item) => item.location)));
  const worlds = Array.from(new Set(requests.map((item) => item.worldId).filter(Boolean))) as string[];

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-none sm:p-5">
        <SectionHeader
          title="Доска запросов"
          description="Просматривайте спрос покупателей и откликайтесь с объявлениями. Новый запрос оформляется на отдельной странице — с тем же prefill, что и из поиска."
        />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "all", label: "Все запросы" },
                { id: "seller", label: "Для продавцов" },
                { id: "mine", label: "Мои запросы" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "min-h-11 rounded-full border px-3 py-2 text-sm font-semibold transition",
                  tab === item.id
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <Link
            href={REQUESTS_NEW_PATH}
            className={cn(buttonVariants({ variant: "primary", size: "md" }), "w-full shrink-0 justify-center sm:w-auto")}
          >
            Создать запрос
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-none">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <select value={worldFilter} onChange={(e) => setWorldFilter(e.target.value)} className="h-11 min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm">
            <option value="all">Все миры</option>
            {worlds.map((world) => (
              <option key={world} value={world}>
                {world}
              </option>
            ))}
          </select>
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="h-11 min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm">
            <option value="all">Любой город</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value as typeof urgencyFilter)} className="h-11 min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm">
            <option value="all">Любая срочность</option>
            <option value="today">Сегодня</option>
            <option value="this_week">На неделе</option>
            <option value="flexible">Гибко</option>
          </select>
          <select value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value as typeof budgetFilter)} className="h-11 min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm">
            <option value="all">Любой бюджет</option>
            <option value="under_100k">До 100k</option>
            <option value="100_500">100k - 500k</option>
            <option value="500_plus">500k+</option>
          </select>
          <Link
            href={currentSellerId ? `/dashboard/store?sellerId=${currentSellerId}` : "/dashboard/store"}
            className={cn(
              buttonVariants({ variant: "secondary", size: "md" }),
              "w-full justify-center sm:w-auto",
            )}
          >
            В кабинет магазина
          </Link>
        </div>
      </section>

      <section className="grid gap-3">
        {visibleRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300/90 bg-white p-6 text-sm text-slate-600">
            {tab === "seller"
              ? "Пока нет подходящих активных запросов. Попробуйте изменить фильтры или проверить позже."
              : "По выбранным фильтрам запросы не найдены."}
            <div className="mt-4">
              <Link href={REQUESTS_NEW_PATH} className={cn(buttonVariants({ variant: "primary", size: "md" }), "inline-flex justify-center rounded-xl")}>
                Создать запрос
              </Link>
            </div>
          </div>
        ) : null}
        {visibleRequests.map((request) => (
          <RequestCard key={request.id} request={request} role={roleForCard} match={sellerMatches[request.id]} />
        ))}
      </section>
    </div>
  );
}
