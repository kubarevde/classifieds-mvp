import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export type StatTileTrend = "up" | "down" | "flat";

export type StatTileProps = {
  label: string;
  value: ReactNode;
  delta?: number;
  trend?: StatTileTrend;
  icon?: ReactNode;
  loading?: boolean;
  /** Подпись под значением (подсказка, дисклеймер). */
  hint?: ReactNode;
  className?: string;
};

function TrendIcon({ trend }: { trend: StatTileTrend }) {
  if (trend === "up") {
    return <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2} aria-hidden />;
  }
  if (trend === "down") {
    return <ArrowDownRight className="h-3.5 w-3.5 text-rose-600" strokeWidth={2} aria-hidden />;
  }
  return <Minus className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} aria-hidden />;
}

export function StatTile({ label, value, delta, trend = "flat", icon, loading, hint, className = "" }: StatTileProps) {
  return (
    <article
      className={`rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/90 p-4 shadow-sm ${className}`.trim()}
    >
      <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
        {icon ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600">
            {icon}
          </span>
        ) : null}
        <span>{label}</span>
      </p>
      {loading ? (
        <div className="mt-2 h-8 w-24 animate-pulse rounded-md bg-slate-200/80" aria-busy aria-label="Загрузка" />
      ) : (
        <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      )}
      {delta != null && !loading ? (
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-600">
          <TrendIcon trend={trend} />
          <span>
            {delta > 0 ? "+" : ""}
            {delta}
          </span>
        </p>
      ) : null}
      {hint ? <div className="mt-1 text-[11px] leading-snug text-slate-500">{hint}</div> : null}
    </article>
  );
}
