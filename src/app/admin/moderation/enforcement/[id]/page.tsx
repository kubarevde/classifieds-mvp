"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import Link from "next/link";
import { AdminDetailPageShell } from "@/components/admin/AdminDetailPageShell";
import { AdminEntityMeta } from "@/components/admin/AdminEntityMeta";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { ModerationShell } from "@/components/moderation/ModerationShell";
import { EnforcementReviewCard } from "@/components/moderation/EnforcementReviewCard";
import { ModerationDecisionBar } from "@/components/moderation/ModerationDecisionBar";
import { ModerationTimeline } from "@/components/moderation/ModerationTimeline";
import { ReviewerNotesPanel } from "@/components/moderation/ReviewerNotesPanel";
import { getDemoBuyerPersonaSellerId, DEMO_STOREFRONT_SELLER_ID } from "@/lib/demo-role-constants";
import { getAppealById, getEnforcementActionById, getUserAppeals } from "@/services/enforcement";
import { addModerationNote, getModerationNotes, getModerationTimeline } from "@/services/moderation";

const reviewer = "moderator.ivan";

export default function AdminModerationEnforcementDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [, rerender] = useState(0);
  const action = getEnforcementActionById(id);
  const allAppeals = [...getUserAppeals(DEMO_STOREFRONT_SELLER_ID), ...getUserAppeals(getDemoBuyerPersonaSellerId())];
  const relatedAppeal = allAppeals.find((appeal) => appeal.enforcementActionId === id) ?? null;

  const syntheticCaseId = `enf-${id}`;
  const notes = getModerationNotes(syntheticCaseId);
  const timeline = getModerationTimeline(syntheticCaseId);

  if (!action) {
    return (
      <ModerationShell>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">Проверьте id решения.</div>
      </ModerationShell>
    );
  }

  return (
    <ModerationShell>
      <AdminDetailPageShell
        breadcrumbs={[
          { label: "Модерация", href: "/admin/moderation" },
          { label: "Enforcement", href: "/admin/moderation/enforcement" },
          { label: `#${action.id}` },
        ]}
        title={`Enforcement ${action.id}`}
        subtitle="Lifecycle решения: статус, appeal context, reviewer history."
        summaryMeta={
          <AdminEntityMeta
            items={[
              { label: "Статус", value: action.status },
              { label: "Тип", value: action.actionType },
              { label: "Target", value: action.targetType },
              { label: "Причина", value: action.reasonTitle },
            ]}
          />
        }
        stickyActions={
          <ModerationDecisionBar
            onDecision={(decision, note) => {
              addModerationNote(syntheticCaseId, {
                author: reviewer,
                body: `Decision: ${decision}${note ? ` · ${note}` : ""}`,
              });
              rerender((x) => x + 1);
            }}
            actions={[
              { decision: "approve", label: "Lift action" },
              { decision: "request_more_info", label: "Extend action" },
              { decision: "escalate", label: "Escalate" },
            ]}
          />
        }
        main={
          <>
            <EnforcementReviewCard
            item={{
              id: action.id,
              queueType: "safety_report",
              targetId: action.targetId,
              targetLabel: action.targetLabel,
              targetType: action.targetType,
              priority: "medium",
              status: "in_review",
              assignedTo: reviewer,
              createdAt: action.createdAt,
              updatedAt: action.createdAt,
              summary: action.reasonTitle,
            }}
          />
          <AdminPageSection title="Контекст решения">
            <p>
              actionType: <span className="font-semibold text-slate-900">{action.actionType}</span>
            </p>
            <p className="mt-1">reason: {action.reasonTitle}</p>
            <p className="mt-1">createdAt: {new Date(action.createdAt).toLocaleString("ru-RU")}</p>
            <p className="mt-1">
              expiresAt: {action.expiresAt ? new Date(action.expiresAt).toLocaleString("ru-RU") : "n/a"}
            </p>
            <p className="mt-2 font-semibold text-slate-900">Related appeal</p>
            <p className="mt-1 text-slate-600">
              {relatedAppeal
                ? `${relatedAppeal.id} · ${relatedAppeal.status}`
                : "Связанного обращения на пересмотр не найдено."}
            </p>
            {relatedAppeal ? <p className="mt-1 text-xs text-slate-500">message: {getAppealById(relatedAppeal.id)?.message}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/enforcement/actions/${action.id}`} className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700">Детали решения (public)</Link>
              {relatedAppeal ? <Link href={`/enforcement/appeals/${relatedAppeal.id}`} className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700">Связанный appeal</Link> : null}
              {action.targetType === "listing" ? <Link href={`/listings/${action.targetId}`} className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700">Открыть объявление</Link> : null}
            </div>
          </AdminPageSection>
          </>
        }
        side={
          <ReviewerNotesPanel
            notes={notes}
            reviewer={reviewer}
            caseId={syntheticCaseId}
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

