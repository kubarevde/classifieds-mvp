import type { ReportTargetType } from "@/services/safety";

export function buildSafetyReportNewUrl(params: {
  targetType: ReportTargetType;
  targetId?: string | null;
  targetLabel?: string | null;
}): string {
  const q = new URLSearchParams();
  q.set("targetType", params.targetType);
  if (params.targetId) {
    q.set("targetId", params.targetId);
  }
  if (params.targetLabel) {
    q.set("targetLabel", params.targetLabel);
  }
  return `/safety/reports/new?${q.toString()}`;
}
