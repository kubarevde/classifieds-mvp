import type { NextWebVitalsMetric } from "next/app";

import { logger } from "./logger";

export function trackWebVital(metric: NextWebVitalsMetric) {
  logger.info("web-vital", {
    name: metric.name,
    value: metric.value,
    id: metric.id,
    label: metric.label,
    attribution: metric.attribution,
  });
}

