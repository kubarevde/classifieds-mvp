export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogPayload = Record<string, unknown> | undefined;

const PREFIX = "[classifieds]";

function write(level: LogLevel, message: string, payload?: LogPayload) {
  const event = {
    level,
    message,
    payload,
    ts: new Date().toISOString(),
  };
  if (level === "error") {
    console.error(PREFIX, event);
    return;
  }
  if (level === "warn") {
    console.warn(PREFIX, event);
    return;
  }
  if (level === "debug") {
    if (process.env.NODE_ENV === "development") {
      console.debug(PREFIX, event);
    }
    return;
  }
  console.log(PREFIX, event);
}

/**
 * Единый логгер приложения. Консоль сейчас — транспорт по умолчанию;
 * позже можно подменить sink (Logflare, структурный JSON в edge, и т.д.).
 */
export const logger = {
  debug(message: string, payload?: LogPayload) {
    write("debug", message, payload);
  },
  info(message: string, payload?: LogPayload) {
    write("info", message, payload);
  },
  warn(message: string, payload?: LogPayload) {
    write("warn", message, payload);
  },
  error(message: string, payload?: LogPayload) {
    write("error", message, payload);
  },
};
