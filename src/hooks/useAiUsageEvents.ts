import type { AiAssistRequestType } from "@/entities/ai/model";

import { captureEvent } from "@/lib/monitoring";

/** Точка для аналитики / observability; сейчас уходит в monitoring.captureEvent. */
export function trackAiAssistEvent(type: AiAssistRequestType, success: boolean, meta?: Record<string, unknown>) {
  captureEvent("ai_assist.usage", { type, success, ...meta });
}
