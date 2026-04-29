import type { ReportReason, ReportTargetType } from "@/services/safety";

const listingStore: ReportReason[] = [
  "fake_listing",
  "counterfeit",
  "prohibited_item",
  "fraud",
  "spam",
  "other",
];

const userMessage: ReportReason[] = ["harassment", "spam", "impersonation", "fraud", "other"];

const transaction: ReportReason[] = ["payment_issue", "fraud", "unsafe_item", "other"];

export function getReportReasonsForTarget(targetType: ReportTargetType): ReportReason[] {
  switch (targetType) {
    case "listing":
    case "store":
      return listingStore;
    case "user":
    case "message":
      return userMessage;
    case "request":
      return Array.from(new Set<ReportReason>([...listingStore, ...userMessage]));
    case "transaction":
      return transaction;
    default:
      return ["other"];
  }
}

export const reportReasonLabels: Record<ReportReason, string> = {
  fraud: "Мошенничество / обман",
  fake_listing: "Фейковое или вводящее в заблуждение объявление",
  counterfeit: "Подделка / контрафакт",
  spam: "Спам или навязчивая реклама",
  harassment: "Оскорбления, угрозы, преследование",
  unsafe_item: "Небезопасный товар или услуга",
  prohibited_item: "Запрещённый товар или услуга",
  payment_issue: "Проблема с оплатой / возвратом",
  impersonation: "Выдача себя за другое лицо / бренд",
  other: "Другое",
};
