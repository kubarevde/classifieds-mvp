import { logger } from "./logger";

export type MonitoringContext = Record<string, unknown> | undefined;

/**
 * Центральная точка для ошибок.
 * TODO: подключить Sentry — `Sentry.captureException(error, { extra: context })`,
 * плюс scrubbing PII и sampling в production.
 */
export function captureException(error: unknown, context?: MonitoringContext) {
  const normalized =
    error instanceof Error ? error : new Error(typeof error === "string" ? error : JSON.stringify(error));
  logger.error("exception", {
    name: normalized.name,
    message: normalized.message,
    stack: normalized.stack,
    cause: normalized.cause,
    ...context,
  });
}

/**
 * События и метрики (web vitals, бизнес-события, breadcrumbs).
 * TODO: Sentry — `Sentry.captureMessage` / breadcrumbs / custom metrics по политике продукта.
 */
export function captureEvent(name: string, data?: MonitoringContext) {
  logger.info(`event:${name}`, data);
}
