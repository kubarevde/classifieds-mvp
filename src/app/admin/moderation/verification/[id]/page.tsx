"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { AdminDetailPageShell } from "@/components/admin/AdminDetailPageShell";
import { AdminEntityMeta } from "@/components/admin/AdminEntityMeta";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { ModerationShell } from "@/components/moderation/ModerationShell";
import { VerificationReviewCard } from "@/components/moderation/VerificationReviewCard";
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

const reviewer = "moderator.ivan";

export default function AdminModerationVerificationDetailPage() {
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
          <AdminInternalLink href="/admin/moderation/verification" className="mt-3 inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white">
            К очереди верификации
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
          { label: "Верификация", href: "/admin/moderation/verification" },
          { label: `#${item.id}` },
        ]}
        title={`Верификация ${item.id}`}
        subtitle="Проверка статуса и принятых данных по подтверждению профиля."
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
              { decision: "approve", label: "Подтвердить" },
              { decision: "reject", label: "Отклонить" },
              { decision: "request_more_info", label: "Запросить данные" },
            ]}
          />
        }
        main={
          <>
            <VerificationReviewCard item={item} />
            <AdminPageSection title="Проверка данных">
            <h3 className="text-sm font-semibold text-slate-900">Поданные требования</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>Документы магазина</li>
              <li>Адрес и контактные данные</li>
              <li>Проверка соответствия уровня/статуса</li>
            </ul>
            <button
              type="button"
              onClick={() => {
                assignModerationCase(item.id, reviewer);
                rerender((x) => x + 1);
              }}
              className="mt-3 inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white"
            >
              Взять в разбор
            </button>
              <div className="mt-3 flex flex-wrap gap-2">
                {targetAdminHref ? (
                  <AdminInternalLink href={targetAdminHref} className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
                    Открыть объект в консоли
                  </AdminInternalLink>
                ) : null}
                <Link href="/verification/status" className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
                  Статус (публично)
                </Link>
                <Link href="/verification/business" className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
                  Поток магазина (публично)
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

