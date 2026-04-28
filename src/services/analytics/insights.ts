import type { StoreAnalytics, StoreInsight, StoreAnalyticsPeriod } from "@/entities/analytics/model";

function sumSeries(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

/** Пн=1 … Вс=7 в ISO week context — используем индекс дня от начала ряда % 7 как proxy. */
function weekdayLift(views: number[]): { best: number; worst: number; label: string } {
  const buckets = [0, 0, 0, 0, 0, 0, 0];
  views.forEach((v, i) => {
    buckets[i % 7] += v;
  });
  const names = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  let bestI = 0;
  let worstI = 0;
  for (let i = 1; i < 7; i += 1) {
    if (buckets[i] > buckets[bestI]) {
      bestI = i;
    }
    if (buckets[i] < buckets[worstI]) {
      worstI = i;
    }
  }
  return { best: bestI, worst: worstI, label: `${names[bestI]} сильнее ${names[worstI]}` };
}

export function buildStoreInsights(analytics: StoreAnalytics, period: StoreAnalyticsPeriod): StoreInsight[] {
  const views = analytics.views.map((p) => p.value);
  const contacts = analytics.contacts.map((p) => p.value);
  const followers = analytics.newFollowers.map((p) => p.value);
  const revenue = analytics.revenue.map((p) => p.value);

  const half = Math.floor(views.length / 2) || 1;
  const convRecent =
    sumSeries(contacts.slice(half)) / Math.max(1, sumSeries(views.slice(half))) * 100;
  const convPrev =
    sumSeries(contacts.slice(0, half)) / Math.max(1, sumSeries(views.slice(0, half))) * 100;

  const topCat = [...analytics.categoryBreakdown].sort((a, b) => b.value - a.value)[0];
  const topListing = [...analytics.topListings].sort((a, b) => b.views - a.views)[0];
  const lift = weekdayLift(views);

  const insights: StoreInsight[] = [];

  if (views.length >= 7) {
    insights.push({
      id: "weekday-pattern",
      kind: "Неделя",
      title: "Ритм недели",
      body: `По просмотрам ${lift.label} — планируйте обновления и промо под сильные дни.`,
      severity: "info",
    });
  }

  if (topCat) {
    insights.push({
      id: "category-leader",
      kind: "Категории",
      title: "Категория-лидер",
      body: `«${topCat.category}» — около ${Math.round(topCat.value)}% доли просмотров в разбивке (сумма по категориям = 100%) — усильте там ассортимент и обложки.`,
      severity: "success",
    });
  }

  if (topListing) {
    insights.push({
      id: "best-listing",
      kind: "Листинги",
      title: "Лучший листинг",
      body: `Лидер по просмотрам (${new Intl.NumberFormat("ru-RU").format(topListing.views)}): конверсия в контакт ${(topListing.conversionRate * 100).toFixed(1)}% — сравните заголовок и цену с остальными строками таблицы.`,
      severity: "success",
    });
  }

  if (views.length >= 14 && convPrev > 0) {
    const delta = convRecent - convPrev;
    if (delta < -0.15) {
      insights.push({
        id: "conversion-dip",
        kind: "Воронка",
        title: "Просадка конверсии",
        body: `Контакты к просмотрам во второй половине периода ниже на ${Math.abs(delta).toFixed(1)} п.п. — проверьте цены и первый экран карточек.`,
        severity: "warning",
      });
    } else if (delta > 0.15) {
      insights.push({
        id: "conversion-up",
        kind: "Воронка",
        title: "Конверсия растёт",
        body: `Во второй половине периода контакты к просмотрам выше на ${delta.toFixed(1)} п.п.`,
        severity: "success",
      });
    }
  }

  const fSum = sumSeries(followers);
  const prevF = sumSeries(followers.slice(0, half));
  const nextF = sumSeries(followers.slice(half));
  if (followers.length >= 8 && nextF > prevF * 1.25 && nextF >= 3) {
    insights.push({
      id: "followers-spike",
      kind: "Аудитория",
      title: "Всплеск подписчиков",
      body: `Новые подписчики во второй половине периода заметно выше — закрепите тему постов, которая совпала с ростом.`,
      severity: "success",
    });
  } else if (fSum > 0 && period !== "7d") {
    insights.push({
      id: "followers-total",
      kind: "Аудитория",
      title: "Подписчики за период",
      body: `За период +${Math.round(fSum)} новых подписчиков — напомните про акции в ленте магазина.`,
      severity: "info",
    });
  }

  const revDelta = sumSeries(revenue.slice(half)) - sumSeries(revenue.slice(0, half));
  if (revenue.length >= 10 && Math.abs(revDelta) > 1) {
    insights.push({
      id: "revenue-trend",
      kind: "Выручка",
      title: revDelta > 0 ? "Выручка ускоряется" : "Выручка замедлилась",
      body:
        revDelta > 0
          ? `Сумма выручки по дням во второй половине периода выше, чем в первой (на ${new Intl.NumberFormat("ru-RU").format(Math.round(Math.abs(revDelta)))} ₽) — масштабируйте промо на похожие SKU.`
          : `Сумма выручки по дням во второй половине ниже первой (на ${new Intl.NumberFormat("ru-RU").format(Math.round(Math.abs(revDelta)))} ₽) — проверьте наличие и обложки топ‑позиций.`,
      severity: revDelta > 0 ? "success" : "warning",
    });
  }

  return insights.slice(0, 5);
}
