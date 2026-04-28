/** Единая палитра графиков Store Analytics 2.0 (slate / emerald). */
export const analyticsChartColors = {
  revenue: "#0f172a",
  orders: "#10b981",
  views: "#64748b",
  conversion: "#6366f1",
  grid: "#e2e8f0",
  muted: "#94a3b8",
  benchmarkYou: "#0f172a",
  benchmarkNiche: "#94a3b8",
};

/** Подписи оси дат: на длинных рядах меньше наложений на mobile / laptop. */
export function denseDateAxisProps(pointCount: number) {
  const dense = pointCount > 72;
  return {
    angle: dense ? -32 : 0,
    textAnchor: (dense ? "end" : "middle") as "end" | "middle",
    tick: { fontSize: dense ? 8 : 10, fill: analyticsChartColors.muted },
    height: dense ? 46 : 26,
    minTickGap: dense ? 22 : 10,
    interval: "preserveStartEnd" as const,
  };
}

export function chartOuterMarginBottom(pointCount: number): number {
  return pointCount > 72 ? 18 : 6;
}
