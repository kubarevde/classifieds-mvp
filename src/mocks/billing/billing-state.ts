import type { BillingState } from "@/entities/billing/model";

export const billingStateMock: BillingState = {
  currentPlan: "starter",
  billingCycle: "monthly",
  trialEndsAt: null,
  subscriptionStatus: "active",
  usage: {
    active_listings: 10,
    boosts_used_this_month: 3,
    featured_days_used_this_month: 2,
    campaigns_active: 1,
    team_members: 1,
  },
  nextInvoiceAt: new Date("2026-05-12T08:00:00.000Z"),
};
