import type { AiAssistRequestType } from "@/entities/ai/model";

/** Точка для будущей аналитики / observability; сейчас no-op. */
export function trackAiAssistEvent(type: AiAssistRequestType, success: boolean, meta?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development" && meta) {
    console.debug("[ai-assist]", type, success, meta);
  }
}
