import { clsx } from "clsx";

const toneByKind: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  warning: "bg-amber-50 text-amber-900 ring-amber-200",
  danger: "bg-rose-50 text-rose-800 ring-rose-200",
  neutral: "bg-slate-50 text-slate-700 ring-slate-200",
  info: "bg-sky-50 text-sky-900 ring-sky-200",
};

export function AdminStatusBadge({
  children,
  tone = "neutral",
}: {
  children: string;
  tone?: keyof typeof toneByKind;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneByKind[tone] ?? toneByKind.neutral,
      )}
    >
      {children}
    </span>
  );
}
