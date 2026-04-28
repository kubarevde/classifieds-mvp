import type { BillingState, SubscriptionPlan } from "@/entities/billing/model";
import { billingStateMock } from "@/mocks/billing/billing-state";
import { paymentHistoryMock, invoicesMock } from "@/mocks/billing/payments";
import { billingPlansMock } from "@/mocks/billing/plans";

import type { BillingService, ChangePlanInput, InvoiceRecord, PaymentRecord } from "./index";

type StoreBillingData = {
  state: BillingState;
  plans: SubscriptionPlan[];
  payments: PaymentRecord[];
  invoices: InvoiceRecord[];
};

const dataByStore = new Map<string, StoreBillingData>();

function getStoreKey(storeId?: string) {
  return storeId ?? "store-demo";
}

function getOrCreateStoreData(storeId?: string): StoreBillingData {
  const key = getStoreKey(storeId);
  const existing = dataByStore.get(key);
  if (existing) {
    return existing;
  }
  const created: StoreBillingData = {
    state: structuredClone(billingStateMock),
    plans: structuredClone(billingPlansMock),
    payments: structuredClone(paymentHistoryMock),
    invoices: structuredClone(invoicesMock),
  };
  dataByStore.set(key, created);
  return created;
}

export const mockBillingService: BillingService = {
  async getPlans() {
    return structuredClone(billingPlansMock);
  },

  async getCurrentBillingState(storeId) {
    return structuredClone(getOrCreateStoreData(storeId).state);
  },

  async getPaymentHistory(storeId) {
    return structuredClone(getOrCreateStoreData(storeId).payments);
  },

  async getInvoices(storeId) {
    return structuredClone(getOrCreateStoreData(storeId).invoices);
  },

  async changePlan(input: ChangePlanInput) {
    const data = getOrCreateStoreData(input.storeId);
    data.state.currentPlan = input.plan;
    data.state.billingCycle = input.billingCycle;
    data.state.subscriptionStatus = "active";
    data.state.nextInvoiceAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    return structuredClone(data.state);
  },
};
