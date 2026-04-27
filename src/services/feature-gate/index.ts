import type { Feature } from "@/entities/billing/model";

export type FeatureGateContext = {
  userId?: string;
  storeId?: string;
};

export interface FeatureGateService {
  canUse(feature: Feature, context?: FeatureGateContext): boolean;
  getLimit(feature: string): number;
  getUpgradeReason(feature: Feature): string;
}

export { createMockFeatureGateService } from "./mock";
