"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
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
import { moderationTargetToAdminHref } from "@/lib/admin-moderation-cross-links";

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
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <p className="font-medium text-slate-900">Кейс не найден</p>
          <p className="mt-1 text-slate-600">Проверьте идентификатор в URL.</p>
          <AdminInternalLink href="/admin/moderation/appeals" className="mt-3 inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white">
            К списку апелляций
          </AdminInternalLink>
        </div>
      </ModerationShell>
    );
  }

  const targetAdminHref = moderationTargetToAdminHref(item.targetType, item.targetId);

  return (
    <ModerationShell>
      <AdminDetailPageShell
        breadcrumbs={[
          { label: "Модерация", href: "/admin/moderation" },
          { label: "Апелляции", href: "/admin/moderation/appeals" },
          { label: `#${item.id}` },
        ]}
        title={`Апелляция ${item.id}`}
        subtitle="Разбор обращения на пересмотр с контекстом исходного решения."
        summaryMeta={
          <AdminEntityMeta
            items={[
              { label: "Статус", value: item.status },
              { label: "Приоритет", value: item.priority },
              { label: "Назначено", value: item.assignedTo ?? "—" },
              { label: "Объект", value: item.targetLabel },
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
              { decision: "uphold_action", label: "Оставить решение" },
              { decision: "reverse_action", label: "Отменить действие" },
              { decision: "request_more_info", label: "Запросить данные" },
              { decision: "escalate", label: "Эскалировать" },
            ]}
          />
        }
        main={
          <>
            <CaseReviewPanel item={item} />
            <AdminPageSection title="Контекст апелляции">
            <h3 className="text-sm font-semibold text-slate-900">Материалы</h3>
            <p className="mt-1 text-sm text-slate-600">
              Контекст обращения и исходного решения платформы (mock).
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
                Взять в разбор
              </button>
              {targetAdminHref ? (
                <AdminInternalLink href={targetAdminHref} className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
                  Открыть объект в консоли
                </AdminInternalLink>
              ) : null}
              <Link href="/enforcement/appeals" className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700">
                Публичные апелляции
              </Link>
              <Link href="/enforcement/actions" className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700">
                Публичные санкции
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

