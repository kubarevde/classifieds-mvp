import { logger } from "./logger";
import { trackWebVital } from "./web-vitals";

export function captureError(error: unknown, context?: Record<string, unknown>) {
  logger.error("captureError", {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });
}

export function captureMessage(message: string, context?: Record<string, unknown>) {
  logger.info(message, context);
}

export function trackUiEvent(event: string, payload?: Record<string, unknown>) {
  logger.info(`ui:${event}`, payload);
}

export { trackWebVital, logger };

