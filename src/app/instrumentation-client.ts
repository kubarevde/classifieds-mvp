import type { NextWebVitalsMetric } from "next/app";

import { trackWebVital } from "@/lib/observability";

export function reportWebVitals(metric: NextWebVitalsMetric) {
  trackWebVital(metric);
}

