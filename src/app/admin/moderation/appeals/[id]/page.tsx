"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { AdminDetailPageShell } from "@/components/admin/AdminDetailPageShell";
import { AdminEntityMeta } from "@/components/admin/AdminEntityMeta";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { ModerationShell } from "@/components/moderation/ModerationShell";
import { CaseReviewPanel } from "@/components/moderation/CaseReviewPanel";
import { ModerationDecisionBar } from "@/components/moderation/ModerationDecisionBar";
import { ModerationTimeline } from "@/components/moderation/ModerationTimeline";
import { ReviewerNotesPanel } from "@/components/moderation/ReviewerNotesPanel";
import {
  addModerationNote,
  assignModerationCase,
  getModerationItem,
  getModerationNotes,
  getModerationTimeline,
  resolveModerationCase,
} from "@/services/moderation";

const reviewer = "moderator.alina";

export default function AdminModerationAppealDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [, rerender] = useState(0);
  const item = getModerationItem(id);
  const notes = getModerationNotes(id);
  const timeline = getModerationTimeline(id);

  if (!item) {
    return (
      <ModerationShell>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">Проверьте id обращения.</div>
      </ModerationShell>
    );
  }

  return (
    <ModerationShell>
      <AdminDetailPageShell
        breadcrumbs={[
          { label: "Модерация", href: "/admin/moderation" },
          { label: "Appeals", href: "/admin/moderation/appeals" },
          { label: `#${item.id}` },
        ]}
        title={`Appeal ${item.id}`}
        subtitle="Отдельный review обращения на пересмотр с контекстом исходного решения."
        summaryMeta={
          <AdminEntityMeta
            items={[
              { label: "Статус", value: item.status },
              { label: "Приоритет", value: item.priority },
              { label: "Назначено", value: item.assignedTo ?? "—" },
              { label: "Target", value: item.targetLabel },
            ]}
          />
        }
        stickyActions={
          <ModerationDecisionBar
            onDecision={(decision, note) => {
              resolveModerationCase({ caseId: item.id, decision, note });
              rerender((x) => x + 1);
            }}
            actions={[
              { decision: "uphold_action", label: "Uphold action" },
              { decision: "reverse_action", label: "Reverse action" },
              { decision: "request_more_info", label: "Request more info" },
              { decision: "escalate", label: "Escalate" },
            ]}
          />
        }
        main={
          <>
            <CaseReviewPanel item={item} />
            <AdminPageSection title="Appeal context">
            <h3 className="text-sm font-semibold text-slate-900">Appeal context</h3>
            <p className="mt-1 text-sm text-slate-600">
              На этой странице собран контекст обращения и исходного решения платформы.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  assignModerationCase(item.id, reviewer);
                  rerender((x) => x + 1);
                }}
                className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white"
              >
                Взять в review
              </button>
              <Link href="/enforcement/appeals" className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700">
                Appeals (public)
              </Link>
              <Link href="/enforcement/actions" className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700">
                Enforcement actions
              </Link>
            </div>
            </AdminPageSection>
          </>
        }
        side={
          <ReviewerNotesPanel
            notes={notes}
            reviewer={reviewer}
            caseId={item.id}
            onAdd={(caseId, input) => {
              addModerationNote(caseId, input);
              rerender((x) => x + 1);
            }}
          />
        }
        timelineAndNotes={<ModerationTimeline events={timeline} />}
      />
    </ModerationShell>
  );
}

