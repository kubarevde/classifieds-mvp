"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type DemoRole = "guest" | "buyer" | "seller" | "all";

type DemoRoleOption = {
  id: DemoRole;
  label: string;
  shortLabel: string;
};

type DemoRoleContextValue = {
  role: DemoRole;
  isHydrated: boolean;
  setRole: (nextRole: DemoRole) => void;
};

type DemoRoleProviderProps = {
  children: ReactNode;
};

type DemoRoleGuardProps = {
  allowedRoles: DemoRole[];
  title: string;
  description: string;
  ctaRoles?: DemoRole[];
  children: ReactNode;
};

const STORAGE_KEY = "classifieds-demo-role";
const DEFAULT_ROLE: DemoRole = "all";

const roleOptions: DemoRoleOption[] = [
  { id: "all", label: "Всё вместе", shortLabel: "ALL" },
  { id: "guest", label: "Гость", shortLabel: "Guest" },
  { id: "buyer", label: "Покупатель", shortLabel: "Buyer" },
  { id: "seller", label: "Продавец / Магазин", shortLabel: "Seller" },
];

const roleNameById: Record<DemoRole, string> = {
  all: "Демо",
  guest: "Гость",
  buyer: "Дмитрий П.",
  seller: "АгроТех Торговый двор",
};

const roleContext = createContext<DemoRoleContextValue | null>(null);

function normalizeRole(value: string | null): DemoRole {
  if (value === "guest" || value === "buyer" || value === "seller" || value === "all") {
    return value;
  }
  return DEFAULT_ROLE;
}

function persistRole(nextRole: DemoRole) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, nextRole);
}

export function DemoRoleProvider({ children }: DemoRoleProviderProps) {
  const [role, setRoleState] = useState<DemoRole>(DEFAULT_ROLE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = normalizeRole(window.localStorage.getItem(STORAGE_KEY));
    setRoleState(saved);
    setIsHydrated(true);
  }, []);

  const setRole = (nextRole: DemoRole) => {
    setRoleState(nextRole);
    persistRole(nextRole);
  };

  const value = useMemo(
    () => ({
      role,
      isHydrated,
      setRole,
    }),
    [role, isHydrated],
  );

  return <roleContext.Provider value={value}>{children}</roleContext.Provider>;
}

export function useDemoRole() {
  const context = useContext(roleContext);

  if (!context) {
    throw new Error("useDemoRole must be used inside DemoRoleProvider");
  }

  return context;
}

function RoleBadge({ role }: { role: DemoRole }) {
  const option = roleOptions.find((item) => item.id === role) ?? roleOptions[0];
  return (
    <span className="inline-flex h-6 min-w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
      {option.shortLabel}
    </span>
  );
}

function DemoRoleOptionList({
  activeRole,
  setRole,
}: {
  activeRole: DemoRole;
  setRole: (nextRole: DemoRole) => void;
}) {
  return (
    <ul className="space-y-0.5">
      {roleOptions.map((option) => {
        const isActive = option.id === activeRole;
        return (
          <li key={option.id}>
            <button
              type="button"
              onClick={() => setRole(option.id)}
              className={[
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition",
                isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              <span>{option.label}</span>
              <span
                className={[
                  "text-[11px] uppercase tracking-wide",
                  isActive ? "text-white/80" : "text-slate-500",
                ].join(" ")}
              >
                {option.shortLabel}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function DemoRoleFloatingControl() {
  const { role, isHydrated, setRole } = useDemoRole();
  const effectiveRole = isHydrated ? role : DEFAULT_ROLE;
  const activeOption = roleOptions.find((item) => item.id === effectiveRole) ?? roleOptions[0];

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <details className="pointer-events-auto relative">
        <summary className="flex h-11 cursor-pointer list-none items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-3 text-xs font-medium text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur">
          <span className="hidden text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:inline">
            Демо-режим
          </span>
          <RoleBadge role={effectiveRole} />
          <span className="max-w-[126px] truncate text-sm text-slate-800">{activeOption.label}</span>
        </summary>

        <div className="absolute bottom-14 right-0 z-50 w-[280px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/15">
          <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Переключить роль
          </p>
          <DemoRoleOptionList activeRole={effectiveRole} setRole={setRole} />
        </div>
      </details>
    </div>
  );
}

function roleButtonText(role: DemoRole) {
  if (role === "buyer") {
    return "Переключиться в buyer";
  }
  if (role === "seller") {
    return "Переключиться в seller";
  }
  return "Переключиться в all";
}

export function DemoRoleGuard({
  allowedRoles,
  title,
  description,
  ctaRoles = [],
  children,
}: DemoRoleGuardProps) {
  const { role, isHydrated, setRole } = useDemoRole();

  if (!isHydrated) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Проверяем демо-роль...
      </div>
    );
  }

  if (allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
        Демо-режим
      </p>
      <h2 className="mt-3 text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
      {ctaRoles.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {ctaRoles.map((ctaRole) => (
            <button
              key={ctaRole}
              type="button"
              onClick={() => setRole(ctaRole)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {roleButtonText(ctaRole)}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function getDemoDisplayName(role: DemoRole) {
  return roleNameById[role];
}
