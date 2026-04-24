"use client";

import { FormEvent, useMemo, useState } from "react";

import type { HeroBannerPlacement, HeroBannerPeriod, HeroBannerScope, HeroBannerWorld } from "@/lib/hero-board";
import { worldOptions, getWorldLabel } from "@/lib/listings";
import { computeHeroMockPrice, getHeroPeriodDays, heroPeriodLabel, heroScopeLabel } from "@/lib/sponsor-board";

type HeroBoardManagerProps = {
  initialPlacements: HeroBannerPlacement[];
  sellerId: string;
  onSave: (nextPlacement: HeroBannerPlacement) => void;
};

type HeroBoardManagerFormState = {
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaHref: string;
  scope: HeroBannerScope;
  period: HeroBannerPeriod;
  worldId: HeroBannerWorld;
};

function toInitialFormState(placement: HeroBannerPlacement | null): HeroBoardManagerFormState {
  if (!placement) {
    return {
      title: "",
      subtitle: "",
      imageUrl: "",
      ctaHref: "",
      scope: "global",
      period: "week",
      worldId: "electronics",
    };
  }
  return {
    title: placement.title,
    subtitle: placement.subtitle,
    imageUrl: placement.imageUrl ?? "",
    ctaHref: placement.ctaHref,
    scope: placement.scope,
    period: placement.period,
    worldId: placement.worldId ?? "electronics",
  };
}

const availableWorlds = worldOptions.filter(
  (world): world is { id: HeroBannerWorld; label: string; description: string } => world.id !== "all",
);

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

export default function HeroBoardManager({ initialPlacements, sellerId, onSave }: HeroBoardManagerProps) {
  const [placements, setPlacements] = useState<HeroBannerPlacement[]>(initialPlacements);
  const currentPlacement = useMemo(
    () => placements.find((item) => item.isActive) ?? placements[0] ?? null,
    [placements],
  );
  const [formState, setFormState] = useState<HeroBoardManagerFormState>(() => toInitialFormState(currentPlacement));
  const mockPrice = useMemo(
    () => computeHeroMockPrice(formState.scope, formState.period, formState.scope === "world" ? formState.worldId : undefined),
    [formState.scope, formState.period, formState.worldId],
  );
  const charityAmount = useMemo(() => Math.round(mockPrice * 0.2), [mockPrice]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const now = new Date();
    const nextPlacement: HeroBannerPlacement = {
      id: `hero-local-${Date.now()}`,
      sellerId,
      scope: formState.scope,
      worldId: formState.scope === "world" ? formState.worldId : undefined,
      period: formState.period,
      title: formState.title.trim(),
      subtitle: formState.subtitle.trim(),
      imageUrl: formState.imageUrl.trim() || undefined,
      ctaLabel: "Открыть витрину",
      ctaHref: formState.ctaHref.trim(),
      isActive: true,
      startsAt: now.toISOString(),
      endsAt: new Date(now.getTime() + getHeroPeriodDays(formState.period) * 24 * 60 * 60 * 1000).toISOString(),
      mockPrice,
    };
    setPlacements((current) => [nextPlacement, ...current.map((item) => ({ ...item, isActive: false }))]);
    onSave(nextPlacement);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm text-slate-700">
          <span>Заголовок баннера</span>
          <input
            value={formState.title}
            onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
            required
          />
        </label>
        <label className="space-y-1 text-sm text-slate-700">
          <span>Ссылка кнопки</span>
          <input
            value={formState.ctaHref}
            onChange={(event) => setFormState((prev) => ({ ...prev, ctaHref: event.target.value }))}
            placeholder="/sellers/marina-tech"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
            required
          />
        </label>
      </div>

      <label className="space-y-1 text-sm text-slate-700">
        <span>Подзаголовок</span>
        <textarea
          rows={2}
          value={formState.subtitle}
          onChange={(event) => setFormState((prev) => ({ ...prev, subtitle: event.target.value }))}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
          required
        />
      </label>

      <label className="space-y-1 text-sm text-slate-700">
        <span>Image URL</span>
        <input
          value={formState.imageUrl}
          onChange={(event) => setFormState((prev) => ({ ...prev, imageUrl: event.target.value }))}
          placeholder="https://..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <label className="space-y-1 text-sm text-slate-700">
          <span>Охват</span>
          <select
            value={formState.scope}
            onChange={(event) => setFormState((prev) => ({ ...prev, scope: event.target.value as HeroBannerScope }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
          >
            <option value="global">Вся платформа</option>
            <option value="world">Тематический мир</option>
          </select>
        </label>

        <label className="space-y-1 text-sm text-slate-700">
          <span>Период</span>
          <select
            value={formState.period}
            onChange={(event) => setFormState((prev) => ({ ...prev, period: event.target.value as HeroBannerPeriod }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
          >
            <option value="day">День</option>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
          </select>
        </label>

        <label className="space-y-1 text-sm text-slate-700">
          <span>Мир</span>
          <select
            value={formState.worldId}
            onChange={(event) => setFormState((prev) => ({ ...prev, worldId: event.target.value as HeroBannerWorld }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50"
            disabled={formState.scope !== "world"}
          >
            {availableWorlds.map((world) => (
              <option key={world.id} value={world.id}>
                {world.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
        <p className="text-xs text-slate-600">
          Mock-стоимость: <span className="font-semibold text-slate-900">{mockPrice.toLocaleString("ru-RU")} ₽</span>
        </p>
        <p className="text-xs text-slate-600">
          Благотворительность (20%):{" "}
          <span className="font-semibold text-slate-900">{charityAmount.toLocaleString("ru-RU")} ₽</span>
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 sm:w-auto"
        >
          Подключить героя доски
        </button>
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="text-sm font-semibold text-slate-900">Текущий герой доски</p>
        {currentPlacement ? (
          <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p>
              Формат: <span className="font-medium">Баннерный слот</span>
            </p>
            <p>
              Охват: <span className="font-medium">{heroScopeLabel[currentPlacement.scope]}</span>
              {currentPlacement.worldId ? ` · ${getWorldLabel(currentPlacement.worldId)}` : ""}
            </p>
            <p>
              Период: <span className="font-medium">{heroPeriodLabel[currentPlacement.period]}</span> · до{" "}
              <span className="font-medium">{formatDate(currentPlacement.endsAt)}</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">CTA: {currentPlacement.ctaLabel}</p>
          </div>
        ) : (
          <p className="mt-1 text-sm text-slate-600">Активного размещения пока нет.</p>
        )}
      </article>

      <article className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="text-sm font-semibold text-slate-900">История</p>
        <div className="mt-2 space-y-2">
          {placements.slice(0, 5).map((entry) => (
            <div key={entry.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm text-slate-700">
              <p>
                Баннер · {heroScopeLabel[entry.scope]}
                {entry.worldId ? ` (${getWorldLabel(entry.worldId)})` : ""}
              </p>
              <p className="text-xs text-slate-500">
                {heroPeriodLabel[entry.period]} · {entry.mockPrice.toLocaleString("ru-RU")} ₽ · {formatDate(entry.startsAt)}
              </p>
            </div>
          ))}
        </div>
      </article>
    </form>
  );
}
