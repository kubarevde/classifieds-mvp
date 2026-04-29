export type EnforcementTargetType = "listing" | "store" | "user" | "request" | "message";

export type EnforcementActionType =
  | "warning"
  | "content_hidden"
  | "content_removed"
  | "account_limited"
  | "account_suspended"
  | "verification_required";

export type EnforcementStatus = "active" | "lifted" | "expired";

export type AppealStatus = "submitted" | "in_review" | "upheld" | "rejected" | "resolved";

export interface EnforcementAction {
  id: string;
  userId: string;
  targetType: EnforcementTargetType;
  targetId: string;
  targetLabel: string;
  actionType: EnforcementActionType;
  reasonCode: string;
  reasonTitle: string;
  policySummary: string;
  status: EnforcementStatus;
  createdAt: string;
  expiresAt?: string | null;
}

export interface AppealCase {
  id: string;
  enforcementActionId: string;
  userId: string;
  message: string;
  status: AppealStatus;
  createdAt: string;
  updatedAt: string;
  resolutionNote?: string | null;
}

