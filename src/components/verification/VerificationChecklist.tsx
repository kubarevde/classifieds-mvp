"use client";

import { Check, Clock3 } from "lucide-react";

import type { VerificationRequirement } from "@/services/verification/types";

export function VerificationChecklist({ requirements }: { requirements: VerificationRequirement[] }) {
  if (!requirements.length) {
    return <p className="text-sm text-slate-600">Пока нет требований.</p>;
  }

  return (
    <ul className="space-y-2">
      {requirements.map((req) => (
        <li key={req.id} className="flex items-start gap-2">
          <span
            className={[
              "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
              req.completed
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-white text-slate-500",
            ].join(" ")}
          >
            {req.completed ? <Check className="h-4 w-4" strokeWidth={2.2} aria-hidden /> : <Clock3 className="h-4 w-4" strokeWidth={2.2} aria-hidden />}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{req.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{req.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

