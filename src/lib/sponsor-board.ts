import type { HeroBannerPeriod, HeroBannerScope, HeroBannerWorld } from "@/lib/hero-board";

export const heroScopeLabel: Record<HeroBannerScope, string> = {
  global: "Вся платформа",
  world: "Конкретный мир",
};

export const heroPeriodLabel: Record<HeroBannerPeriod, string> = {
  day: "День",
  week: "Неделя",
  month: "Месяц",
};

export function computeHeroMockPrice(scope: HeroBannerScope, period: HeroBannerPeriod, worldId?: HeroBannerWorld) {
  const scopePrice = scope === "global" ? 12000 : 6200;
  const worldMultiplier =
    scope === "world"
      ? worldId === "agriculture"
        ? 0.92
        : worldId === "autos"
          ? 1.04
          : 1
      : 1;
  const periodMultiplier = period === "day" ? 1 : period === "week" ? 3.6 : 10.8;
  return Math.round(scopePrice * worldMultiplier * periodMultiplier);
}

export function getHeroPeriodDays(period: HeroBannerPeriod) {
  return period === "day" ? 1 : period === "week" ? 7 : 30;
}
