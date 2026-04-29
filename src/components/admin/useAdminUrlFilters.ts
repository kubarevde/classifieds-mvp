"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ModerationQueueFilters } from "@/services/moderation";

const DEFAULT_FILTERS: Required<Pick<ModerationQueueFilters, "status" | "priority" | "assignedTo" | "search">> = {
  status: "all",
  priority: "all",
  assignedTo: "all",
  search: "",
};

export function useAdminUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const filters: ModerationQueueFilters = {
    queueType: (params.get("queueType") as ModerationQueueFilters["queueType"]) ?? "all",
    status: (params.get("status") as ModerationQueueFilters["status"]) ?? DEFAULT_FILTERS.status,
    priority: (params.get("priority") as ModerationQueueFilters["priority"]) ?? DEFAULT_FILTERS.priority,
    assignedTo: (params.get("assignedTo") as ModerationQueueFilters["assignedTo"]) ?? DEFAULT_FILTERS.assignedTo,
    search: params.get("search") ?? DEFAULT_FILTERS.search,
  };

  const setFilters = useCallback(
    (next: ModerationQueueFilters) => {
      const nextParams = new URLSearchParams(params.toString());
      const entries: Array<[string, string | null | undefined]> = [
        ["queueType", next.queueType],
        ["status", next.status],
        ["priority", next.priority],
        ["assignedTo", next.assignedTo ? String(next.assignedTo) : undefined],
        ["search", next.search ?? ""],
      ];
      entries.forEach(([key, value]) => {
        if (!value || value === "all") {
          nextParams.delete(key);
          return;
        }
        nextParams.set(key, value);
      });
      router.replace(`${pathname}?${nextParams.toString()}`);
    },
    [params, pathname, router],
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname);
  }, [pathname, router]);

  return { filters, setFilters, resetFilters };
}

