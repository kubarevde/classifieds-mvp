"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import Link from "next/link";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
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
import { moderationTargetToAdminHref } from "@/lib/admin-moderation-cross-links";
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
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <p className="font-medium text-slate-900">Решение не найдено</p>
          <p className="mt-1 text-slate-600">Проверьте идентификатор в URL.</p>
          <AdminInternalLink href="/admin/moderation/enforcement" className="mt-3 inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white">
            К очереди enforcement
          </AdminInternalLink>
        </div>
      </ModerationShell>
    );
  }

  const targetAdminHref = moderationTargetToAdminHref(action.targetType, action.targetId);

  return (
    <ModerationShell>
      <AdminDetailPageShell
        breadcrumbs={[
          { label: "Модерация", href: "/admin/moderation" },
          { label: "Санкции", href: "/admin/moderation/enforcement" },
          { label: `#${action.id}` },
        ]}
        title={`Санкция ${action.id}`}
        subtitle="Жизненный цикл решения: статус, апелляция, история разбора."
        summaryMeta={
          <AdminEntityMeta
            items={[
              { label: "Статус", value: action.status },
              { label: "Тип", value: action.actionType },
              { label: "Тип объекта", value: action.targetType },
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
              { decision: "approve", label: "Снять санкцию" },
              { decision: "request_more_info", label: "Продлить / уточнить" },
              { decision: "escalate", label: "Эскалировать" },
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
              Истекает: {action.expiresAt ? new Date(action.expiresAt).toLocaleString("ru-RU") : "—"}
            </p>
            <p className="mt-2 font-semibold text-slate-900">Связанная апелляция</p>
            <p className="mt-1 text-slate-600">
              {relatedAppeal
                ? `${relatedAppeal.id} · ${relatedAppeal.status}`
                : "Связанного обращения на пересмотр не найдено."}
            </p>
            {relatedAppeal ? <p className="mt-1 text-xs text-slate-500">Текст: {getAppealById(relatedAppeal.id)?.message}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/enforcement/actions/${action.id}`} className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700">
                Публичная карточка решения
              </Link>
              {relatedAppeal ? (
                <Link href={`/enforcement/appeals/${relatedAppeal.id}`} className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700">
                  Публичная апелляция
                </Link>
              ) : null}
              {targetAdminHref ? (
                <AdminInternalLink href={targetAdminHref} className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
                  Объект в консоли
                </AdminInternalLink>
              ) : null}
              {action.targetType === "listing" ? (
                <Link href={`/listings/${action.targetId}`} className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700">
                  Публичное объявление
                </Link>
              ) : null}
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

