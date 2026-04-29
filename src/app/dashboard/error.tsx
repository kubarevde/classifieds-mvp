"use client";

import { RouteErrorView } from "@/components/platform/route-error-view";

export default function DashboardSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorView error={error} reset={reset} segment="dashboard" />;
}
