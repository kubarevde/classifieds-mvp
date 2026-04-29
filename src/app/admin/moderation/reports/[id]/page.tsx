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

export default function AdminModerationReportDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [, rerender] = useState(0);
  const item = getModerationItem(id);
  const notes = getModerationNotes(id);
  const timeline = getModerationTimeline(id);

  if (!item) {
    return (
      <ModerationShell>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">Кейс не найден.</p>
          <Link href="/admin/moderation/reports" className="mt-2 inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700">
            Назад к очереди
          </Link>
        </div>
      </ModerationShell>
    );
  }

  return (
    <ModerationShell>
      <AdminDetailPageShell
        breadcrumbs={[
          { label: "Модерация", href: "/admin/moderation" },
          { label: "Жалобы", href: "/admin/moderation/reports" },
          { label: `#${item.id}` },
        ]}
        title={`Жалоба ${item.id}`}
        subtitle="Review workflow: context, decision, notes."
        summaryMeta={
          <AdminEntityMeta
            items={[
              { label: "Статус", value: item.status },
              { label: "Приоритет", value: item.priority },
              { label: "Назначено", value: item.assignedTo ?? "—" },
              { label: "Тип", value: item.targetType },
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
              { decision: "warn_user", label: "Вынести предупреждение" },
              { decision: "hide_content", label: "Скрыть контент" },
              { decision: "remove_content", label: "Удалить контент", destructive: true },
              { decision: "escalate", label: "Эскалировать" },
              { decision: "approve", label: "Закрыть без действия" },
            ]}
          />
        }
        main={
          <>
            <CaseReviewPanel item={item} />
            <AdminPageSection title="Контекст и evidence">
            <p className="mt-1 text-sm text-slate-600">
              Reporter summary, target info and linked evidence are shown here in mock mode.
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
              <Link href="/safety/reports" className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
                Жалобы (public)
              </Link>
              <Link href={item.targetType === "listing" ? `/listings/${item.targetId}` : item.targetType === "store" ? `/stores/${item.targetId}` : `/safety/reports/${item.targetId}`} className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
                Открыть target
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

