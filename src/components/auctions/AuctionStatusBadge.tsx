import type { AuctionState } from "@/entities/auction/model";

type AuctionStatusBadgeProps = {
  status: AuctionState["status"];
};

const statusLabelMap: Record<AuctionState["status"], string> = {
  draft: "DRAFT",
  scheduled: "SCHEDULED",
  live: "LIVE",
  ending_soon: "ENDING SOON",
  ended: "ENDED",
  cancelled: "CANCELLED",
};

const statusClassMap: Record<AuctionState["status"], string> = {
  draft: "border-slate-200 bg-slate-100 text-slate-600",
  scheduled: "border-violet-200 bg-violet-50 text-violet-700",
  live: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ending_soon: "border-amber-200 bg-amber-50 text-amber-700",
  ended: "border-slate-200 bg-slate-100 text-slate-600",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
};

export function AuctionStatusBadge({ status }: AuctionStatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${statusClassMap[status]}`}>
      {statusLabelMap[status]}
    </span>
  );
}
