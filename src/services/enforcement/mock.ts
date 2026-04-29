import type { AppealCase, EnforcementAction, EnforcementTargetType } from "./types";

function nowIso() {
  return new Date().toISOString();
}

function addDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

// -----------------------
// Seed data (mock / in-memory)
// -----------------------

const DEMO_BUYER_ID = "buyer-dmitriy";
const DEMO_SELLER_ID = "marina-tech";

const enforcementActionsState: EnforcementAction[] = [
  {
    id: "ea-1",
    userId: DEMO_BUYER_ID,
    targetType: "listing",
    targetId: "listing-demo-1",
    targetLabel: "iPhone 14 Pro — подозрительно низкая цена",
    actionType: "warning",
    reasonCode: "fraud_suspected",
    reasonTitle: "Подозрение на мошенничество",
    policySummary: "Система обнаружила риск мошеннических действий по описанию/контексту жалобы (mock).",
    status: "active",
    createdAt: "2026-04-21T10:00:00.000Z",
    expiresAt: addDays(7),
  },
  {
    id: "ea-2",
    userId: DEMO_BUYER_ID,
    targetType: "store",
    targetId: DEMO_SELLER_ID,
    targetLabel: "Marina Select",
    actionType: "content_hidden",
    reasonCode: "counterfeit_suspected",
    reasonTitle: "Подозрение на контрафакт",
    policySummary: "Определённый контент временно скрыт до уточнения информации (mock).",
    status: "active",
    createdAt: "2026-04-18T11:00:00.000Z",
    expiresAt: addDays(10),
  },
  {
    id: "ea-3",
    userId: DEMO_SELLER_ID,
    targetType: "listing",
    targetId: "2",
    targetLabel: "Смартфон Samsung S23 — пересмотр",
    actionType: "content_removed",
    reasonCode: "prohibited_content",
    reasonTitle: "Запрещённые формулировки/контент",
    policySummary: "Объявление удалено из выдачи из-за несоответствия требованиям (mock).",
    status: "expired",
    createdAt: "2026-04-12T09:00:00.000Z",
    expiresAt: "2026-04-26T09:00:00.000Z",
  },
  {
    id: "ea-4",
    userId: DEMO_SELLER_ID,
    targetType: "store",
    targetId: DEMO_SELLER_ID,
    targetLabel: "Marina Select",
    actionType: "verification_required",
    reasonCode: "verification_needed",
    reasonTitle: "Нужно подтверждение профиля",
    policySummary: "Для некоторых категорий и сценариев публикации нужен подтверждённый профиль (mock).",
    status: "active",
    createdAt: "2026-04-27T09:00:00.000Z",
    expiresAt: addDays(12),
  },
];

let appealsState: AppealCase[] = [
  {
    id: "ap-1",
    enforcementActionId: "ea-1",
    userId: DEMO_BUYER_ID,
    message: "Прошу пересмотреть решение. Цена соответствует состоянию товара, готов предоставить дополнительные детали.",
    status: "in_review",
    createdAt: "2026-04-22T14:20:00.000Z",
    updatedAt: "2026-04-25T09:10:00.000Z",
    resolutionNote: null,
  },
  {
    id: "ap-2",
    enforcementActionId: "ea-3",
    userId: DEMO_SELLER_ID,
    message: "Запрос на пересмотр: формулировки будут скорректированы. Прошу вернуть объявление в выдачу после проверки.",
    status: "resolved",
    createdAt: "2026-04-13T12:00:00.000Z",
    updatedAt: "2026-04-20T16:30:00.000Z",
    resolutionNote: "После проверки уточнений объявление принято к повторной публикации (mock).",
  },
];

// -----------------------
// Helpers
// -----------------------

export function getUserEnforcementActions(userId: string): EnforcementAction[] {
  return enforcementActionsState
    .filter((a) => a.userId === userId)
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getEnforcementActionById(id: string): EnforcementAction | null {
  return enforcementActionsState.find((a) => a.id === id) ?? null;
}

export function getUserAppeals(userId: string): AppealCase[] {
  return appealsState
    .filter((a) => a.userId === userId)
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getAppealById(id: string): AppealCase | null {
  return appealsState.find((a) => a.id === id) ?? null;
}

function isAppealForActionExisting(userId: string, enforcementActionId: string) {
  return appealsState.some((ap) => ap.userId === userId && ap.enforcementActionId === enforcementActionId);
}

export function getAppealableActions(input: {
  userId: string;
  enforcementActionId?: string;
  targetType?: EnforcementTargetType;
  targetId?: string;
}): EnforcementAction[] {
  const all = getUserEnforcementActions(input.userId);
  return all.filter((a) => {
    if (a.status !== "active") return false;
    if (input.enforcementActionId && a.id !== input.enforcementActionId) return false;
    if (input.targetType && a.targetType !== input.targetType) return false;
    if (input.targetId && a.targetId !== input.targetId) return false;
    if (isAppealForActionExisting(input.userId, a.id)) return false;
    return true;
  });
}

export function createAppeal(input: { userId: string; enforcementActionId: string; message: string; evidenceNote?: string | null }): AppealCase {
  const action = getEnforcementActionById(input.enforcementActionId);
  if (!action) {
    throw new Error("enforcement action not found");
  }
  if (action.userId !== input.userId) {
    throw new Error("enforcement action is not owned by user");
  }
  if (!getAppealableActions({ userId: input.userId, enforcementActionId: input.enforcementActionId }).length) {
    throw new Error("appeal is not allowed");
  }

  const id = `ap-${Math.floor(Math.random() * 1_000_000)}`;
  const created = nowIso();
  const evidenceText = input.evidenceNote?.trim();
  const appeal: AppealCase = {
    id,
    enforcementActionId: input.enforcementActionId,
    userId: input.userId,
    message: evidenceText ? `${input.message}\n\nДоказательства (mock): ${evidenceText}` : input.message,
    status: "submitted",
    createdAt: created,
    updatedAt: created,
    resolutionNote: null,
  };
  appealsState = [appeal, ...appealsState];
  return appeal;
}

export function getAppealAvailabilityReason(action: EnforcementAction, existingAppeal?: AppealCase | null): string {
  if (existingAppeal) {
    if (existingAppeal.status === "submitted" || existingAppeal.status === "in_review") {
      return "Обращение уже отправлено и находится на рассмотрении.";
    }
    return "Для этого решения обращение на пересмотр уже недоступно.";
  }
  if (action.status !== "active") {
    return "Решение больше не активно.";
  }
  return "Обращение на пересмотр доступно, пока решение активно.";
}

