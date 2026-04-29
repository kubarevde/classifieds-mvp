import type { NextWebVitalsMetric } from "next/app";

import { captureEvent } from "@/lib/monitoring";

export function trackWebVital(metric: NextWebVitalsMetric) {
  captureEvent("web_vital", {
    name: metric.name,
    value: metric.value,
    id: metric.id,
    label: metric.label,
    attribution: metric.attribution,
  });
}
