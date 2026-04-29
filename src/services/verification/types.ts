export type VerificationSubjectType = "buyer" | "seller" | "store";

export type VerificationStatus = "not_started" | "pending" | "verified" | "rejected" | "needs_review";

export type VerificationLevel = "basic" | "identity" | "business" | "trusted_plus";

export interface VerificationRequirement {
  id: string;
  key: "email" | "phone" | "identity" | "business_docs" | "address" | "banking";
  title: string;
  description: string;
  completed: boolean;
}

export interface VerificationProfile {
  id: string;
  userId: string;
  subjectType: VerificationSubjectType;
  status: VerificationStatus;
  level: VerificationLevel;
  /** В демо-моках служит для UI и дебага. */
  updatedAt?: string | null;
  verifiedAt?: string | null;
  submittedAt?: string | null;
  rejectionReason?: string | null;
  requirements: VerificationRequirement[];
}

