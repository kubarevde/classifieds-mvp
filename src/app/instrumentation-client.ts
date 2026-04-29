import type { NextWebVitalsMetric } from "next/app";

import { trackWebVital } from "@/lib/observability/web-vitals";

/** Next.js вызывает при наличии `instrumentation-client` — метрики уходят в `monitoring` через `trackWebVital`. */
export function reportWebVitals(metric: NextWebVitalsMetric) {
  trackWebVital(metric);
}

