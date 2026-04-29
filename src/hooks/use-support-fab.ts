"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { useDemoRole } from "@/components/demo-role/demo-role";

export type SupportFabUiState = {
  visible: boolean;
  /** Позиция: справа, inset ≥16px, bottom выше fixed «Демо-режим» / role switcher. */
  positionClassName: string;
};

/**
 * Видимость и позиция FAB поддержки: не пересекаем демо-пульт (правый нижний угол)
 * и экраны с нижней навигацией кабинета / длинными формами.
 */
export function useSupportFabUi(): SupportFabUiState {
  const pathname = usePathname() ?? "";
  const { role, isHydrated } = useDemoRole();

  return useMemo(() => {
    if (!isHydrated || role === "guest") {
      return { visible: false, positionClassName: "" };
    }
    if (pathname.startsWith("/dashboard")) {
      return { visible: false, positionClassName: "" };
    }
    if (pathname.startsWith("/create-listing")) {
      return { visible: false, positionClassName: "" };
    }
    if (pathname.startsWith("/safety/reports/new")) {
      return { visible: false, positionClassName: "" };
    }

    return {
      visible: true,
      positionClassName:
        "right-[max(1rem,env(safe-area-inset-right,0px))] bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)]",
    };
  }, [isHydrated, pathname, role]);
}
