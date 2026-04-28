export function mergeKeywordList(existing: string, tags: string[]): string {
  const set = new Set(
    existing
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean),
  );
  for (const t of tags) {
    const x = t.trim();
    if (x) set.add(x);
  }
  return [...set].join(", ");
}
