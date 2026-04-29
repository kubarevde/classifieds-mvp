import type { SafetyReport } from "@/services/safety";
import { safetyStatusLabelRu } from "@/services/safety";
import { cn } from "@/components/ui/cn";

type SafetyCaseThreadProps = {
  report: SafetyReport;
};

type Milestone = { key: string; title: string; at: string | null; pending?: boolean };

function buildMilestones(report: SafetyReport): Milestone[] {
  const created = new Date(report.createdAt).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const updated = new Date(report.updatedAt).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const afterSubmitted =
    report.status === "submitted"
      ? null
      : report.status === "under_review"
        ? updated
        : updated;

  const reviewDone = report.status === "under_review" || report.status === "action_taken" || report.status === "resolved" || report.status === "closed";

  const actionDone = report.status === "action_taken" || report.status === "resolved" || report.status === "closed";

  return [
    { key: "m1", title: safetyStatusLabelRu("submitted"), at: created },
    {
      key: "m2",
      title: safetyStatusLabelRu("under_review"),
      at: reviewDone ? afterSubmitted : null,
      pending: !reviewDone,
    },
    {
      key: "m3",
      title:
        report.status === "closed"
          ? safetyStatusLabelRu("closed")
          : report.status === "resolved"
            ? safetyStatusLabelRu("resolved")
            : safetyStatusLabelRu("action_taken"),
      at: actionDone ? updated : null,
      pending: !actionDone,
    },
  ];
}

export function SafetyCaseThread({ report }: SafetyCaseThreadProps) {
  const milestones = buildMilestones(report);

  return (
    <ol className="space-y-4 border-l-2 border-slate-200 pl-4">
      {milestones.map((m, idx) => (
        <li key={m.key} className="relative">
          <span
            className={cn(
              "absolute -left-[calc(0.5rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full border-2",
              m.at ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white",
              idx === milestones.length - 1 && m.at && "ring-2 ring-blue-100",
            )}
            aria-hidden
          />
          <p className={cn("text-sm font-semibold", m.at ? "text-slate-900" : "text-slate-400")}>{m.title}</p>
          <p className="text-xs text-slate-500">{m.at ?? (m.pending ? "Ожидается после проверки" : "—")}</p>
        </li>
      ))}
    </ol>
  );
}
