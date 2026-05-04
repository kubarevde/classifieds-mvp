import type { DealStatus } from "@/services/deals";

const tone: Record<DealStatus, string> = {
  active: "bg-sky-100 text-sky-900 border-sky-200",
  completed: "bg-emerald-100 text-emerald-900 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200",
  disputed: "bg-amber-100 text-amber-950 border-amber-200",
};

const label: Record<DealStatus, string> = {
  active: "Активна",
  completed: "Завершена",
  cancelled: "Отменена",
  disputed: "Спор",
};

export function DealStatusBadge({ status }: { status: DealStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone[status]}`}>
      {label[status]}
    </span>
  );
}
