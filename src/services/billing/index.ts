import type { BillingState, Plan, SubscriptionPlan } from "@/entities/billing/model";

export type PaymentRecord = {
  id: string;
  storeId: string;
  createdAt: string;
  amount: number;
  currency: "RUB";
  status: "paid" | "failed" | "pending";
  method: "card";
  description: string;
};

export type InvoiceRecord = {
  id: string;
  storeId: string;
  createdAt: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  currency: "RUB";
  status: "paid" | "open" | "void";
  number: string;
};

export type ChangePlanInput = {
  plan: Plan;
  billingCycle: "monthly" | "annual";
  storeId?: string;
};

export interface BillingService {
  getPlans(): Promise<SubscriptionPlan[]>;
  getCurrentBillingState(storeId?: string): Promise<BillingState>;
  getPaymentHistory(storeId?: string): Promise<PaymentRecord[]>;
  getInvoices(storeId?: string): Promise<InvoiceRecord[]>;
  changePlan(input: ChangePlanInput): Promise<BillingState>;
}

export { mockBillingService } from "./mock";
