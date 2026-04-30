import {
  type ModerationCaseNote,
  type ModerationCaseStatus,
  type ModerationDecision,
  type ModerationDecisionInput,
  type ModerationPriority,
  type ModerationQueueFilters,
  type ModerationQueueItem,
  type ModerationStats,
  type ModerationTimelineEvent,
} from "./types";

function nowIso() {
  return new Date().toISOString();
}

const seedQueue: ModerationQueueItem[] = [
  {
    id: "mr-1001",
    queueType: "safety_report",
    targetId: "safety-seed-2",
    targetLabel: "Жалоба: Marina Select / контрафакт",
    targetType: "store",
    priority: "urgent",
    status: "new",
    assignedTo: null,
    createdAt: "2026-04-28T08:35:00.000Z",
    updatedAt: "2026-04-28T08:35:00.000Z",
    summary: "Жалоба с action_taken и повторяющимися признаками по одному магазину.",
  },
  {
    id: "mr-1002",
    queueType: "safety_report",
    targetId: "safety-seed-3",
    targetLabel: "Жалоба: переписка buyer/seller",
    targetType: "message",
    priority: "high",
    status: "in_review",
    assignedTo: "moderator.alina",
    createdAt: "2026-04-28T16:45:00.000Z",
    updatedAt: "2026-04-29T06:10:00.000Z",
    summary: "Оскорбления в переписке, проверка контекста и эскалация при повторении.",
  },
  {
    id: "mv-2001",
    queueType: "verification_case",
    targetId: "store:marina-tech",
    targetLabel: "Подтверждение магазина: Marina Select",
    targetType: "store",
    priority: "high",
    status: "in_review",
    assignedTo: "moderator.ivan",
    createdAt: "2026-04-27T10:15:00.000Z",
    updatedAt: "2026-04-29T04:20:00.000Z",
    summary: "Пакет документов магазина в очереди на проверку.",
  },
  {
    id: "mv-2002",
    queueType: "verification_case",
    targetId: "seller:buyer-dmitriy",
    targetLabel: "Подтверждение личности: Дмитрий П.",
    targetType: "user",
    priority: "medium",
    status: "awaiting_info",
    assignedTo: "moderator.alina",
    createdAt: "2026-04-26T13:00:00.000Z",
    updatedAt: "2026-04-28T11:25:00.000Z",
    summary: "Нужны дополнительные материалы по шагу identity.",
  },
  {
    id: "ma-3001",
    queueType: "appeal_case",
    targetId: "ap-1",
    targetLabel: "Обращение на пересмотр по ea-1",
    targetType: "listing",
    priority: "medium",
    status: "in_review",
    assignedTo: "moderator.ivan",
    createdAt: "2026-04-25T09:10:00.000Z",
    updatedAt: "2026-04-29T05:10:00.000Z",
    summary: "Обращение пользователя по предупреждению о риске мошенничества.",
  },
  {
    id: "ma-3002",
    queueType: "appeal_case",
    targetId: "ap-2",
    targetLabel: "Обращение на пересмотр по ea-3",
    targetType: "listing",
    priority: "low",
    status: "resolved",
    assignedTo: "moderator.alina",
    createdAt: "2026-04-20T16:30:00.000Z",
    updatedAt: "2026-04-22T10:05:00.000Z",
    summary: "Итог по пересмотру уже внесён и закрыт.",
  },
  {
    id: "mk-4001",
    queueType: "risk_case",
    targetId: "listing:2",
    targetLabel: "Риск-кейс: Samsung S23 / low price",
    targetType: "listing",
    priority: "high",
    status: "new",
    assignedTo: null,
    createdAt: "2026-04-29T05:40:00.000Z",
    updatedAt: "2026-04-29T05:40:00.000Z",
    summary: "Сигналы: цена ниже baseline + off-platform wording в сообщениях.",
  },
];

const queueState = seedQueue.map((item) => ({ ...item }));

let notesState: ModerationCaseNote[] = [
  {
    id: "note-1",
    caseId: "mr-1002",
    author: "moderator.alina",
    createdAt: "2026-04-29T06:15:00.000Z",
    body: "Проверяю контекст переписки и историю жалоб по пользователю.",
  },
  {
    id: "note-2",
    caseId: "mv-2001",
    author: "moderator.ivan",
    createdAt: "2026-04-29T04:30:00.000Z",
    body: "Документы загружены, сверяю адрес и реквизиты.",
  },
];

let timelineState: ModerationTimelineEvent[] = [
  {
    id: "tl-1",
    caseId: "mr-1002",
    actor: "system",
    createdAt: "2026-04-28T16:45:00.000Z",
    type: "status_changed",
    body: "Кейс создан и добавлен в очередь safety_report.",
  },
  {
    id: "tl-2",
    caseId: "mr-1002",
    actor: "moderator.alina",
    createdAt: "2026-04-29T06:10:00.000Z",
    type: "assigned",
    body: "Кейс взят в review.",
  },
  {
    id: "tl-3",
    caseId: "mv-2002",
    actor: "moderator.alina",
    createdAt: "2026-04-28T11:25:00.000Z",
    type: "decision",
    body: "Запрошены дополнительные материалы.",
  },
];

function priorityRank(priority: ModerationPriority) {
  if (priority === "urgent") return 0;
  if (priority === "high") return 1;
  if (priority === "medium") return 2;
  return 3;
}

