type LogLevel = "debug" | "info" | "warn" | "error";

type LoggerPayload = Record<string, unknown> | undefined;

function write(level: LogLevel, message: string, payload?: LoggerPayload) {
  const event = {
    level,
    message,
    payload,
    ts: new Date().toISOString(),
  };
  if (level === "error") {
    console.error("[observability]", event);
    return;
  }
  if (level === "warn") {
    console.warn("[observability]", event);
    return;
  }
  console.log("[observability]", event);
}

export const logger = {
  debug(message: string, payload?: LoggerPayload) {
    write("debug", message, payload);
  },
  info(message: string, payload?: LoggerPayload) {
    write("info", message, payload);
  },
  warn(message: string, payload?: LoggerPayload) {
    write("warn", message, payload);
  },
  error(message: string, payload?: LoggerPayload) {
    write("error", message, payload);
  },
};

