"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";

import { useDemoRole } from "@/components/demo-role/demo-role";

const SUBSCRIPTION_STORAGE_KEY = "classifieds-subscription";
const STORE_PLAN_STORAGE_KEY = "classifieds-store-plan";

type BuyerStoredPlan = "demo" | "pro";

type SubscriptionStoredState = {
  buyerPlan: BuyerStoredPlan;
  buyerExpiryDate: string | null;
};

type EffectivePlan = "demo" | "pro" | "business";
type StorePlan = "basic" | "pro" | "business";

type SubscriptionContextValue = {
  isPro: boolean;
  planName: EffectivePlan;
  expiryDate: string | null;
  storePlan: StorePlan;
  setStorePlan: (plan: StorePlan) => void;
  activatePro: () => void;
  deactivatePro: () => void;
};

const DEFAULT_STORED_STATE: SubscriptionStoredState = {
  buyerPlan: "demo",
  buyerExpiryDate: null,
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

function readStoredState(): SubscriptionStoredState {
  if (typeof window === "undefined") {
    return DEFAULT_STORED_STATE;
  }
  const raw = window.localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_STORED_STATE;
  }
  try {
    const parsed = JSON.parse(raw) as SubscriptionStoredState;
    return {
      buyerPlan: parsed.buyerPlan === "pro" ? "pro" : "demo",
      buyerExpiryDate:
        typeof parsed.buyerExpiryDate === "string" || parsed.buyerExpiryDate === null
          ? parsed.buyerExpiryDate
          : null,
    };
  } catch {
    return DEFAULT_STORED_STATE;
  }
}

function writeStoredState(next: SubscriptionStoredState) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(next));
}

function readStorePlan(): StorePlan {
  if (typeof window === "undefined") {
    return "business";
  }
  const raw = window.localStorage.getItem(STORE_PLAN_STORAGE_KEY);
  if (raw === "basic" || raw === "pro" || raw === "business") {
    return raw;
  }
  return "business";
}

function writeStorePlan(next: StorePlan) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORE_PLAN_STORAGE_KEY, next);
}

function computeExpiryDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { role } = useDemoRole();
  const [storedState, setStoredState] = useState<SubscriptionStoredState>(() => readStoredState());
  const [storePlan, setStorePlanState] = useState<StorePlan>(() => readStorePlan());

  const value = useMemo<SubscriptionContextValue>(() => {
    const setStorePlan = (plan: StorePlan) => {
      setStorePlanState(plan);
      writeStorePlan(plan);
    };

    const activatePro = () => {
      const next = {
        buyerPlan: "pro" as const,
        buyerExpiryDate: computeExpiryDate(7),
      };
      setStoredState(next);
      writeStoredState(next);
    };

    const deactivatePro = () => {
      const next = {
        buyerPlan: "demo" as const,
        buyerExpiryDate: null,
      };
      setStoredState(next);
      writeStoredState(next);
    };

    if (role === "seller") {
      return {
        isPro: true,
        planName: "business",
        expiryDate: null,
        storePlan,
        setStorePlan,
        activatePro,
        deactivatePro,
      };
    }

    if (role === "all") {
      return {
        isPro: true,
        planName: "pro",
        expiryDate: storedState.buyerExpiryDate,
        storePlan,
        setStorePlan,
        activatePro,
        deactivatePro,
      };
    }

    return {
      isPro: storedState.buyerPlan === "pro",
      planName: storedState.buyerPlan,
      expiryDate: storedState.buyerExpiryDate,
      storePlan,
      setStorePlan,
      activatePro,
      deactivatePro,
    };
  }, [role, storePlan, storedState]);

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return context;
}
