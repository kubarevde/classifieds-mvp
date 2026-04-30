"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

import { useDemoRole } from "@/components/demo-role/demo-role";
import { resolveAdminPersona, type AdminPersona } from "@/lib/admin-access";
import { appendInternalAccessToHref } from "@/lib/admin-internal-query";

type AdminConsoleContextValue = {
  persona: AdminPersona;
  demoRoleLabel: string;
  /** Добавить `?internalAccess=` к внутренним ссылкам админки. */
  appendAdminHref: (href: string) => string;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
};

export const AdminConsoleContext = createContext<AdminConsoleContextValue | null>(null);

export function AdminConsoleProvider({ children }: { children: ReactNode }) {
  const { role, isHydrated } = useDemoRole();
  const searchParams = useSearchParams();
  const internalAccess = searchParams.get("internalAccess");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const appendAdminHref = useCallback((href: string) => appendInternalAccessToHref(href, internalAccess), [internalAccess]);

  const toggleCommandPalette = useCallback(() => {
    setCommandPaletteOpen((v) => !v);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && commandPaletteOpen) {
        setCommandPaletteOpen(false);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        const el = e.target as HTMLElement | null;
        const tag = el?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || el?.isContentEditable) {
          return;
        }
        e.preventDefault();
        setCommandPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commandPaletteOpen]);

  const value = useMemo<AdminConsoleContextValue>(() => {
    const persona = isHydrated ? resolveAdminPersona(role, internalAccess) : "none";
    return {
      persona,
      demoRoleLabel: role,
      appendAdminHref,
      commandPaletteOpen,
      setCommandPaletteOpen,
      toggleCommandPalette,
    };
  }, [role, internalAccess, isHydrated, appendAdminHref, commandPaletteOpen, toggleCommandPalette]);

  return <AdminConsoleContext.Provider value={value}>{children}</AdminConsoleContext.Provider>;
}

export function useAdminConsole() {
  const ctx = useContext(AdminConsoleContext);
  if (!ctx) {
    throw new Error("useAdminConsole must be used within AdminConsoleProvider");
  }
  return ctx;
}

export function useOptionalAdminConsole() {
  return useContext(AdminConsoleContext);
}
