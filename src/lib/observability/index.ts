/**
 * @deprecated Импортируйте из `@/lib/monitoring` и `@/lib/logger`.
 * Оставлено для постепенной миграции.
 */
import { captureEvent, captureException } from "@/lib/monitoring";
import { logger } from "@/lib/logger";

import { trackWebVital } from "./web-vitals";

export function captureError(error: unknown, context?: Record<string, unknown>) {
  captureException(error, context);
}

export function captureMessage(message: string, context?: Record<string, unknown>) {
  captureEvent("app.message", { message, ...context });
}

export { captureException, captureEvent, logger, trackWebVital };
