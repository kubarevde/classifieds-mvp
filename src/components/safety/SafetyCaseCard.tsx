import Link from "next/link";

import type { SafetyReport } from "@/services/safety";
import { reportReasonLabels } from "@/lib/safety/report-reasons";
import { safetyStatusLabelRu } from "@/services/safety";
import { Badge } from "@/components/ui";

type SafetyCaseCardProps = {
  report: SafetyReport;
};

function statusBadgeVariant(
  status: SafetyReport["status"],
): "default" | "secondary" | "outline" {
  if (status === "action_taken" || status === "resolved") {
    return "default";
  }
  if (status === "under_review") {
    return "secondary";
  }
  return "outline";
}

export function SafetyCaseCard({ report }: SafetyCaseCardProps) {
  const updated = new Date(report.updatedAt).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Link
      href={`/safety/reports/${report.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-semibold text-slate-900">
            {report.targetLabel ?? report.targetType}
          </p>
          <p className="text-xs text-slate-500">{reportReasonLabels[report.reason]}</p>
        </div>
        <Badge variant={statusBadgeVariant(report.status)}>{safetyStatusLabelRu(report.status)}</Badge>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{report.description}</p>
      <p className="mt-3 text-xs text-slate-500">Обновлено: {updated}</p>
    </Link>
  );
}
