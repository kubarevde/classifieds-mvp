"use client";

import { cn } from "@/components/ui/cn";
import type { AppealCase, AppealStatus } from "@/services/enforcement/types";

function titleForStatus(status: AppealStatus): string {
  switch (status) {
    case "submitted":
      return "Отправлено";
    case "in_review":
      return "На рассмотрении";
    case "upheld":
      return "Решение в силе";
    case "rejected":
      return "Пересмотрено";
    case "resolved":
      return "Закрыто";
    default:
      return "Статус";
  }
}

export function AppealTimeline({ appeal }: { appeal: AppealCase }) {
  const submittedAt = appeal.createdAt;
  const inReviewAt = appeal.status === "in_review" ? appeal.updatedAt : appeal.status === "submitted" ? null : appeal.updatedAt;
  const finalAt = appeal.status === "submitted" ? null : appeal.updatedAt;

  const steps: { key: string; label: string; at: string | null; pending: boolean }[] = [
    { key: "submitted", label: titleForStatus("submitted"), at: submittedAt, pending: false },
    { key: "in_review", label: titleForStatus("in_review"), at: inReviewAt, pending: appeal.status === "submitted" },
    {
      key: "final",
      label:
        appeal.status === "in_review"
          ? "Ожидает решения"
          : appeal.status === "upheld"
            ? titleForStatus("upheld")
            : appeal.status === "rejected"
              ? titleForStatus("rejected")
              : titleForStatus("resolved"),
      at: finalAt,
      pending: appeal.status === "in_review" || appeal.status === "submitted",
    },
  ];

  return (
    <ol className="space-y-4 border-l-2 border-slate-200 pl-4">
      {steps.map((s, idx) => (
        <li key={s.key} className="relative">
          <span
            className={cn(
              "absolute -left-[calc(0.5rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full border-2",
              s.at ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white",
              idx === steps.length - 1 && s.at && "ring-2 ring-blue-100",
            )}
            aria-hidden
          />
          <p className={cn("text-sm font-semibold", s.at ? "text-slate-900" : "text-slate-400")}>{s.label}</p>
          <p className="text-xs text-slate-500">{s.at ?? (s.pending ? "Ожидается" : "—")}</p>
        </li>
      ))}
    </ol>
  );
}

