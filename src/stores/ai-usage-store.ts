"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AiAssistRequestType, AiUsageCheckResult } from "@/entities/ai/model";

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type AiUsageState = {
  dayKey: string;
  byType: Partial<Record<AiAssistRequestType, number>>;
  sessionCount: number;
  resetIfNewDay: () => void;
  registerUsage: (type: AiAssistRequestType) => void;
  canUseAi: (dailyLimit: number) => AiUsageCheckResult;
  perSessionCount: () => number;
  totalToday: () => number;
};

export const useAiUsageStore = create<AiUsageState>()(
  persist(
    (set, get) => ({
      dayKey: todayKey(),
      byType: {},
      sessionCount: 0,

      resetIfNewDay: () => {
        const key = todayKey();
        if (get().dayKey !== key) {
          set({ dayKey: key, byType: {}, sessionCount: 0 });
        }
      },

      registerUsage: (type) => {
        get().resetIfNewDay();
        set((s) => {
          const nextBy = { ...s.byType, [type]: (s.byType[type] ?? 0) + 1 };
          return {
            byType: nextBy,
            sessionCount: s.sessionCount + 1,
            dayKey: s.dayKey,
          };
        });
      },

      canUseAi: (dailyLimit) => {
        get().resetIfNewDay();
        if (dailyLimit === 0) {
          return { ok: false, reason: "plan_limit", remaining: 0, limit: 0 };
        }
        if (!Number.isFinite(dailyLimit)) {
          return { ok: true, remaining: undefined, limit: undefined };
        }
        const byType = get().byType;
        const used = Object.values(byType).reduce((a, n) => a + (n ?? 0), 0);
        if (used >= dailyLimit) {
          return {
            ok: false,
            reason: "daily_limit",
            remaining: 0,
            limit: dailyLimit,
          };
        }
        return {
          ok: true,
          remaining: dailyLimit - used,
          limit: dailyLimit,
        };
      },

      perSessionCount: () => get().sessionCount,

      totalToday: () => {
        get().resetIfNewDay();
        const byType = get().byType;
        return Object.values(byType).reduce((a, n) => a + (n ?? 0), 0);
      },
    }),
    {
      name: "classifieds:ai-usage",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ dayKey: s.dayKey, byType: s.byType }),
      onRehydrateStorage: () => (state) => {
        state?.resetIfNewDay();
      },
    },
  ),
);