function matchesFilter(item: ModerationQueueItem, filters?: ModerationQueueFilters): boolean {
  if (!filters) return true;
  if (filters.queueType && filters.queueType !== "all" && item.queueType !== filters.queueType) return false;
  if (filters.status && filters.status !== "all" && item.status !== filters.status) return false;
  if (filters.priority && filters.priority !== "all" && item.priority !== filters.priority) return false;
  if (filters.targetType && filters.targetType !== "all" && item.targetType !== filters.targetType) return false;
  if (filters.assignedTo === "unassigned" && item.assignedTo) return false;
  if (filters.assignedTo === "mine" && filters.reviewer && item.assignedTo !== filters.reviewer) return false;
  if (typeof filters.assignedTo === "string" && !["all", "mine", "unassigned"].includes(filters.assignedTo) && item.assignedTo !== filters.assignedTo) return false;
  if (filters.search) {
    const term = filters.search.toLowerCase();
    const queueAlias =
      item.queueType === "appeal_case"
        ? "appeal appeals пересмотр"
        : item.queueType === "verification_case"
          ? "verification верификация"
          : item.queueType === "safety_report"
            ? "report жалоба"
            : "risk риск";
    const hay = `${item.id} ${item.targetLabel} ${item.summary} ${item.queueType} ${queueAlias}`.toLowerCase();
    if (!hay.includes(term)) return false;
  }
  return true;
}

function pushTimeline(caseId: string, actor: string, type: ModerationTimelineEvent["type"], body: string) {
  timelineState = [
    {
      id: `tl-${Math.random().toString(36).slice(2, 10)}`,
      caseId,
      actor,
      createdAt: nowIso(),
      type,
      body,
    },
    ...timelineState,
  ];
}

function decisionToStatus(decision: ModerationDecision): ModerationCaseStatus {
  if (decision === "request_more_info") return "awaiting_info";
  if (decision === "escalate") return "escalated";
  return "resolved";
}

function decisionLabel(decision: ModerationDecision): string {
  switch (decision) {
    case "approve":
      return "Одобрено";
    case "reject":
      return "Отклонено";
    case "request_more_info":
      return "Запрошена дополнительная информация";
    case "warn_user":
      return "Вынесено предупреждение";
    case "hide_content":
      return "Контент скрыт";
    case "remove_content":
      return "Контент удалён";
    case "suspend_account":
      return "Аккаунт приостановлен";
    case "reverse_action":
      return "Решение отменено";
    case "uphold_action":
      return "Решение оставлено в силе";
    case "escalate":
      return "Кейс эскалирован";
    default:
      return decision;
  }
}

export function getModerationQueue(filters?: ModerationQueueFilters): ModerationQueueItem[] {
  return queueState
    .filter((item) => matchesFilter(item, filters))
    .slice()
    .sort((a, b) => {
      const p = priorityRank(a.priority) - priorityRank(b.priority);
      if (p !== 0) return p;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
}

export function getModerationItem(id: string): ModerationQueueItem | null {
  return queueState.find((item) => item.id === id) ?? null;
}

export function assignModerationCase(id: string, reviewer: string): ModerationQueueItem | null {
  const index = queueState.findIndex((item) => item.id === id);
  if (index < 0) return null;
  const current = queueState[index];
  const next: ModerationQueueItem = {
    ...current,
    assignedTo: reviewer,
    status: current.status === "new" ? "in_review" : current.status,
    updatedAt: nowIso(),
  };
  queueState[index] = next;
  pushTimeline(id, reviewer, "assigned", `Кейс назначен на ${reviewer}.`);
  return next;
}

export function assignModerationCasesBulk(ids: string[], reviewer: string): { updated: number; skipped: number } {
  let updated = 0;
  let skipped = 0;
  for (const id of ids) {
    const r = assignModerationCase(id, reviewer);
    if (r) {
      updated += 1;
    } else {
      skipped += 1;
    }
  }
  return { updated, skipped };
}

export function resolveModerationCase(input: ModerationDecisionInput): ModerationQueueItem | null {
  const index = queueState.findIndex((item) => item.id === input.caseId);
  if (index < 0) return null;
  const current = queueState[index];
  const next: ModerationQueueItem = {
    ...current,
    status: decisionToStatus(input.decision),
    updatedAt: nowIso(),
  };
  queueState[index] = next;
  pushTimeline(input.caseId, next.assignedTo ?? "moderator.system", "decision", `Решение: ${decisionLabel(input.decision)}.`);
  if (input.note?.trim()) {
    addModerationNote(input.caseId, {
      author: next.assignedTo ?? "moderator.system",
      body: input.note.trim(),
    });
  }
  return next;
}

export function addModerationNote(caseId: string, note: { author: string; body: string }): ModerationCaseNote {
  const created: ModerationCaseNote = {
    id: `note-${Math.random().toString(36).slice(2, 10)}`,
    caseId,
    author: note.author,
    body: note.body,
    createdAt: nowIso(),
  };
  notesState = [created, ...notesState];
  pushTimeline(caseId, note.author, "note", "Добавлена reviewer note.");
  return created;
}

export function getModerationNotes(caseId: string): ModerationCaseNote[] {
  return notesState
    .filter((n) => n.caseId === caseId)
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getModerationTimeline(caseId: string): ModerationTimelineEvent[] {
  return timelineState
    .filter((t) => t.caseId === caseId)
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getModerationStats(): ModerationStats {
  const all = queueState;
  const inReview = all.filter((item) => item.status === "in_review").length;
  const resolved = all.filter((item) => item.status === "resolved").length;
  return {
    newReports: all.filter((item) => item.queueType === "safety_report" && item.status === "new").length,
    verificationInReview: all.filter((item) => item.queueType === "verification_case" && item.status === "in_review").length,
    appealsInReview: all.filter((item) => item.queueType === "appeal_case" && item.status === "in_review").length,
    urgentOrHigh: all.filter((item) => item.priority === "urgent" || item.priority === "high").length,
    avgResolutionHours: resolved ? 14 : 0,
    reviewSharePercent: all.length ? Math.round((inReview / all.length) * 100) : 0,
  };
}

