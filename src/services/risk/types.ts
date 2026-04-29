export type RiskLevel = "low" | "medium" | "high";

export type RiskSignalType =
  | "new_seller_high_value_item"
  | "price_too_low"
  | "unverified_store"
  | "off_platform_payment"
  | "off_platform_contact"
  | "suspicious_message_pattern"
  | "duplicate_listing"
  | "high_risk_category";

export interface RiskSignal {
  id: string;
  type: RiskSignalType;
  level: RiskLevel;
  title: string;
  description: string;
  recommendation: string;
}

export type TransactionSafetyChecklistItem = {
  id: string;
  text: string;
};

