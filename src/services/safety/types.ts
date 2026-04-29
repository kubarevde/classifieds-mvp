export type ReportTargetType =
  | "listing"
  | "store"
  | "user"
  | "request"
  | "message"
  | "transaction"
  | "other";

export type ReportReason =
  | "fraud"
  | "fake_listing"
  | "counterfeit"
  | "spam"
  | "harassment"
  | "unsafe_item"
  | "prohibited_item"
  | "payment_issue"
  | "impersonation"
  | "other";

export type SafetyCaseStatus =
  | "submitted"
  | "under_review"
  | "action_taken"
  | "resolved"
  | "closed";

export interface SafetyEvidence {
  id: string;
  type: "text" | "image" | "link";
  value: string;
}

export interface SafetyReport {
  id: string;
  userId: string;
  targetType: ReportTargetType;
  targetId?: string | null;
  targetLabel?: string | null;
  reason: ReportReason;
  description: string;
  status: SafetyCaseStatus;
  createdAt: string;
  updatedAt: string;
  evidence: SafetyEvidence[];
  adminNote?: string | null;
}

export interface SafetyGuideArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
}
