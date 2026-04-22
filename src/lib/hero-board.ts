import { CatalogWorld } from "@/lib/listings";

export type HeroBannerScope = "global" | "world";
export type HeroBannerPeriod = "day" | "week" | "month";
export type HeroBannerWorld = Exclude<CatalogWorld, "all">;

export type HeroBannerPlacement = {
  id: string;
  sellerId: string;
  scope: HeroBannerScope;
  worldId?: HeroBannerWorld;
  period: HeroBannerPeriod;
  title: string;
  subtitle: string;
  imageUrl?: string;
  ctaLabel: string;
  ctaHref: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
  mockPrice: number;
};

export type HeroBoardCharityStats = {
  totalSlots: number;
  totalAmount: number;
  charityAmount: number;
};

const heroBannerPlacementsMock: HeroBannerPlacement[] = [
  {
    id: "hb-global-1",
    sellerId: "marina-tech",
    scope: "global",
    period: "week",
    title: "Marina Select: проверенная техника без сюрпризов",
    subtitle: "Смартфоны и ноутбуки с диагностикой перед выдачей и понятной гарантией.",
    imageUrl:
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1400&q=80",
    ctaLabel: "Открыть витрину",
    ctaHref: "/sellers/marina-tech",
    isActive: true,
    startsAt: "2026-04-18T00:00:00.000Z",
    endsAt: "2026-04-26T00:00:00.000Z",
    mockPrice: 24000,
  },
  {
    id: "hb-global-2",
    sellerId: "pc-lab",
    scope: "global",
    period: "day",
    title: "PC Lab: сборки для работы и игр",
    subtitle: "Готовые конфигурации и апгрейды с подбором под ваш бюджет.",
    ctaLabel: "Перейти в магазин",
    ctaHref: "/sellers/pc-lab",
    isActive: false,
    startsAt: "2026-04-12T00:00:00.000Z",
    endsAt: "2026-04-13T00:00:00.000Z",
    mockPrice: 12000,
  },
  {
    id: "hb-world-1",
    sellerId: "agro-don",
    scope: "world",
    worldId: "agriculture",
    period: "day",
    title: "Agro Don Market: сезонные поставки напрямую с фермы",
    subtitle: "Овощи и готовая продукция для retail и HoReCa с быстрой логистикой.",
    ctaLabel: "Смотреть предложения",
    ctaHref: "/sellers/agro-don",
    isActive: true,
    startsAt: "2026-04-21T00:00:00.000Z",
    endsAt: "2026-04-22T00:00:00.000Z",
    mockPrice: 6400,
  },
  {
    id: "hb-world-2",
    sellerId: "denis-garage",
    scope: "world",
    worldId: "autos",
    period: "week",
    title: "Garage Select: проверенные авто и комплектующие",
    subtitle: "Подбор по истории обслуживания и техническому состоянию.",
    ctaLabel: "Открыть storefront",
    ctaHref: "/sellers/denis-garage",
    isActive: false,
    startsAt: "2026-04-20T00:00:00.000Z",
    endsAt: "2026-04-27T00:00:00.000Z",
    mockPrice: 15800,
  },
  {
    id: "hb-world-3",
    sellerId: "pc-lab",
    scope: "world",
    worldId: "electronics",
    period: "day",
    title: "PC Lab: апгрейд и игровые сборки",
    subtitle: "Актуальные комплектующие и готовые конфигурации с гарантией магазина.",
    ctaLabel: "Перейти в магазин",
    ctaHref: "/sellers/pc-lab",
    isActive: true,
    startsAt: "2026-04-21T00:00:00.000Z",
    endsAt: "2026-04-22T00:00:00.000Z",
    mockPrice: 7100,
  },
];

export const heroBoardCharityStats: HeroBoardCharityStats = (() => {
  const totalAmount = heroBannerPlacementsMock.reduce((sum, placement) => sum + placement.mockPrice, 0);
  const charityAmount = Math.round(totalAmount * 0.2);
  return {
    totalSlots: heroBannerPlacementsMock.length,
    totalAmount,
    charityAmount,
  };
})();

export function getHeroBannerPlacements() {
  return [...heroBannerPlacementsMock];
}

export function getHeroBannerPlacementsBySellerId(sellerId: string) {
  return heroBannerPlacementsMock
    .filter((placement) => placement.sellerId === sellerId)
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
}

export function getActiveHeroBanner(): HeroBannerPlacement | null {
  return heroBannerPlacementsMock.find((placement) => placement.isActive && placement.scope === "global") ?? null;
}

export function getActiveHeroBannerForWorld(worldId: HeroBannerWorld): HeroBannerPlacement | null {
  return (
    heroBannerPlacementsMock.find(
      (placement) =>
        placement.isActive && placement.scope === "world" && placement.worldId === worldId,
    ) ?? null
  );
}
