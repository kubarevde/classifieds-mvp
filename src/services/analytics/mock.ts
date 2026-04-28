import type {
  StoreAnalytics,
  StoreAnalyticsPeriod,
  TopListingAnalyticsRow,
  CategoryBreakdownRow,
  FunnelStep,
  CompetitorBenchmark,
  TimeSeriesPoint,
} from "@/entities/analytics/model";
import { buildStoreInsights } from "@/services/analytics/insights";
import type { StoreInsight } from "@/entities/analytics/model";
import { dayIso, mulberry32, periodToDayCount, seedFromString } from "@/mocks/analytics/series";
import { getStorefrontSellerById } from "@/services/sellers/seller-data";

const DEMO_STORE_IDS = ["alexey-drive", "marina-tech", "ildar-estate"] as const;

const CATEGORIES_BY_STORE: Record<string, string[]> = {
  "alexey-drive": ["Авто", "Запчасти", "Услуги", "Прочее"],
  "marina-tech": ["Смартфоны", "Ноутбуки", "Аксессуары", "Прочее"],
  "ildar-estate": ["Квартиры", "Новостройки", "Коммерция", "Участки"],
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function buildSeries(
  rnd: () => number,
  days: number,
  base: number,
  volatility: number,
  weeklyAmp: number,
  seasonality: number,
): number[] {
  const out: number[] = [];
  for (let i = 0; i < days; i += 1) {
    const wobble = (rnd() - 0.5) * volatility;
    const week = Math.sin((i % 7) * (Math.PI / 3.5)) * weeklyAmp;
    const season = Math.sin((i / days) * Math.PI * 2) * seasonality;
    const v = base * (1 + wobble + week * 0.02 + season * 0.03);
    out.push(Math.max(0, Math.round(v)));
  }
  return out;
}

function normalizeBreakdown(rows: CategoryBreakdownRow[]): CategoryBreakdownRow[] {
  const s = rows.reduce((a, r) => a + r.value, 0) || 1;
  return rows.map((r) => ({ ...r, value: (r.value / s) * 100 }));
}

function buildTopListings(
  storeId: string,
  rnd: () => number,
  listingIds: string[],
): TopListingAnalyticsRow[] {
  return listingIds.slice(0, 5).map((listingId, idx) => {
    const views = Math.round(120 + rnd() * 400 + (5 - idx) * 80);
    const contacts = Math.max(1, Math.round(views * (0.02 + rnd() * 0.04)));
    const favorites = Math.round(views * (0.05 + rnd() * 0.06));
    return {
      listingId,
      views,
      contacts,
      favorites,
      conversionRate: contacts / Math.max(1, views),
    };
  });
}

export function buildStoreAnalyticsMock(storeId: string, period: StoreAnalyticsPeriod): StoreAnalytics {
  const days = periodToDayCount(period);
  const seed = seedFromString(`${storeId}-${period}`);
  const rnd = mulberry32(seed);

  const baseViews = 180 + (seedFromString(storeId) % 120);
  const viewsRaw = buildSeries(rnd, days, baseViews, 0.35, 18, 12);
  const clicksRaw = viewsRaw.map((v) => Math.round(v * (0.22 + rnd() * 0.08)));
  const contactsRaw = clicksRaw.map((c) => Math.round(c * (0.12 + rnd() * 0.06)));
  const ordersRaw = contactsRaw.map((x) => Math.round(x * (0.25 + rnd() * 0.12)));
  const revenueRaw = ordersRaw.map((o) => Math.round(o * (8000 + rnd() * 12000)));
  const followersRaw = buildSeries(rnd, days, 3 + rnd() * 4, 0.6, 4, 2);

  const toPoints = (values: number[]): TimeSeriesPoint[] =>
    values.map((value, i) => ({ date: dayIso(i, days), value }));

  const cats = CATEGORIES_BY_STORE[storeId] ?? ["Категория A", "Категория B", "Прочее"];
  const breakdownSeed = seedFromString(`${storeId}-cat`);
  const categoryBreakdown = normalizeBreakdown(
    cats.map((category, i) => ({
      category,
      value: 10 + ((breakdownSeed >> (i * 3)) % 40) + rnd() * 20,
    })),
  );

  const seller = getStorefrontSellerById(storeId);
  const fromSeller = seller?.listingRefs.map((r) => r.listingId) ?? [];
  const padded = [...fromSeller];
  while (padded.length < 5) {
    padded.push(`${storeId}-demo-${padded.length + 1}`);
  }
  const topListings = buildTopListings(storeId, rnd, padded);

  const vSum = viewsRaw.reduce((a, b) => a + b, 0);
  const cSum = clicksRaw.reduce((a, b) => a + b, 0);
  const ctSum = contactsRaw.reduce((a, b) => a + b, 0);
  const oSum = ordersRaw.reduce((a, b) => a + b, 0);

  const funnelData: FunnelStep[] = [
    { label: "Просмотры", value: vSum },
    { label: "Клики", value: cSum },
    { label: "Контакты", value: ctSum },
    { label: "Сделки", value: Math.max(1, oSum) },
  ];

  const niche = storeId.includes("estate") ? "Недвижимость" : storeId.includes("tech") ? "Электроника" : "Авто";
  const competitorBenchmark: CompetitorBenchmark[] = [
    {
      niche,
      yourStore: clamp(avg(ordersRaw) * 10, 40, 98),
      nicheAverage: clamp(avg(ordersRaw) * 8.5, 35, 85),
      metric: "Индекс заказов",
    },
    {
      niche,
      yourStore: clamp((ctSum / Math.max(1, vSum)) * 1000, 25, 95),
      nicheAverage: clamp((ctSum / Math.max(1, vSum)) * 1000 * 0.88, 22, 80),
      metric: "Контакты / 1k просм.",
    },
    {
      niche,
      yourStore: clamp(avg(revenueRaw) / 1000, 12, 60),
      nicheAverage: clamp(avg(revenueRaw) / 1100, 10, 55),
      metric: "Средний чек (тыс.)",
    },
  ];

  return {
    storeId,
    period,
    revenue: toPoints(revenueRaw),
    orders: toPoints(ordersRaw),
    views: toPoints(viewsRaw),
    clicks: toPoints(clicksRaw),
    contacts: toPoints(contactsRaw),
    newFollowers: toPoints(followersRaw),
    categoryBreakdown,
    topListings,
    funnelData,
    competitorBenchmark,
  };
}

function avg(arr: number[]): number {
  if (arr.length === 0) {
    return 0;
  }
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export async function getStoreAnalyticsMock(storeId: string, period: StoreAnalyticsPeriod): Promise<StoreAnalytics> {
  await new Promise((r) => setTimeout(r, 120));
  if (!DEMO_STORE_IDS.includes(storeId as (typeof DEMO_STORE_IDS)[number])) {
    return buildStoreAnalyticsMock(DEMO_STORE_IDS[0], period);
  }
  return buildStoreAnalyticsMock(storeId, period);
}

export async function getStoreInsightsMock(
  storeId: string,
  period: StoreAnalyticsPeriod,
): Promise<StoreInsight[]> {
  const analytics = await getStoreAnalyticsMock(storeId, period);
  return buildStoreInsights(analytics, period);
}

function csvEscape(cell: string): string {
  if (/[",\n]/.test(cell)) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

export async function exportStoreAnalyticsCsvMock(
  storeId: string,
  period: StoreAnalyticsPeriod,
): Promise<string> {
  const a = await getStoreAnalyticsMock(storeId, period);
  const headers = [
    "date",
    "revenue",
    "orders",
    "views",
    "clicks",
    "contacts",
    "new_followers",
  ];
  const lines = [headers.join(",")];
  for (let i = 0; i < a.revenue.length; i += 1) {
    const row = [
      a.revenue[i]?.date ?? "",
      String(a.revenue[i]?.value ?? 0),
      String(a.orders[i]?.value ?? 0),
      String(a.views[i]?.value ?? 0),
      String(a.clicks[i]?.value ?? 0),
      String(a.contacts[i]?.value ?? 0),
      String(a.newFollowers[i]?.value ?? 0),
    ];
    lines.push(row.map(csvEscape).join(","));
  }
  lines.push("");
  lines.push("category,value_pct");
  for (const c of a.categoryBreakdown) {
    lines.push([csvEscape(c.category), c.value.toFixed(2)].join(","));
  }
  lines.push("");
  lines.push("listing_id,views,contacts,favorites,conversion_rate");
  for (const t of a.topListings) {
    lines.push(
      [t.listingId, t.views, t.contacts, t.favorites, t.conversionRate.toFixed(4)].map(String).join(","),
    );
  }
  return lines.join("\n");
}
