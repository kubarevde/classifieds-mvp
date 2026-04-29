export type ModerationQueueType =
  | "safety_report"
  | "verification_case"
  | "appeal_case"
  | "risk_case";

export type ModerationPriority = "low" | "medium" | "high" | "urgent";

export type ModerationCaseStatus =
  | "new"
  | "in_review"
  | "awaiting_info"
  | "resolved"
  | "escalated";

export type ModerationDecision =
  | "approve"
  | "reject"
  | "request_more_info"
  | "warn_user"
  | "hide_content"
  | "remove_content"
  | "suspend_account"
  | "reverse_action"
  | "uphold_action"
  | "escalate";

export interface ModerationQueueItem {
  id: string;
  queueType: ModerationQueueType;
  targetId: string;
  targetLabel: string;
  targetType: "listing" | "store" | "user" | "request" | "message";
  priority: ModerationPriority;
  status: ModerationCaseStatus;
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
  summary: string;
}

export interface ModerationCaseNote {
  id: string;
  caseId: string;
  author: string;
  createdAt: string;
  body: string;
}

export interface ModerationDecisionInput {
  caseId: string;
  decision: ModerationDecision;
  note?: string;
}

export type ModerationTimelineEvent = {
  id: string;
  caseId: string;
  actor: string;
  createdAt: string;
  type: "assigned" | "status_changed" | "decision" | "note";
  body: string;
};

export type ModerationQueueFilters = {
  queueType?: ModerationQueueType | "all";
  status?: ModerationCaseStatus | "all";
  priority?: ModerationPriority | "all";
  targetType?: ModerationQueueItem["targetType"] | "all";
  assignedTo?: "mine" | "unassigned" | "all" | string;
  reviewer?: string;
  search?: string;
};

export type ModerationStats = {
  newReports: number;
  verificationInReview: number;
  appealsInReview: number;
  urgentOrHigh: number;
  avgResolutionHours: number;
  reviewSharePercent: number;
};

