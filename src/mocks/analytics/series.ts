/** Детерминированный PRNG по строке (storeId + salt). */
export function seedFromString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function periodToDayCount(period: "7d" | "30d" | "90d" | "1y"): number {
  switch (period) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    case "1y":
      return 365;
    default:
      return 7;
  }
}

/** ISO дата UTC, сдвиг на `daysAgo` от конца периода (последний день = вчера для стабильности демо). */
export function dayIso(daysFromEnd: number, totalDays: number): string {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  end.setUTCDate(end.getUTCDate() - 1);
  const d = new Date(end);
  d.setUTCDate(d.getUTCDate() - (totalDays - 1 - daysFromEnd));
  return d.toISOString().slice(0, 10);
}
