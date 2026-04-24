"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { useBuyer } from "@/components/buyer/buyer-provider";
import { Badge, Button, Card } from "@/components/ui";
import type { HeroBannerPeriod, HeroBannerScope, HeroBannerWorld } from "@/lib/hero-board";
import { getWorldLabel } from "@/lib/listings";
import { computeHeroMockPrice, heroPeriodLabel, heroScopeLabel } from "@/lib/sponsor-board";

function worldFromCategory(category: string): HeroBannerWorld {
  if (category === "auto") return "autos";
  if (category === "electronics") return "electronics";
  if (category === "real_estate") return "real_estate";
  return "services";
}

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function BuyerPromotionTab() {
  const buyer = useBuyer();
  const [listingId, setListingId] = useState<string>(buyer.myListings[0]?.id ?? "");
  const [scope, setScope] = useState<HeroBannerScope>("global");
  const [period, setPeriod] = useState<HeroBannerPeriod>("week");
  const selectedListing = useMemo(
    () => buyer.myListings.find((item) => item.id === listingId) ?? null,
    [buyer.myListings, listingId],
  );
  const [worldId, setWorldId] = useState<HeroBannerWorld>(
    selectedListing ? worldFromCategory(selectedListing.category) : "electronics",
  );

  const price = useMemo(
    () => computeHeroMockPrice(scope, period, scope === "world" ? worldId : undefined),
    [scope, period, worldId],
  );

  if (buyer.myListings.length === 0) {
    return (
      <Card className="p-6 text-center">
        <h2 className="text-lg font-semibold text-slate-900">Пока нечего продвигать</h2>
        <p className="mt-2 text-sm text-slate-600">
          Сначала разместите объявление, чтобы запустить продвижение в блоке «Герой доски».
        </p>
        <div className="mt-4">
          <Link href="/create-listing">
            <Button>Разместить объявление</Button>
          </Link>
        </div>
      </Card>
    );
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!selectedListing) {
      return;
    }
    buyer.promoteListing({
      listingId: selectedListing.id,
      listingTitle: selectedListing.title,
      scope,
      period,
      worldId: scope === "world" ? worldId : undefined,
      mockPrice: price,
    });
  }

  const active = buyer.promotions.find((item) => item.isActive) ?? null;

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Продвижение объявления</h2>
            <p className="text-sm text-slate-600">Запустите размещение в формате «Герой доски» для ваших объявлений.</p>
          </div>
          <Link href="/create-listing" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto" variant="outline">Разместить объявление</Button>
          </Link>
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-700">
              <span>Объявление</span>
              <select
                value={listingId}
                onChange={(event) => {
                  const nextId = event.target.value;
                  setListingId(nextId);
                  const nextListing = buyer.myListings.find((item) => item.id === nextId);
                  if (nextListing) {
                    setWorldId(worldFromCategory(nextListing.category));
                  }
                }}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3"
              >
                {buyer.myListings.map((listing) => (
                  <option key={listing.id} value={listing.id}>
                    {listing.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-slate-700">
              <span>Охват</span>
              <select
                value={scope}
                onChange={(event) => setScope(event.target.value as HeroBannerScope)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3"
              >
                <option value="global">Вся платформа</option>
                <option value="world">Конкретный мир</option>
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-700">
              <span>Период</span>
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value as HeroBannerPeriod)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3"
              >
                <option value="day">День</option>
                <option value="week">Неделя</option>
                <option value="month">Месяц</option>
              </select>
            </label>

            <label className="space-y-1 text-sm text-slate-700">
              <span>Мир</span>
              <select
                value={worldId}
                onChange={(event) => setWorldId(event.target.value as HeroBannerWorld)}
                disabled={scope !== "world"}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 disabled:bg-slate-100"
              >
                {(["electronics", "autos", "agriculture", "real_estate", "jobs", "services"] as HeroBannerWorld[]).map((world) => (
                  <option key={world} value={world}>
                    {getWorldLabel(world)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            Стоимость: <span className="font-semibold">{price.toLocaleString("ru-RU")} ₽</span>
          </div>

          <Button className="w-full sm:w-auto" type="submit">Продвинуть объявление</Button>
        </form>
      </Card>

      <Card className="p-4 sm:p-5">
        <h3 className="text-base font-semibold text-slate-900">Текущее продвижение</h3>
        {active ? (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <div className="mb-2">
              <Badge>{active.isActive ? "Активно" : "Завершено"}</Badge>
            </div>
            <p className="font-medium text-slate-900">{active.listingTitle}</p>
            <p>
              {heroScopeLabel[active.scope]}
              {active.worldId ? ` · ${getWorldLabel(active.worldId)}` : ""} · {heroPeriodLabel[active.period]}
            </p>
            <p>До {formatDate(active.endsAt)}</p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">Активного продвижения пока нет.</p>
        )}
      </Card>

      <Card className="p-4 sm:p-5">
        <h3 className="text-base font-semibold text-slate-900">История</h3>
        <div className="mt-3 space-y-2">
          {buyer.promotions.length === 0 ? (
            <p className="text-sm text-slate-600">Пока нет завершенных или активных кампаний.</p>
          ) : (
            buyer.promotions.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <p className="font-medium text-slate-900">{item.listingTitle}</p>
                <p>
                  {heroScopeLabel[item.scope]}
                  {item.worldId ? ` · ${getWorldLabel(item.worldId)}` : ""} · {heroPeriodLabel[item.period]}
                </p>
                <p>{item.mockPrice.toLocaleString("ru-RU")} ₽ · {formatDate(item.startsAt)}</p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
