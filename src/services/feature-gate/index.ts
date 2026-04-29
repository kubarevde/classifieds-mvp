import type { Feature, Plan } from "@/entities/billing/model";

export type FeatureGateContext = {
  userId?: string;
  storeId?: string;
  usage?: number;
};

export type GateReason = "plan_restriction" | "limit_reached";

export interface GateResult {
  allowed: boolean;
  reason?: GateReason;
  requiredPlan?: Plan;
  currentPlan?: Plan;
  currentUsage?: number;
  limit?: number;
  featureLabel?: string;
}

export interface FeatureGateService {
  canUse(feature: Feature, context?: FeatureGateContext): boolean;
  getGateResult(feature: Feature, context?: FeatureGateContext): GateResult;
  getLimit(feature: string): number;
  getUpgradeReason(feature: Feature): string;
}

export { createFeatureGateService, createMockFeatureGateService } from "./mock";
