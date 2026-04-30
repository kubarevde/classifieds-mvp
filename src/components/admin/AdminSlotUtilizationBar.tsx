export function AdminSlotUtilizationBar({ active, capacity }: { active: number; capacity: number }) {
  const pct = capacity > 0 ? Math.min(100, Math.round((active / capacity) * 100)) : 0;
  return (
    <div className="flex min-w-[120px] flex-col gap-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${pct >= 95 ? "bg-amber-500" : pct >= 70 ? "bg-emerald-500" : "bg-sky-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-medium text-slate-500">
        {active}/{capacity} ({pct}%)
      </span>
    </div>
  );
}
