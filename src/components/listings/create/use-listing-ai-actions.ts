"use client";

import { useCallback, useRef, useState } from "react";

import type { AiAssistRequestType } from "@/entities/ai/model";
import { trackAiAssistEvent } from "@/hooks/useAiUsageEvents";
import { useAiUsageStore } from "@/stores/ai-usage-store";

export type AiActionError = { message: string; retry?: () => void };

export function useListingAiActions(dailyLimit: number) {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [lastError, setLastError] = useState<AiActionError | null>(null);
  const busyLock = useRef(false);
  const canUseAi = useAiUsageStore((s) => s.canUseAi);
  const registerUsage = useAiUsageStore((s) => s.registerUsage);
  const resetIfNewDay = useAiUsageStore((s) => s.resetIfNewDay);

  const guard = useCallback(() => {
    resetIfNewDay();
    return canUseAi(dailyLimit);
  }, [canUseAi, dailyLimit, resetIfNewDay]);

  const run = useCallback(
    async <T,>(key: string, type: AiAssistRequestType, fn: () => Promise<T>): Promise<T | null> => {
      const g = guard();
      if (!g.ok) {
        trackAiAssistEvent(type, false, { reason: g.reason });
        return null;
      }
      if (busyLock.current) {
        return null;
      }
      busyLock.current = true;
      setBusyKey(key);
      setLastError(null);
      try {
        const out = await fn();
        registerUsage(type);
        trackAiAssistEvent(type, true);
        return out;
      } catch (e) {
        const message = e instanceof Error ? e.message : "Не удалось выполнить запрос";
        setLastError({
          message,
          retry: () => {
            void (async () => {
              const g2 = guard();
              if (!g2.ok) {
                trackAiAssistEvent(type, false, { reason: g2.reason });
                return;
              }
              if (busyLock.current) return;
              busyLock.current = true;
              setBusyKey(key);
              setLastError(null);
              try {
                const out2 = await fn();
                registerUsage(type);
                trackAiAssistEvent(type, true);
                setLastError(null);
                return out2;
              } catch (e2) {
                const m2 = e2 instanceof Error ? e2.message : message;
                setLastError({ message: m2 });
                trackAiAssistEvent(type, false, { error: m2 });
              } finally {
                busyLock.current = false;
                setBusyKey(null);
              }
            })();
          },
        });
        trackAiAssistEvent(type, false, { error: message });
        return null;
      } finally {
        busyLock.current = false;
        setBusyKey(null);
      }
    },
    [guard, registerUsage],
  );

  return { busyKey, lastError, setLastError, run, guard };
}
