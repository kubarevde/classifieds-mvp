import type { DemoRole } from "@/components/demo-role/demo-role";
import type { EffectivePlan, StorePlan } from "@/components/subscription/subscription-provider";

export type AiLimitContext = {
  role: DemoRole;
  storePlan: StorePlan;
  planName: EffectivePlan;
  isBuyerPro: boolean;
  hasUnlimitedFeature: boolean;
};

/**
 * Дневной лимит AI-запросов: безлимит по фиче, иначе магазин basic = 3,
 * демо-покупатель без Pro = 20 (как «Старт»), остальные с лимитом — через тариф.
 */
export function resolveDailyAiRequestLimit(ctx: AiLimitContext): number {
  if (ctx.hasUnlimitedFeature) {
    return Number.POSITIVE_INFINITY;
  }
  if (ctx.role === "seller" || ctx.role === "all") {
    if (ctx.storePlan === "basic") {
      return 3;
    }
    return 20;
  }
  if (ctx.isBuyerPro || ctx.planName === "pro" || ctx.planName === "business") {
    return Number.POSITIVE_INFINITY;
  }
  if (ctx.planName === "demo") {
    return 20;
  }
  return 3;
}
