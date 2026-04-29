"use client";

import { createContext, ReactNode, useContext, useMemo, useSyncExternalStore } from "react";

import { useDemoRole } from "@/components/demo-role/demo-role";

const SUBSCRIPTION_STORAGE_KEY = "classifieds-subscription";
const STORE_PLAN_STORAGE_KEY = "classifieds-store-plan";
const SUBSCRIPTION_CHANGE_EVENT = "classifieds-subscription-change";

type BuyerStoredPlan = "demo" | "pro";

type SubscriptionStoredState = {
  buyerPlan: BuyerStoredPlan;
  buyerExpiryDate: string | null;
};

export type EffectivePlan = "demo" | "pro" | "business";
export type StorePlan = "basic" | "pro" | "business";

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
const DEFAULT_STORED_STATE_RAW = JSON.stringify(DEFAULT_STORED_STATE);
const DEFAULT_STORE_PLAN: StorePlan = "business";

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
  window.dispatchEvent(new Event(SUBSCRIPTION_CHANGE_EVENT));
}

function readStorePlan(): StorePlan {
  if (typeof window === "undefined") {
    return DEFAULT_STORE_PLAN;
  }
  const raw = window.localStorage.getItem(STORE_PLAN_STORAGE_KEY);
  if (raw === "basic" || raw === "pro" || raw === "business") {
    return raw;
  }
  return DEFAULT_STORE_PLAN;
}

function writeStorePlan(next: StorePlan) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORE_PLAN_STORAGE_KEY, next);
  window.dispatchEvent(new Event(SUBSCRIPTION_CHANGE_EVENT));
}

function computeExpiryDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { role } = useDemoRole();
  const storedStateRaw = useSyncExternalStore(
    (onStoreChange) => {
      const onStorage = (event: StorageEvent) => {
        if (event.key === SUBSCRIPTION_STORAGE_KEY || event.key === null) {
          onStoreChange();
        }
      };
      window.addEventListener("storage", onStorage);
      window.addEventListener(SUBSCRIPTION_CHANGE_EVENT, onStoreChange);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(SUBSCRIPTION_CHANGE_EVENT, onStoreChange);
      };
    },
    () => {
      if (typeof window === "undefined") {
        return DEFAULT_STORED_STATE_RAW;
      }
      return window.localStorage.getItem(SUBSCRIPTION_STORAGE_KEY) ?? DEFAULT_STORED_STATE_RAW;
    },
    () => DEFAULT_STORED_STATE_RAW,
  );
  const storePlan = useSyncExternalStore(
    (onStoreChange) => {
      const onStorage = (event: StorageEvent) => {
        if (event.key === STORE_PLAN_STORAGE_KEY || event.key === null) {
          onStoreChange();
        }
      };
      window.addEventListener("storage", onStorage);
      window.addEventListener(SUBSCRIPTION_CHANGE_EVENT, onStoreChange);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(SUBSCRIPTION_CHANGE_EVENT, onStoreChange);
      };
    },
    () => readStorePlan(),
    () => DEFAULT_STORE_PLAN,
  );
  const storedState = useMemo(() => {
    try {
      const parsed = JSON.parse(storedStateRaw) as SubscriptionStoredState;
      return {
        buyerPlan: parsed.buyerPlan === "pro" ? "pro" : "demo",
        buyerExpiryDate:
          typeof parsed.buyerExpiryDate === "string" || parsed.buyerExpiryDate === null
            ? parsed.buyerExpiryDate
            : null,
      } satisfies SubscriptionStoredState;
    } catch {
      return readStoredState();
    }
  }, [storedStateRaw]);

  const value = useMemo<SubscriptionContextValue>(() => {
    const setStorePlan = (plan: StorePlan) => {
      writeStorePlan(plan);
    };

    const activatePro = () => {
      const next = {
        buyerPlan: "pro" as const,
        buyerExpiryDate: computeExpiryDate(7),
      };
      writeStoredState(next);
    };

    const deactivatePro = () => {
      const next = {
        buyerPlan: "demo" as const,
        buyerExpiryDate: null,
      };
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
