"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useDemoRole } from "@/components/demo-role/demo-role";
import { RequestCard } from "@/components/requests/RequestCard";
import { RequestCreateForm } from "@/components/requests/RequestCreateForm";
import type { BuyerRequest } from "@/entities/requests/model";
import type { BuyerRequestDraft } from "@/services/requests/intent-adapter";
import { mockBuyerRequestsService } from "@/services/requests";
import type { RequestMatchResult } from "@/services/requests/matching";

type RequestsBoardClientProps = {
  initialRequests: BuyerRequest[];
  prefillDraft?: Partial<BuyerRequestDraft>;
};

type BoardTab = "all" | "seller" | "mine";

export function RequestsBoardClient({ initialRequests, prefillDraft }: RequestsBoardClientProps) {
  const router = useRouter();
  const { role, currentSellerId } = useDemoRole();
  const [requests, setRequests] = useState(initialRequests);
  const [tab, setTab] = useState<BoardTab>("all");
  const [worldFilter, setWorldFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | BuyerRequest["urgency"]>("all");
  const [budgetFilter, setBudgetFilter] = useState<"all" | "under_100k" | "100_500" | "500_plus">("all");
  const [showCreate, setShowCreate] = useState(false);
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

  async function handleCreate(input: {
    worldId?: string;
    categoryId: string;
    title: string;
    description: string;
    budgetMin?: number;
    budgetMax?: number;
    location: string;
    urgency: BuyerRequest["urgency"];
    condition: BuyerRequest["condition"];
    tags: string[];
  }) {
    const created = await mockBuyerRequestsService.createBuyerRequest({
      authorId: "buyer-dmitriy",
      authorName: "Дмитрий П.",
      worldId: input.worldId,
      categoryId: input.categoryId,
      title: input.title,
      description: input.description,
      budget: { min: input.budgetMin, max: input.budgetMax, currency: "RUB" },
      location: input.location,
      urgency: input.urgency,
      condition: input.condition,
      tags: input.tags,
    });
    setRequests((prev) => [created, ...prev]);
    setShowCreate(false);
    router.push(`/requests/${created.id}`);
  }

  const roleForCard: "buyer" | "seller" | "neutral" =
    role === "seller" ? "seller" : role === "buyer" ? "buyer" : "neutral";
  const locations = Array.from(new Set(requests.map((item) => item.location)));
  const worlds = Array.from(new Set(requests.map((item) => item.worldId).filter(Boolean))) as string[];

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          Не нашли нужное? Опубликуйте запрос — продавцы откликнутся
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Buyer Requests Board интегрирован с каталогом, магазинами и trust-контекстом: публикуете structured intent и получаете релевантные отклики.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
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
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                tab === item.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowCreate((prev) => !prev)}
            className="ml-auto inline-flex h-9 items-center justify-center rounded-xl bg-slate-900 px-3.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Разместить запрос о покупке
          </button>
        </div>
      </section>

      {showCreate ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-slate-900">Новый запрос покупателя</h3>
          <RequestCreateForm initialDraft={prefillDraft} onSubmit={handleCreate} />
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <select value={worldFilter} onChange={(e) => setWorldFilter(e.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm">
            <option value="all">Все миры</option>
            {worlds.map((world) => (
              <option key={world} value={world}>
                {world}
              </option>
            ))}
          </select>
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm">
            <option value="all">Любой город</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value as typeof urgencyFilter)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm">
            <option value="all">Любая срочность</option>
            <option value="today">Сегодня</option>
            <option value="this_week">На неделе</option>
            <option value="flexible">Гибко</option>
          </select>
          <select value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value as typeof budgetFilter)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm">
            <option value="all">Любой бюджет</option>
            <option value="under_100k">До 100k</option>
            <option value="100_500">100k - 500k</option>
            <option value="500_plus">500k+</option>
          </select>
          <Link
            href={currentSellerId ? `/dashboard/store?sellerId=${currentSellerId}` : "/dashboard/store"}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            В кабинет магазина
          </Link>
        </div>
      </section>

      <section className="grid gap-3">
        {visibleRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
            {tab === "seller"
              ? "Пока нет подходящих активных запросов. Попробуйте изменить фильтры или проверить позже."
              : "По выбранным фильтрам запросы не найдены."}
          </div>
        ) : null}
        {visibleRequests.map((request) => (
          <RequestCard key={request.id} request={request} role={roleForCard} match={sellerMatches[request.id]} />
        ))}
      </section>
    </div>
  );
}

